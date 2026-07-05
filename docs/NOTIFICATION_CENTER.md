# Notification Center

In-app notification system for venue owners. No email, no WhatsApp — dashboard-only alerts with lightweight polling.

## Architecture

```
Event (booking/payment/subscription)
        ↓
NotificationEmitter (side-effect, post-success)
        ↓
NotificationRepository → owner_notification table
        ↓
NotificationService (list, mark read, subscription reminders)
        ↓
Server Actions → NotificationBell / NotificationCenter (client polling)
```

### Domain layout

| Path                                                        | Role                                      |
| ----------------------------------------------------------- | ----------------------------------------- |
| `src/domains/notification/constants.ts`                     | Types, filters, polling-related constants |
| `src/domains/notification/repositories/`                    | Prisma persistence                        |
| `src/domains/notification/services/notification-service.ts` | Read/write + `NotificationEmitter`        |
| `src/domains/notification/actions/`                         | Server actions for UI                     |
| `src/components/notification/`                              | Bell dropdown + center page               |

### Database

`OwnerNotification` is scoped to `ownerId` with cascade delete. Each row stores:

- `type` — business event enum
- `category` — `BOOKING`, `PAYMENT`, or `SYSTEM` (for filters)
- `title`, `description`, optional `href`, optional `bookingId`
- `readAt` — `null` = unread

## Notification lifecycle

1. **Emit** — After a successful domain action, `NotificationEmitter` creates a row. Emission is fire-and-forget from server actions / cron / webhooks; core booking/payment services are unchanged.
2. **Deliver** — Dashboard layout loads recent notifications server-side for the bell badge.
3. **Poll** — Client refreshes every **10 seconds** via `listRecentNotificationsAction` / `listNotificationsAction`.
4. **Read** — Clicking a linked notification or using “Tandai Semua Dibaca” sets `readAt`.
5. **Expire visually** — Old notifications remain in the center page; no automatic deletion in v1.

## Notification types

| Type                            | Category | Trigger                                       |
| ------------------------------- | -------- | --------------------------------------------- |
| `BOOKING_CREATED`               | Booking  | Public or owner booking created               |
| `PAYMENT_AWAITING_CONFIRMATION` | Payment  | Customer clicks “Saya Sudah Membayar”         |
| `PAYMENT_APPROVED`              | Payment  | Owner confirms payment                        |
| `PAYMENT_REJECTED`              | Payment  | Owner rejects payment                         |
| `BOOKING_CANCELLED`             | Booking  | Customer cancel, cron expiry                  |
| `SUBSCRIPTION_EXPIRING`         | System   | Lazy sync when listing (≤7 days, deduped 24h) |
| `SUBSCRIPTION_ACTIVATED`        | System   | Midtrans subscription payment settled         |

## Polling strategy

- Interval: `POLL_INTERVALS.NOTIFICATIONS_MS` (10_000 ms)
- Mechanism: `usePolling` hook + server actions (no WebSocket, no third-party realtime)
- Scope: Bell dropdown and `/dashboard/notifications` page
- No full page reload — only action responses update React state

## UI surfaces

1. **Bell** — Dashboard topbar; unread badge; dropdown with latest 8 items
2. **Center** — `/dashboard/notifications` with filters: Semua, Belum Dibaca, Booking, Pembayaran, Sistem

Unread items use subtle `bg-primary/5` highlighting per Sprint 16 design system.

## Future WhatsApp integration

The emitter pattern is intentionally isolated:

1. Add a `NotificationChannel` abstraction (`IN_APP`, `WHATSAPP`).
2. On emit, write in-app row first, then enqueue WhatsApp job if owner opts in.
3. WhatsApp templates can mirror `title` + `description` with deep links from `href`.
4. Do not duplicate business rules — continue emitting from the same post-success hooks.

Recommended fields for a future `owner_notification_preference` table: `whatsappEnabled`, `phone`, per-type toggles.

## Security

- All list/mark-read actions require `requireOwnerSession()` + `requireOwnerId()`.
- Queries always filter by `ownerId` — no cross-tenant access.

## Verification

```bash
npm run lint
npm run typecheck
npm run build
```

Apply migration before deploy:

```bash
npx prisma migrate deploy
npx prisma generate
```
