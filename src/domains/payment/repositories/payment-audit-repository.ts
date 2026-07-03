import type {
  PaymentConfirmationAction,
  PaymentStatus,
  PrismaClient,
} from "@/generated/prisma/client";

type PrismaDbClient =
  | PrismaClient
  | Omit<
      PrismaClient,
      "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends"
    >;

export type CreatePaymentAuditLogInput = {
  paymentId: string;
  actorUserId?: string | null;
  action: PaymentConfirmationAction;
  fromStatus?: PaymentStatus | null;
  toStatus?: PaymentStatus | null;
  note?: string | null;
};

export class PaymentAuditRepository {
  constructor(private readonly prisma: PrismaDbClient) {}

  async create(input: CreatePaymentAuditLogInput) {
    return this.prisma.paymentConfirmationAuditLog.create({
      data: {
        paymentId: input.paymentId,
        actorUserId: input.actorUserId ?? null,
        action: input.action,
        fromStatus: input.fromStatus ?? null,
        toStatus: input.toStatus ?? null,
        note: input.note ?? null,
      },
    });
  }
}

export function createPaymentAuditRepository(
  prisma: PrismaDbClient,
): PaymentAuditRepository {
  return new PaymentAuditRepository(prisma);
}
