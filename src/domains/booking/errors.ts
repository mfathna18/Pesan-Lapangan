export class BookingValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BookingValidationError";
  }
}

export class BookingNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BookingNotFoundError";
  }
}

export class CourtNotFoundError extends Error {
  constructor(message = "Lapangan tidak ditemukan.") {
    super(message);
    this.name = "CourtNotFoundError";
  }
}

export class CourtValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CourtValidationError";
  }
}

export class PriceRuleNotFoundError extends Error {
  constructor(message = "Aturan harga tidak ditemukan.") {
    super(message);
    this.name = "PriceRuleNotFoundError";
  }
}

export class PriceRuleValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PriceRuleValidationError";
  }
}
