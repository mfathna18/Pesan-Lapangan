export class PublicCheckoutNotFoundError extends Error {
  constructor(message = "Checkout booking not found.") {
    super(message);
    this.name = "PublicCheckoutNotFoundError";
  }
}

export class PaymentValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PaymentValidationError";
  }
}

export class PaymentNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PaymentNotFoundError";
  }
}

export class BookingNotFoundForPaymentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BookingNotFoundForPaymentError";
  }
}

export class PaymentGatewayError extends Error {
  readonly statusCode?: number;
  readonly response?: unknown;

  constructor(message: string, statusCode?: number, response?: unknown) {
    super(message);
    this.name = "PaymentGatewayError";
    this.statusCode = statusCode;
    this.response = response;
  }
}

export class PaymentInvalidSignatureError extends Error {
  constructor(message = "Invalid Midtrans callback signature") {
    super(message);
    this.name = "PaymentInvalidSignatureError";
  }
}
