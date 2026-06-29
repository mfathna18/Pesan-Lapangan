import { siteConfig } from "@/config/site";
import { PAYMENT_STATUS } from "@/domains/payment/constants";
import {
  PaymentGatewayError,
  PaymentInvalidSignatureError,
} from "@/domains/payment/errors";
import type { PaymentGateway } from "@/domains/payment/gateway/payment-gateway";
import { createMidtransGateway } from "@/domains/payment/gateway/midtrans-gateway";
import {
  parseMidtransTransactionTime,
  resolveMidtransCallbackStatus,
} from "@/domains/payment/utils/midtrans-callback-status";
import {
  SUBSCRIPTION_BILLING_ACTION,
  SUBSCRIPTION_BILLING_ACTION_LABELS,
  SUBSCRIPTION_ACCESS_DENIED_MESSAGE,
  SUBSCRIPTION_BOOKING_RECEIVING_DENIED_MESSAGE,
  SUBSCRIPTION_PLAN_LABELS,
  SUBSCRIPTION_STATUS_LABELS,
  SUBSCRIPTION_PAYMENT_STATUS_LABELS,
} from "@/domains/subscription/constants";
import {
  OwnerSubscriptionNotFoundError,
  SubscriptionAccessDeniedError,
  SubscriptionBillingValidationError,
  SubscriptionNotFoundError,
  SubscriptionPaymentNotFoundError,
} from "@/domains/subscription/errors";
import { SubscriptionPaymentRepository } from "@/domains/subscription/repositories/subscription-payment-repository";
import { createSubscriptionPaymentRepository } from "@/domains/subscription/repositories/subscription-payment-repository";
import {
  createSubscriptionRepository,
  SubscriptionRepository,
} from "@/domains/subscription/repositories/subscription-repository";
import type {
  ActivateSubscriptionInput,
  CreateSubscriptionPaymentInput,
  CreateSubscriptionPaymentResult,
  CurrentSubscriptionData,
  SubscriptionAccessSnapshot,
  SubscriptionBillingHistoryItem,
  SubscriptionMidtransCallbackPayload,
  SubscriptionPaymentRecord,
  SubscriptionRecord,
} from "@/domains/subscription/types";
import {
  buildSubscriptionAccessSnapshot,
  canUseOwnerFeatures,
} from "@/domains/subscription/utils/subscription-access";
import {
  canRenewPlan,
  getNextUpgradePlan,
  getPlanPrice,
  resolveGraceUntil,
  resolveRenewedExpiresAt,
  resolveUpgradeExpiresAt,
} from "@/domains/subscription/utils/subscription-billing";
import type { PrismaClient } from "@/generated/prisma/client";

const SUBSCRIPTION_PAYMENT_PENDING_HOURS = 24;

type SubscriptionServiceDependencies = {
  subscriptionRepository: SubscriptionRepository;
  subscriptionPaymentRepository: SubscriptionPaymentRepository;
  paymentGateway: PaymentGateway;
};

export class SubscriptionService {
  private readonly subscriptionRepository: SubscriptionRepository;
  private readonly subscriptionPaymentRepository: SubscriptionPaymentRepository;
  private readonly paymentGateway: PaymentGateway;

  constructor({
    subscriptionRepository,
    subscriptionPaymentRepository,
    paymentGateway,
  }: SubscriptionServiceDependencies) {
    this.subscriptionRepository = subscriptionRepository;
    this.subscriptionPaymentRepository = subscriptionPaymentRepository;
    this.paymentGateway = paymentGateway;
  }

  async getCurrentSubscription(
    userId: string,
  ): Promise<CurrentSubscriptionData> {
    const ownerId =
      await this.subscriptionRepository.findOwnerIdByUserId(userId);

    if (!ownerId) {
      throw new OwnerSubscriptionNotFoundError();
    }

    let subscription = await this.subscriptionRepository.findByOwnerId(ownerId);

    if (!subscription) {
      subscription =
        await this.subscriptionRepository.createDefaultForOwner(ownerId);
    }

    subscription = await this.expireSubscription(subscription.id);

    const billingHistory =
      await this.subscriptionPaymentRepository.listBySubscriptionId(
        subscription.id,
      );

    return this.toCurrentSubscriptionData(subscription, billingHistory);
  }

  async getSubscriptionAccess(
    userId: string,
  ): Promise<SubscriptionAccessSnapshot> {
    const subscription = await this.getCurrentSubscription(userId);

    return buildSubscriptionAccessSnapshot({
      status: subscription.status,
      statusLabel: subscription.statusLabel,
      graceUntil: subscription.graceUntil,
    });
  }

