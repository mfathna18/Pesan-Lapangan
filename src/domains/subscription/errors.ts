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

export class SubscriptionBillingValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SubscriptionBillingValidationError";
  }
}

export class SubscriptionPaymentNotFoundError extends Error {
  constructor(message = "Subscription payment not found.") {
    super(message);
    this.name = "SubscriptionPaymentNotFoundError";
  }
}
