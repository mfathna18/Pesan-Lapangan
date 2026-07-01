export class GorNotFoundError extends Error {
  constructor(message = "GOR tidak ditemukan.") {
    super(message);
    this.name = "GorNotFoundError";
  }
}

export class OwnerNotFoundError extends Error {
  constructor(message = "Profil pemilik tidak ditemukan.") {
    super(message);
    this.name = "OwnerNotFoundError";
  }
}

export class GorSlugConflictError extends Error {
  constructor(message = "Slug GOR sudah digunakan.") {
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
