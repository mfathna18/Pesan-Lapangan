export type CreateGatewayTransactionInput = {
  orderId: string;
  amount: number;
  customerName: string;
  customerPhone: string;
};

export type CreateGatewayTransactionResult = {
  paymentUrl: string;
  token: string;
  transactionId: string;
};

export type MidtransCallbackSignaturePayload = {
  order_id: string;
  status_code: string;
  gross_amount: string;
  signature_key: string;
};

export interface PaymentGateway {
  createTransaction(
    input: CreateGatewayTransactionInput,
  ): Promise<CreateGatewayTransactionResult>;

  verifyCallbackSignature(payload: MidtransCallbackSignaturePayload): boolean;
}
