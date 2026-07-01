export class OperatingHoursValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OperatingHoursValidationError";
  }
}
