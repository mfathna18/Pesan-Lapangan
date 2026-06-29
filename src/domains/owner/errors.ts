export class OwnerNotFoundError extends Error {
  constructor(message = "Owner profile not found.") {
    super(message);
    this.name = "OwnerNotFoundError";
  }
}

export class GorSlugConflictError extends Error {
  constructor(message = "GOR slug is already in use.") {
    super(message);
    this.name = "GorSlugConflictError";
  }
}

export class GorProfileValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GorProfileValidationError";
  }
}