  async assertOwnerFeatureAccess(userId: string): Promise<void> {
    const access = await this.getSubscriptionAccess(userId);

    if (!access.canUseOwnerFeatures) {
      throw new SubscriptionAccessDeniedError(
        SUBSCRIPTION_ACCESS_DENIED_MESSAGE,
      );
    }
  }

  async assertCanReceiveBookingsForCourt(courtId: string): Promise<void> {
    const ownerId =
      await this.subscriptionRepository.findOwnerIdByCourtId(courtId);

    if (!ownerId) {
      return;
    }

    let subscription = await this.subscriptionRepository.findByOwnerId(ownerId);

    if (!subscription) {
      return;
    }

    subscription = await this.expireSubscription(subscription.id);

    if (!canUseOwnerFeatures(subscription.status)) {
      throw new SubscriptionAccessDeniedError(
        SUBSCRIPTION_BOOKING_RECEIVING_DENIED_MESSAGE,
      );
    }
  }

  async createSubscriptionPayment(
    input: CreateSubscriptionPaymentInput,
  ): Promise<CreateSubscriptionPaymentResult> {
    const billingProfile =
      await this.subscriptionRepository.findBillingProfileByUserId(
        input.userId,
      );

    if (!billingProfile) {
      throw new OwnerSubscriptionNotFoundError();
    }

    let subscription = await this.subscriptionRepository.findByOwnerId(
      billingProfile.ownerId,
    );

    if (!subscription) {
      subscription = await this.subscriptionRepository.createDefaultForOwner(
        billingProfile.ownerId,
      );
    }

    subscription = await this.expireSubscription(subscription.id);

    const targetPlan = this.resolveTargetPlan(
      subscription,
      input.billingAction,
      input.targetPlan,
    );
    const amount = getPlanPrice(targetPlan);

    if (amount <= 0) {
      throw new SubscriptionBillingValidationError(
        "Paket ini tidak memerlukan pembayaran.",
      );
    }

    const pendingPayment =
      await this.subscriptionPaymentRepository.findPendingBySubscriptionId(
        subscription.id,
      );

    if (pendingPayment) {
      throw new SubscriptionBillingValidationError(
        "Masih ada pembayaran langganan yang belum selesai.",
      );
    }

    const paymentExpiresAt = new Date();
    paymentExpiresAt.setHours(
      paymentExpiresAt.getHours() + SUBSCRIPTION_PAYMENT_PENDING_HOURS,
    );

    const subscriptionPayment = await this.subscriptionPaymentRepository.create(
      {
        subscriptionId: subscription.id,
        amount,
        targetPlan,
        billingAction: input.billingAction,
        expiresAt: paymentExpiresAt,
      },
    );

    const waitingUrl = `${siteConfig.url}/dashboard/subscription/waiting?paymentId=${subscriptionPayment.id}`;

    try {
      const gatewayResult = await this.paymentGateway.createTransaction({
        orderId: subscriptionPayment.id,
        amount,
        customerName: billingProfile.customerName,
        customerPhone: billingProfile.customerPhone,
        finishRedirectUrl: waitingUrl,
      });

      await this.subscriptionPaymentRepository.update({
        id: subscriptionPayment.id,
        externalReference: gatewayResult.transactionId,
      });

      return {
        paymentUrl: gatewayResult.paymentUrl,
        token: gatewayResult.token,
        transactionId: gatewayResult.transactionId,
        subscriptionPaymentId: subscriptionPayment.id,
      };
    } catch (error) {
      await this.subscriptionPaymentRepository.update({
        id: subscriptionPayment.id,
        status: PAYMENT_STATUS.FAILED,
      });

      if (error instanceof PaymentGatewayError) {
        throw error;
      }

      throw error;
    }
  }

  async activateSubscription(
    input: ActivateSubscriptionInput,
  ): Promise<SubscriptionRecord> {
    const payment = await this.subscriptionPaymentRepository.findById(
      input.subscriptionPaymentId,
    );

    if (!payment) {
      throw new SubscriptionPaymentNotFoundError();
    }

    if (payment.status === PAYMENT_STATUS.PAID) {
      return this.requireSubscription(payment.subscriptionId);
    }

    const subscription = await this.requireSubscription(payment.subscriptionId);
    const paidAt = input.paidAt ?? new Date();

    await this.subscriptionPaymentRepository.update({
      id: payment.id,
      status: PAYMENT_STATUS.PAID,
      paidAt,
      externalReference: payment.externalReference ?? payment.id,
    });

    if (payment.billingAction === SUBSCRIPTION_BILLING_ACTION.UPGRADE) {
      return this.subscriptionRepository.update(subscription.id, {
        plan: payment.targetPlan,
        status: "ACTIVE",
        expiresAt: resolveUpgradeExpiresAt(paidAt),
        graceUntil: null,
      });
    }

    return this.subscriptionRepository.update(subscription.id, {
      plan: payment.targetPlan,
      status: "ACTIVE",
      expiresAt: resolveRenewedExpiresAt(subscription.expiresAt, paidAt),
      graceUntil: null,
    });
  }

