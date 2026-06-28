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

export interface PaymentGateway {
  createTransaction(
    input: CreateGatewayTransactionInput,
  ): Promise<CreateGatewayTransactionResult>;
}
