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
