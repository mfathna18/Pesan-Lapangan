# Manual Payment Confirmation

PesanLapangan is a SaaS platform for sports venue owners. **Booking payments go directly to the owner** (bank transfer or QRIS). PesanLapangan only manages booking status.

Subscription billing remains on **Midtrans → PesanLapangan** and is unchanged.

## Architecture

```
Customer checkout
        │
        ▼
ManualPaymentService.ensureManualPayment()
        │
        ├── Payment (MANUAL_TRANSFER, PENDING)
        └── Gor payment instructions (bank / QRIS)
                │
Customer clicks "Saya Sudah Membayar"
        │
        ▼
ManualPaymentService.submitCustomerConfirmation()
        │
        ├── Payment → AWAITING_CONFIRMATION
        ├── Booking.expiresAt extended (72h owner review window)
        └── PaymentConfirmationAuditLog
                │
Owner approves / rejects
        │
        ├── Approve → PaymentService.markAsPaid()
        │              → bookingWriter.confirmIfPending()
        │              → invoiceService.generateInvoice()
        └── Reject → Payment REJECTED + reason
```

### Key files

| Layer            | Path                                                           |
| ---------------- | -------------------------------------------------------------- |
| Service          | `src/domains/payment/services/manual-payment-service.ts`       |
| Audit            | `src/domains/payment/repositories/payment-audit-repository.ts` |
| Customer actions | `src/domains/payment/actions/submit-manual-payment.action.ts`  |
| Owner actions    | `src/domains/payment/actions/owner-manual-payment.action.ts`   |
| Display status   | `src/domains/payment/utils/customer-payment-status.ts`         |
| Checkout UI      | `src/components/checkout/public-checkout.tsx`                  |
| Owner widget     | `src/components/dashboard/owner-pending-payments-widget.tsx`   |
| Owner detail     | `/dashboard/bookings/[bookingId]/payment`                      |

## Booking flow

1. Customer creates booking → `Booking.status = PENDING`
2. Checkout shows owner bank/QRIS from `Gor` profile
3. Customer transfers offline to owner
4. Customer clicks **Saya Sudah Membayar**
5. Owner verifies bank/QRIS statement
6. Owner approves → booking confirmed + invoice generated
7. Customer sees success page

## Status flow

Internal states combine `Booking.status` + `Payment.status`:

| Display label             | Booking   | Payment                  |
| ------------------------- | --------- | ------------------------ |
| Menunggu Pembayaran       | PENDING   | PENDING                  |
| Menunggu Konfirmasi Owner | PENDING   | AWAITING_CONFIRMATION    |
| Pembayaran Berhasil       | CONFIRMED | PAID                     |
| Pembayaran Ditolak        | PENDING   | REJECTED                 |
| Selesai                   | CONFIRMED | PAID (past booking date) |
| Dibatalkan                | CANCELLED | *                        |

## Security

- Only the venue owner (`court.gor.ownerId`) can approve or reject
- All approve/reject actions write to `PaymentConfirmationAuditLog`
- Audit stores: actor user ID, action, from/to status, note, timestamp
- Customer actions scoped by `gorSlug` + `bookingId`

## Owner configuration

Settings → **Informasi Pembayaran**:

- Bank name, account number, account holder
- QRIS image URL

Shown on customer checkout. At least one method recommended.

## Reminders

If `AWAITING_CONFIRMATION` for **> 12 hours**, owner dashboard shows:

> Segera periksa pembayaran ini.

No automatic approval.

## Expiration

- Initial booking hold: **24 hours** for manual transfer
- After customer confirms: extended to **72 hours** for owner review
- Cron expiry skips bookings with `AWAITING_CONFIRMATION` payments

## Notifications

In-app UI states only (no email/SMS infrastructure yet):

- Customer: checkout banners for each status
- Owner: dashboard widget + payment detail page

## Future: automatic payment gateway

The `PaymentMethod.MIDTRANS` path remains in code for subscription billing. Booking payments can later add optional gateway per venue by:

1. Adding `Gor.acceptedPaymentMethods` flag
2. Branching checkout UI (manual vs gateway)
3. Reusing existing `PaymentService.createPayment()` for gateway path

Manual confirmation audit log and owner workflow remain valid for hybrid venues.
