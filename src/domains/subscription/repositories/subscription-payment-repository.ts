import type { SubscriptionPaymentRecord } from "@/domains/subscription/types";
import type {
  PaymentStatus,
  PrismaClient,
  SubscriptionBillingAction,
  SubscriptionPlan,
} from "@/generated/prisma/client";

const subscriptionPaymentSelect = {
  id: true,
  subscriptionId: true,
  amount: true,
  status: true,
  paymentMethod: true,
  targetPlan: true,
  billingAction: true,
  externalReference: true,
  paidAt: true,
  expiresAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

export type CreateSubscriptionPaymentRecordInput = {
  subscriptionId: string;
  amount: number;
  targetPlan: SubscriptionPlan;
  billingAction: SubscriptionBillingAction;
  expiresAt?: Date | null;
};

export type UpdateSubscriptionPaymentInput = {
  id: string;
  status?: PaymentStatus;
  externalReference?: string | null;
  paidAt?: Date | null;
  expiresAt?: Date | null;
};

export class SubscriptionPaymentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(
    input: CreateSubscriptionPaymentRecordInput,
  ): Promise<SubscriptionPaymentRecord> {
    return this.prisma.subscriptionPayment.create({
      data: {
        subscriptionId: input.subscriptionId,
        amount: input.amount,
        targetPlan: input.targetPlan,
        billingAction: input.billingAction,
        expiresAt: input.expiresAt ?? null,
      },
      select: subscriptionPaymentSelect,
    });
  }

  async findById(id: string): Promise<SubscriptionPaymentRecord | null> {
    return this.prisma.subscriptionPayment.findUnique({
      where: { id },
      select: subscriptionPaymentSelect,
    });
  }

  async findPendingBySubscriptionId(
    subscriptionId: string,
  ): Promise<SubscriptionPaymentRecord | null> {
    return this.prisma.subscriptionPayment.findFirst({
      where: {
        subscriptionId,
        status: "PENDING",
      },
      orderBy: { createdAt: "desc" },
      select: subscriptionPaymentSelect,
    });
  }

  async listBySubscriptionId(
    subscriptionId: string,
    limit = 20,
  ): Promise<SubscriptionPaymentRecord[]> {
    return this.prisma.subscriptionPayment.findMany({
      where: { subscriptionId },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: subscriptionPaymentSelect,
    });
  }

  async update(
    input: UpdateSubscriptionPaymentInput,
  ): Promise<SubscriptionPaymentRecord> {
    return this.prisma.subscriptionPayment.update({
      where: { id: input.id },
      data: {
        ...(input.status !== undefined ? { status: input.status } : {}),
        ...(input.externalReference !== undefined
          ? { externalReference: input.externalReference }
          : {}),
        ...(input.paidAt !== undefined ? { paidAt: input.paidAt } : {}),
        ...(input.expiresAt !== undefined
          ? { expiresAt: input.expiresAt }
          : {}),
      },
      select: subscriptionPaymentSelect,
    });
  }
}

export function createSubscriptionPaymentRepository(
  prisma: PrismaClient,
): SubscriptionPaymentRepository {
  return new SubscriptionPaymentRepository(prisma);
}
