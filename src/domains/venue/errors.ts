export class VenueNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "VenueNotFoundError";
  }
}
