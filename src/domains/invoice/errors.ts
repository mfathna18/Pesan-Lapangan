export class InvoiceValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvoiceValidationError";
  }
}

export class InvoiceNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvoiceNotFoundError";
  }
}

export class InvoiceAlreadyExistsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvoiceAlreadyExistsError";
  }
}

export class PublicInvoiceNotFoundError extends Error {
  constructor(message = "Invoice tidak ditemukan.") {
    super(message);
    this.name = "PublicInvoiceNotFoundError";
  }
}
