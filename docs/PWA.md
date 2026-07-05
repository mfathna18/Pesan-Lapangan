# PWA & Browser Notifications

PesanLapangan supports installable Progressive Web App (PWA) behavior and native browser notifications for owners and customers — without Firebase, OneSignal, or other notification SaaS.

## Architecture

```
In-app notification polling (existing, 10s)
        │
        ▼
New unread OwnerNotification detected
        │
        ▼
PushEmitter + BrowserNotificationProvider
        │
        ├── Check owner browser notification settings
        ├── Map notification type → settings category
        └── serviceWorker.showNotification() or Notification API
        │
        ▼
Click notification → deep link (booking / payment detail)
```

Core booking, payment, invoice, subscription, analytics, and export logic are **not** modified. Browser notifications are triggered client-side from existing polling results.

## Domain layout

| File                                         | Responsibility                                          |
| -------------------------------------------- | ------------------------------------------------------- |
| `push-types.ts`                              | Types, constants, provider interface                    |
| `push-events.ts`                             | Map in-app notification types to push events + settings |
| `push-permission.ts`                         | Permission helpers, PWA install detection               |
| `push-service.ts`                            | Owner settings CRUD (server)                            |
| `push-actions.ts`                            | Settings server actions                                 |
| `push-emitter.ts`                            | Display browser notifications (client)                  |
| `providers/browser-notification-provider.ts` | Swappable browser provider                              |

Future providers (e.g. Web Push with VAPID) can implement `PushNotificationProvider` without changing polling hook sites.

## Progressive Web App

### Manifest

`public/manifest.webmanifest`

| Field       | Value                          |
| ----------- | ------------------------------ |
| Name        | PesanLapangan                  |
| Display     | standalone                     |
| Orientation | portrait                       |
| Start URL   | `/`                            |
| Theme color | `#15803d`                      |
| Icons       | `/icon.png`, `/apple-icon.png` |

Linked from root layout via `manifest: "/manifest.webmanifest"`.

### Service worker

`public/sw.js` — minimal worker for:

- Caching static assets (logo, icons, manifest, landing page shell)
- **Not** caching dynamic booking/checkout/dashboard routes
- Handling `notificationclick` for deep links

Registered by `PwaProvider` in root layout.

### Install app

`PwaInstallButton` in dashboard topbar listens for `beforeinstallprompt` and shows **Install PesanLapangan**. Hidden after install or when running in standalone mode.

## Browser notifications

### Owner events (via notification polling)

| In-app type                    | Browser notification            |
| ------------------------------ | ------------------------------- |
| Booking Baru                   | `BOOKING_CREATED`               |
| Pembayaran Menunggu Konfirmasi | `PAYMENT_AWAITING_CONFIRMATION` |
| Booking Dibatalkan             | `BOOKING_CANCELLED`             |
| Pembayaran Ditolak             | `PAYMENT_REJECTED`              |
| Langganan Akan Berakhir        | `SUBSCRIPTION_EXPIRING`         |

### Customer events (via checkout polling)

| Event                   | Trigger                                 |
| ----------------------- | --------------------------------------- |
| Pembayaran Dikonfirmasi | Checkout status → PAID                  |
| Pembayaran Ditolak      | Checkout status → REJECTED              |
| Booking Sebentar Lagi   | 1 hour before play time on invoice page |

Customer uses booking phone flow only — no login. Permission requested contextually on checkout pages.

### Permission flow

1. **Never immediate** — `PushPermissionDialog` appears after 3 seconds on dashboard
2. Copy: _Aktifkan notifikasi? Agar Anda tidak melewatkan booking baru dan pembayaran._
3. Buttons: **Aktifkan** / **Nanti**
4. "Nanti" dismisses for 7 days (localStorage)

Settings page also offers **Aktifkan Notifikasi** when permission is not granted.

### Notification click

Notifications include `data.url` pointing to:

- `/dashboard/bookings/{id}/payment` — payment awaiting confirmation
- `/dashboard/bookings` — booking events
- `/dashboard/subscription` — subscription expiring
- Customer checkout/invoice URLs for customer events

Service worker opens the URL directly or focuses an existing window.

### Settings

**Dashboard → Settings → Browser Notification**

| Toggle       | Controls                      |
| ------------ | ----------------------------- |
| Master       | All browser notifications     |
| Booking      | New booking, cancellation     |
| Payment      | Payment awaiting, rejected    |
| Reminder     | Subscription expiring (owner) |
| Subscription | Subscription expiring         |

Stored in `owner_browser_notification_settings`.

## Fallback

If browser notifications are blocked or unsupported:

- Notification Center continues to work (bell + `/dashboard/notifications`)
- In-app polling unchanged
- No errors thrown; provider returns noop

## Offline capability

Service worker caches:

- `/` (landing page shell)
- `/manifest.webmanifest`
- `/icon.png`, `/apple-icon.png`, `/favicon.ico`

Does **not** cache:

- `/dashboard/*`
- `/gor/*` checkout/booking data
- `/api/*`

Offline users see cached landing assets only; dynamic data requires network.

## Database migration

```bash
npx prisma migrate deploy
```

Creates `owner_browser_notification_settings`.

## Verification

```bash
npm run lint
npm run typecheck
npm run build
```

## Testing locally

1. Run `npm run dev`
2. Open dashboard → allow notifications when prompted
3. Create a test booking from public flow
4. Owner dashboard should show browser notification within ~10s (polling interval)

Note: `beforeinstallprompt` requires HTTPS (or localhost) and PWA criteria met.