  async expireSubscription(
    subscriptionId: string,
    referenceDate: Date = new Date(),
  ): Promise<SubscriptionRecord> {
    const subscription = await this.requireSubscription(subscriptionId);

    if (
      subscription.status === "CANCELLED" ||
      subscription.status === "EXPIRED"
    ) {
      return subscription;
    }

    if (
      subscription.expiresAt &&
      subscription.expiresAt.getTime() < referenceDate.getTime()
    ) {
      if (subscription.status === "GRACE_PERIOD") {
        if (
          subscription.graceUntil &&
          subscription.graceUntil.getTime() < referenceDate.getTime()
        ) {
          return this.subscriptionRepository.update(subscription.id, {
            status: "EXPIRED",
          });
        }

        return subscription;
      }

      const graceUntil = resolveGraceUntil(subscription.expiresAt);

      if (referenceDate.getTime() <= graceUntil.getTime()) {
        return this.subscriptionRepository.update(subscription.id, {
          status: "GRACE_PERIOD",
          graceUntil,
        });
      }

      return this.subscriptionRepository.update(subscription.id, {
        status: "EXPIRED",
        graceUntil,
      });
    }

    return subscription;
  }

  async handleMidtransCallback(
    payload: SubscriptionMidtransCallbackPayload,
  ): Promise<SubscriptionPaymentRecord | null> {
    if (!this.paymentGateway.verifyCallbackSignature(payload)) {
      throw new PaymentInvalidSignatureError();
    }

    const payment = await this.subscriptionPaymentRepository.findById(
      payload.order_id,
    );

    if (!payment) {
      throw new SubscriptionPaymentNotFoundError();
    }

    const grossAmount = Number(payload.gross_amount);

    if (!Number.isFinite(grossAmount) || grossAmount !== payment.amount) {
      throw new SubscriptionBillingValidationError(
        "Callback gross amount does not match subscription payment amount",
      );
    }

    const resolution = resolveMidtransCallbackStatus(payload);

    switch (resolution) {
      case "paid": {
        await this.activateSubscription({
          subscriptionPaymentId: payment.id,
          paidAt: parseMidtransTransactionTime(payload.transaction_time),
        });

        return this.subscriptionPaymentRepository.findById(payment.id);
      }
      case "expired":
        return this.subscriptionPaymentRepository.update({
          id: payment.id,
          status: PAYMENT_STATUS.EXPIRED,
        });
      case "failed":
        return this.subscriptionPaymentRepository.update({
          id: payment.id,
          status: PAYMENT_STATUS.FAILED,
        });
      case "pending":
      case "ignored":
      default:
        return payment;
    }
  }

  async getSubscriptionPaymentForOwner(
    userId: string,
    paymentId: string,
  ): Promise<{
    payment: SubscriptionPaymentRecord;
    subscription: CurrentSubscriptionData;
  }> {
    const ownerId =
      await this.subscriptionRepository.findOwnerIdByUserId(userId);

    if (!ownerId) {
      throw new OwnerSubscriptionNotFoundError();
    }

    const payment =
      await this.subscriptionPaymentRepository.findById(paymentId);

    if (!payment) {
      throw new SubscriptionPaymentNotFoundError();
    }

    const subscription = await this.requireSubscription(payment.subscriptionId);

    if (subscription.ownerId !== ownerId) {
      throw new SubscriptionPaymentNotFoundError();
    }

    const currentSubscription = await this.getCurrentSubscription(userId);

    return {
      payment,
      subscription: currentSubscription,
    };
  }

  isSubscriptionActive(
    subscription: Pick<
      SubscriptionRecord,
      "status" | "expiresAt" | "graceUntil"
    >,
    referenceDate: Date = new Date(),
  ): boolean {
    if (
      subscription.status === "CANCELLED" ||
      subscription.status === "EXPIRED"
    ) {
      return false;
    }

    if (subscription.status === "GRACE_PERIOD") {
      return this.isWithinGracePeriod(subscription, referenceDate);
    }

    if (
      subscription.expiresAt &&
      subscription.expiresAt.getTime() < referenceDate.getTime()
    ) {
      return this.isWithinGracePeriod(subscription, referenceDate);
    }

    return (
      subscription.status === "TRIAL" ||
      subscription.status === "ACTIVE" ||
      subscription.status === "GRACE_PERIOD"
    );
  }

