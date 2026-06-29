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
  constructor(message = "Court not found.") {
    super(message);
    this.name = "CourtNotFoundError";
  }
}
