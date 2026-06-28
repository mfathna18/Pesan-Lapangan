import { MidtransError } from "midtrans-client";
import type { Snap } from "midtrans-client";

import { PaymentGatewayError } from "@/domains/payment/errors";
import type {
  CreateGatewayTransactionInput,
  CreateGatewayTransactionResult,
  MidtransCallbackSignaturePayload,
  PaymentGateway,
} from "@/domains/payment/gateway/payment-gateway";

import { createMidtransSnapClient } from "./midtrans-client";
import { verifyMidtransSignature } from "./midtrans-signature";

export class MidtransGateway implements PaymentGateway {
  constructor(private readonly snap: Snap = createMidtransSnapClient()) {}

  async createTransaction(
    input: CreateGatewayTransactionInput,
  ): Promise<CreateGatewayTransactionResult> {
    try {
      const response = await this.snap.createTransaction({
        transaction_details: {
          order_id: input.orderId,
          gross_amount: input.amount,
        },
        credit_card: {
          secure: true,
        },
        customer_details: {
          first_name: input.customerName,
          phone: input.customerPhone,
        },
      });

      return {
        paymentUrl: response.redirect_url,
        token: response.token,
        transactionId: input.orderId,
      };
    } catch (error) {
      throw this.toGatewayError(error);
    }
  }

  verifyCallbackSignature(payload: MidtransCallbackSignaturePayload): boolean {
    return verifyMidtransSignature(payload);
  }

  private toGatewayError(error: unknown): PaymentGatewayError {
    if (error instanceof MidtransError) {
      return new PaymentGatewayError(
        error.message,
        error.httpStatusCode,
        error.ApiResponse,
      );
    }

    if (error instanceof Error) {
      return new PaymentGatewayError(error.message);
    }

    return new PaymentGatewayError("Midtrans transaction failed");
  }
}

export function createMidtransGateway(snap?: Snap): MidtransGateway {
  return new MidtransGateway(snap);
}