  isWithinGracePeriod(
    subscription: Pick<SubscriptionRecord, "graceUntil">,
    referenceDate: Date = new Date(),
  ): boolean {
    if (!subscription.graceUntil) {
      return false;
    }

    return referenceDate.getTime() <= subscription.graceUntil.getTime();
  }

  private resolveTargetPlan(
    subscription: SubscriptionRecord,
    billingAction: CreateSubscriptionPaymentInput["billingAction"],
    requestedPlan?: CreateSubscriptionPaymentInput["targetPlan"],
  ) {
    if (billingAction === SUBSCRIPTION_BILLING_ACTION.UPGRADE) {
      const nextPlan = getNextUpgradePlan(subscription.plan);

      if (!nextPlan) {
        throw new SubscriptionBillingValidationError(
          "Tidak ada paket upgrade yang tersedia.",
        );
      }

      if (requestedPlan && requestedPlan !== nextPlan) {
        throw new SubscriptionBillingValidationError(
          "Paket upgrade tidak valid.",
        );
      }

      return nextPlan;
    }

    if (!canRenewPlan(subscription.plan)) {
      throw new SubscriptionBillingValidationError(
        "Paket saat ini tidak dapat diperpanjang.",
      );
    }

    if (requestedPlan && requestedPlan !== subscription.plan) {
      throw new SubscriptionBillingValidationError(
        "Perpanjangan harus menggunakan paket yang sama.",
      );
    }

    return subscription.plan;
  }

  private async requireSubscription(
    subscriptionId: string,
  ): Promise<SubscriptionRecord> {
    const subscription =
      await this.subscriptionRepository.findById(subscriptionId);

    if (!subscription) {
      throw new SubscriptionNotFoundError();
    }

    return subscription;
  }

  private toCurrentSubscriptionData(
    subscription: SubscriptionRecord,
    billingHistory: SubscriptionPaymentRecord[],
  ): CurrentSubscriptionData {
    const isWithinGracePeriod = this.isWithinGracePeriod(subscription);
    const nextUpgradePlan = getNextUpgradePlan(subscription.plan);

    return {
      id: subscription.id,
      ownerId: subscription.ownerId,
      plan: subscription.plan,
      planLabel: SUBSCRIPTION_PLAN_LABELS[subscription.plan],
      status: subscription.status,
      statusLabel: SUBSCRIPTION_STATUS_LABELS[subscription.status],
      startsAt: subscription.startsAt.toISOString(),
      expiresAt: subscription.expiresAt?.toISOString() ?? null,
      graceUntil: subscription.graceUntil?.toISOString() ?? null,
      isActive: this.isSubscriptionActive(subscription),
      isWithinGracePeriod,
      nextUpgradePlan,
      nextUpgradePlanLabel: nextUpgradePlan
        ? SUBSCRIPTION_PLAN_LABELS[nextUpgradePlan]
        : null,
      canRenew: canRenewPlan(subscription.plan),
      billingHistory: billingHistory.map((payment) =>
        this.toBillingHistoryItem(payment),
      ),
    };
  }

  private toBillingHistoryItem(
    payment: SubscriptionPaymentRecord,
  ): SubscriptionBillingHistoryItem {
    return {
      id: payment.id,
      amount: payment.amount,
      status: payment.status,
      statusLabel: SUBSCRIPTION_PAYMENT_STATUS_LABELS[payment.status],
      targetPlan: payment.targetPlan,
      targetPlanLabel: SUBSCRIPTION_PLAN_LABELS[payment.targetPlan],
      billingAction: payment.billingAction,
      billingActionLabel:
        SUBSCRIPTION_BILLING_ACTION_LABELS[payment.billingAction],
      paidAt: payment.paidAt?.toISOString() ?? null,
      createdAt: payment.createdAt.toISOString(),
    };
  }
}

export function createSubscriptionService(
  prisma: PrismaClient,
): SubscriptionService {
  return new SubscriptionService({
    subscriptionRepository: createSubscriptionRepository(prisma),
    subscriptionPaymentRepository: createSubscriptionPaymentRepository(prisma),
    paymentGateway: createMidtransGateway(),
  });
}
