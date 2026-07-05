# Subscription Plans

PesanLapangan subscription tiers control how many courts an owner can manage. Payment is processed through **Midtrans** (Snap). The billing integration remains in place even while the Midtrans merchant account is pending verification.

## Plans

| Plan        | Price (IDR / month) | Court limit | Notes                          |
| ----------- | ------------------- | ----------- | ------------------------------ |
| **Free**    | Rp 0                | 2           | Trial / default for new owners |
| **Starter** | Rp 175.000          | 2           | Entry paid tier                |
| **Pro**     | Rp 250.000          | 5           | Highlighted as **BEST VALUE**  |
| **Elite**   | Rp 450.000          | Unlimited   | No court cap                   |

All paid plans include:

- Booking Online
- Dashboard
- Invoice
- Export
- Analytics
- Browser Notification
- PWA

## Court limits

Limits are enforced on the **server** when creating a court (`CourtService.createCourtForOwner`). The UI mirrors the same rules:

- **Starter / Free:** max **2** courts total
- **Pro:** max **5** courts total
- **Elite:** unlimited

When the limit is reached:

- **Tambah Lapangan** opens an upgrade dialog (courts page)
- API returns `SUBSCRIPTION_COURT_LIMIT_REACHED_MESSAGE`

Constants live in `src/domains/subscription/utils/subscription-plan-limits.ts`.

## Upgrade

1. Owner opens **Dashboard → Langganan**
2. Chooses a plan card (Starter / Pro / Elite)
3. Server creates `SubscriptionPayment` and Midtrans Snap session
4. Redirect to **Waiting Payment** (`/dashboard/subscription/waiting`)
5. On successful callback, `activateSubscription` updates plan + expiry

Owners on **Free (trial)** upgrade by selecting any paid plan.

## Downgrade

Downgrade is allowed only if the owner's **current court count** fits the target plan limit.

Example: owner on **Pro** with **5 courts** cannot downgrade to **Starter** (limit 2).

Server message:

> Nonaktifkan lapangan terlebih dahulu sebelum menurunkan paket.

Deactivate or delete courts first, then select the lower plan.

## Renewal

Paid plans (**Starter**, **Pro**, **Elite**) can renew the **same** plan. Renewal extends `expiresAt` from the current expiry (or from now if already expired).

## Grace period and soft lock

Unchanged from the existing architecture:

- **3-day grace** after `expiresAt` (`SUBSCRIPTION_GRACE_PERIOD_DAYS`)
- **Soft lock** when `EXPIRED`: dashboard visible; courts, pricing, exports, etc. gated
- **Waiting page** after Midtrans redirect

## Midtrans (ready, not removed)

Environment variables (unchanged):

- `MIDTRANS_SERVER_KEY`
- `MIDTRANS_CLIENT_KEY`
- `MIDTRANS_IS_PRODUCTION`

Callback route: `/api/payment/midtrans/callback`

While the merchant account is not yet active, checkout surfaces:

> Pembayaran online akan tersedia setelah akun pembayaran aktif.

No credentials are hardcoded. When Midtrans approves the merchant, payments work without changing subscription business logic.

## Key files

| Area                   | Path                                                         |
| ---------------------- | ------------------------------------------------------------ |
| Plan prices and labels | `src/domains/subscription/constants.ts`                      |
| Court limits           | `src/domains/subscription/utils/subscription-plan-limits.ts` |
| Plan selection UI      | `src/components/subscription/subscription-plan-cards.tsx`    |
| Billing service        | `src/domains/subscription/services/subscription-service.ts`  |
| Court enforcement      | `src/domains/booking/services/court-service.ts`              |
| Prisma enum            | `prisma/schema.prisma` → `SubscriptionPlan`                  |

## Future Midtrans activation

1. Complete Midtrans merchant verification
2. Ensure production env vars are set on Vercel
3. Redeploy (no code changes required)
4. Test: choose plan → Snap → callback → plan `ACTIVE`
