# Midtrans Sandbox — End-to-End Setup

This guide completes the booking payment lifecycle using **Midtrans Sandbox** with the existing PesanLapangan payment architecture (Snap redirect + HTTP notification callback).

## 1. Environment variables

Copy `.env.example` to `.env` and set. For Vercel deployment, see [DEPLOYMENT.md](./DEPLOYMENT.md).

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
MIDTRANS_SERVER_KEY=SB-Mid-server-...
MIDTRANS_CLIENT_KEY=SB-Mid-client-...
MIDTRANS_IS_PRODUCTION=false
```

Get sandbox keys from [Midtrans Dashboard](https://dashboard.sandbox.midtrans.com) → **Settings → Access Keys**.

`MIDTRANS_IS_PRODUCTION` must be `false` for sandbox.

## 2. Notification URL (webhook)

Midtrans sends payment status to your app after the customer pays.

| Environment | Notification URL                                        |
| ----------- | ------------------------------------------------------- |
| Local dev   | `https://<your-tunnel>/api/payment/midtrans/callback`   |
| Production  | `https://your-domain.com/api/payment/midtrans/callback` |

**Local development:** Midtrans cannot reach `localhost`. Use a tunnel:

- [ngrok](https://ngrok.com): `ngrok http 3000`
- Cloudflare Tunnel, localtunnel, etc.

Register the **HTTPS** tunnel URL in Midtrans Sandbox → **Settings → Configuration → Payment Notification URL**.

Example:

```text
https://abc123.ngrok-free.app/api/payment/midtrans/callback
```

## 3. Payment flow (verification path)

```text
Booking → Checkout → Snap Sandbox → Settlement
    → Callback → Payment PAID → Booking CONFIRMED → Invoice GENERATED
    → Success Page → Owner Dashboard
```

1. Customer creates a booking and opens checkout.
2. **Bayar Sekarang** / **Lanjutkan Pembayaran** creates or reuses a Snap session.
3. Browser redirects to Midtrans Snap (sandbox).
4. After payment, Midtrans redirects to `/gor/{slug}/checkout/{bookingId}/waiting`.
5. Midtrans POSTs to `/api/payment/midtrans/callback`.
6. Callback verifies **SHA512 signature**, marks payment **PAID**, confirms booking, generates invoice (idempotent on duplicate callbacks).
7. Waiting page polls every 3s and redirects to **success** when paid.
8. Success page shows booking, payment summary, and invoice link.
9. Invoice is viewable at `/gor/{slug}/checkout/{bookingId}/invoice`.

## 4. Sandbox test cards

Use Midtrans [Sandbox testing docs](https://docs.midtrans.com/docs/testing-payment-on-sandbox) for card numbers and OTP.

Common outcomes:

| Action             | Midtrans status   | App behavior                                       |
| ------------------ | ----------------- | -------------------------------------------------- |
| Successful payment | `settlement`      | PAID, booking CONFIRMED, invoice created           |
| Cancel / fail      | `cancel` / `deny` | FAILED, booking stays PENDING, retry from checkout |
| Expire             | `expire`          | EXPIRED, booking CANCELLED                         |

## 5. Callback security

Signature formula (already implemented):

```text
SHA512(order_id + status_code + gross_amount + SERVER_KEY)
```

Invalid signature returns **403**. Amount mismatch returns **422**.

## 6. Idempotency

- Duplicate `settlement` callbacks: payment stays PAID, invoice generation is retried safely.
- One active PENDING payment per booking; Snap session reused when checkout is reopened.
- Paid payment blocks new payment attempts for the same booking.

## 7. Troubleshooting

| Symptom                     | Check                                                                              |
| --------------------------- | ---------------------------------------------------------------------------------- |
| Stuck on waiting page       | Notification URL reachable? Tunnel running? Check server logs for callback errors. |
| 403 on callback             | `MIDTRANS_SERVER_KEY` matches sandbox dashboard.                                   |
| Payment PAID but no invoice | Check logs for invoice generation; success page polls for invoice up to ~30s.      |
| Snap error on pay           | Keys valid, amount > 0, booking still PENDING and not expired.                     |

## 8. Production checklist

Before going live:

1. Switch to production keys in Midtrans Dashboard.
2. Set `MIDTRANS_IS_PRODUCTION=true`.
3. Update notification URL to production domain.
4. Ensure `NEXT_PUBLIC_APP_URL` and `BETTER_AUTH_URL` use HTTPS.

See also `docs/DEPLOYMENT.md` for full deployment configuration.
