# WhatsApp Notifications

PesanLapangan uses WhatsApp as the primary outbound communication channel. There is no email or SMS delivery in this module.

## Architecture

```
Domain event (server action / cron / webhook)
        │
        ▼
whatsapp-dispatch (safe wrapper, non-blocking)
        │
        ▼
WhatsAppEmitter
        │
        ├── resolve context (booking, owner phone, customer phone)
        ├── check owner WhatsApp settings
        └── whatsapp-templates.ts → message body
        │
        ▼
WhatsAppService.queueMessage()
        │
        ├── persist whatsapp_message_log (PENDING)
        └── async queue → provider send + retry
        │
        ▼
WhatsAppProvider (Fonnte / Wablas / WA Gateway / Meta / noop)
```

Core booking, payment, invoice, subscription, analytics, and export logic are **not** modified. WhatsApp is dispatched only from server actions, cron routes, and webhooks — the same pattern as the in-app Notification Center.

## Domain layout

| File                                  | Responsibility                                    |
| ------------------------------------- | ------------------------------------------------- |
| `whatsapp-types.ts`                   | Shared types, enums, constants                    |
| `whatsapp-templates.ts`               | All message copy (no hardcoded strings elsewhere) |
| `whatsapp-provider.ts`                | Swappable provider interface + factory            |
| `whatsapp-queue.ts`                   | Async queue abstraction (in-process today)        |
| `whatsapp-logger.ts`                  | Structured success / failed / retry logs          |
| `whatsapp-service.ts`                 | Queue, retry, settings checks, `WhatsAppEmitter`  |
| `whatsapp-actions.ts`                 | Owner settings server actions                     |
| `actions/get-whatsapp-service.ts`     | DI factory                                        |
| `repositories/whatsapp-repository.ts` | Settings + message log persistence                |
| `utils/whatsapp-dispatch.ts`          | Safe dispatch helpers for hook sites              |

## Templates

All messages are built in `src/domains/whatsapp/whatsapp-templates.ts`.

### Owner

| Event                         | Template function                        |
| ----------------------------- | ---------------------------------------- |
| New booking                   | `buildOwnerNewBookingMessage`            |
| Payment awaiting confirmation | `buildOwnerPaymentAwaitingMessage`       |
| Booking cancelled             | `buildOwnerBookingCancelledMessage`      |
| Subscription activated        | `buildOwnerSubscriptionActivatedMessage` |

### Customer

| Event                         | Template function                     |
| ----------------------------- | ------------------------------------- |
| Booking created               | `buildCustomerBookingCreatedMessage`  |
| Payment approved              | `buildCustomerPaymentApprovedMessage` |
| Payment rejected              | `buildCustomerPaymentRejectedMessage` |
| Play reminder (1 hour before) | `buildCustomerBookingReminderMessage` |

Customer recipients use the booking phone number (`BookingContact.customerPhone`). No customer login is required.

Owner recipients use the GOR phone number (`Gor.phone`) configured in Settings → Profil GOR.

## Queue

Messages are **not** sent synchronously in domain services.

1. A row is inserted into `whatsapp_message_log` with status `PENDING`.
2. An in-process async queue processes the job immediately (fire-and-forget).
3. Failed jobs remain in the database for the retry cron.

This abstraction can be replaced with Redis, BullMQ, or RabbitMQ without changing emit sites.

## Retry

- Up to **3 attempts** per message (`WHATSAPP_MAX_RETRY_ATTEMPTS`).
- Exponential backoff between attempts (1s → 2s → 4s, capped at 8s).
- Each attempt updates `whatsapp_message_log` (`attemptCount`, `status`, `providerResponse`, `errorMessage`).
- Cron `/api/cron/whatsapp-retry` re-queues stuck `PENDING` / `FAILED` / `RETRYING` rows every 5 minutes.

## Owner settings

Table: `owner_whatsapp_settings`

| Field                | Description                          |
| -------------------- | ------------------------------------ |
| `enabled`            | Master ON/OFF                        |
| `notifyBooking`      | Owner: new booking, cancellation     |
| `notifyPayment`      | Owner: payment awaiting confirmation |
| `notifyReminder`     | Customer: play-time reminder         |
| `notifySubscription` | Owner: subscription activated        |

UI: **Dashboard → Settings → WhatsApp Notification**

## Environment variables

| Variable                   | Required            | Description                                      |
| -------------------------- | ------------------- | ------------------------------------------------ |
| `WHATSAPP_ENABLED`         | No (default `true`) | Global kill switch                               |
| `WHATSAPP_PROVIDER`        | No (default `noop`) | `fonnte`, `wablas`, `wa-gateway`, `meta`, `noop` |
| `WHATSAPP_API_TOKEN`       | Provider-dependent  | API token / key                                  |
| `WHATSAPP_API_URL`         | Wablas / WA Gateway | Provider endpoint URL                            |
| `WHATSAPP_PHONE_NUMBER_ID` | Meta Cloud API      | Phone number ID                                  |

When provider is `noop` or credentials are missing, messages are logged as sent via the noop provider (useful for local development).

## Providers

The `WhatsAppProvider` interface exposes a single `send({ to, message })` method. Implementations:

- **Fonnte** — `https://api.fonnte.com/send`
- **Wablas** — configurable URL
- **WA Gateway** — configurable URL
- **Meta WhatsApp Cloud API** — Graph API messages endpoint
- **noop** — skips real delivery, succeeds immediately

Add a new provider by implementing the interface in `whatsapp-provider.ts` and extending the factory switch.

## Cron jobs

| Route                         | Schedule     | Purpose                                   |
| ----------------------------- | ------------ | ----------------------------------------- |
| `/api/cron/booking-reminders` | Every 15 min | Customer reminder 1 hour before play time |
| `/api/cron/whatsapp-retry`    | Every 5 min  | Retry failed / pending messages           |

Both require `Authorization: Bearer ${CRON_SECRET}`.

## Database migration

```bash
npx prisma migrate deploy
```

Creates:

- `owner_whatsapp_settings`
- `whatsapp_message_log`
- Related enums

## Hook sites

WhatsApp dispatch is wired alongside in-app notifications at:

- `create-booking.action.ts`
- `create-public-booking.action.ts`
- `submit-manual-payment.action.ts`
- `owner-manual-payment.action.ts`
- `api/cron/expire-bookings/route.ts`
- `api/payment/midtrans/callback/route.ts` (subscription)
- `api/cron/booking-reminders/route.ts`

## Logging

`whatsapp-logger.ts` writes structured logs via the app logger:

- **success** — log ID, provider name, provider response
- **failed** — log ID, provider name, error message
- **retry** — log ID, attempt number, error message

All attempts are also persisted in `whatsapp_message_log` with timestamps.
