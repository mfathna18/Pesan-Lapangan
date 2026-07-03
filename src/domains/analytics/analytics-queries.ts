export function buildOwnerBookingFilter(ownerId: string) {
  return {
    court: {
      gor: {
        ownerId,
      },
    },
  };
}

export function buildOwnerPaymentFilter(ownerId: string) {
  return {
    booking: {
      court: {
        gor: {
          ownerId,
        },
      },
    },
  };
}

export function buildOwnerCourtFilter(ownerId: string) {
  return {
    gor: {
      ownerId,
    },
  };
}

export function buildOwnerInvoiceFilter(ownerId: string) {
  return {
    payment: {
      booking: {
        court: {
          gor: {
            ownerId,
          },
        },
      },
    },
  };
}
