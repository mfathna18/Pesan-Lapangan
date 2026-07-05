export class MediaValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MediaValidationError";
  }
}

export class MediaStorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MediaStorageError";
  }
}

export class MediaAuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MediaAuthorizationError";
  }
}
