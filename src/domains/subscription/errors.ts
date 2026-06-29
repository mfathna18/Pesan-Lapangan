export class SubscriptionNotFoundError extends Error {
  constructor(message = "Subscription not found.") {
    super(message);
    this.name = "SubscriptionNotFoundError";
  }
}

export class OwnerSubscriptionNotFoundError extends Error {
  constructor(message = "Owner subscription not found.") {
    super(message);
    this.name = "OwnerSubscriptionNotFoundError";
  }
}
