# Owner Business Intelligence

Sprint 18 transforms the owner home dashboard (`/dashboard`) from a simple operational summary into a business intelligence dashboard. All analytics logic lives in `src/domains/analytics/` and only reads existing data.

## Architecture

```
/dashboard (Server Component)
        │
        ▼
getAnalyticsService().getBusinessIntelligenceDashboard(ownerId)
        │
        ├── analytics-repository.ts   → Prisma reads (parallel)
        ├── analytics-mappers.ts        → KPIs, insights, trends, activity
        ├── analytics-rules.ts          → Rule-based recommendations
        └── analytics-formatters.ts     → Display labels
                │
                ▼
BusinessIntelligenceDashboard (React)
```

### Domain files

| File                      | Responsibility                                    |
| ------------------------- | ------------------------------------------------- |
| `analytics-types.ts`      | DTOs, snapshot records, limits                    |
| `analytics-queries.ts`    | Owner-scoped Prisma filter builders               |
| `analytics-repository.ts` | Database reads (`aggregate`, `count`, `findMany`) |
| `analytics-utils.ts`      | Date ranges, occupancy math, percent change       |
| `analytics-mappers.ts`    | Snapshot → dashboard payload                      |
| `analytics-rules.ts`      | Recommendation rule engine                        |
| `analytics-formatters.ts` | Currency, labels, timestamps                      |
| `analytics-service.ts`    | Orchestration entry points                        |
| `analytics-actions.ts`    | DI factory (`getAnalyticsService`)                |

The legacy operational analytics page (`/dashboard/analytics`) uses the same domain via `getDashboard()` with a lighter snapshot query.

## KPI formulas

All KPIs compare **current calendar month** vs **previous calendar month**.

### 1. Pendapatan Bulan Ini

```
SUM(payment.amount)
WHERE payment.status = PAID
  AND payment.paidAt ∈ [monthStart, monthEnd]
  AND booking.court.gor.ownerId = currentOwner
```

Change % = `(current − previous) / previous × 100`

### 2. Booking Bulan Ini

```
COUNT(booking)
WHERE booking.status ≠ CANCELLED
  AND booking.bookingDate ∈ [monthStart, monthEnd]
  AND owner-scoped
```

### 3. Customer Aktif

```
COUNT(DISTINCT booking.contact.customerPhone)
FROM non-cancelled bookings in current month
```

WhatsApp numbers are deduplicated in the mapper (no schema change).

### 4. Occupancy Rate

```
Booked Hours = SUM(booking.durationMinute) for non-cancelled bookings in month
Available Hours = SUM(operatingHours.endMinute − startMinute)
                  × matching calendar days in month, per active court

Occupancy % = min(100, round(Booked / Available × 100))
```

Status thresholds:

| Range | Status          |
| ----- | --------------- |
| ≥ 70% | Excellent       |
| ≥ 40% | Good            |
| < 40% | Needs Attention |

Every KPI card includes a `calculation` string shown in the UI.

## Insight cards

Derived from current-month booking and payment data:

| Insight              | Logic                                    |
| -------------------- | ---------------------------------------- |
| Hari Terlaris        | Day-of-week with highest booking count   |
| Jam Terlaris         | Hour bucket with highest booking count   |
| Lapangan Terlaris    | Court with highest PAID revenue          |
| Lapangan Kurang Laku | Court with lowest occupancy %            |
| Booking Pending      | Count of PENDING bookings this month     |
| Booking Dibatalkan   | Cancelled bookings this month            |
| Durasi Rata-rata     | `SUM(durationMinute) / booking count`    |
| Pendapatan Rata-rata | `SUM(PAID revenue) / paid booking count` |

## Recommendation rules

Rule-based only — no AI/LLM. Rules in `analytics-rules.ts`:

| Rule ID                       | Condition                               | Message                       |
| ----------------------------- | --------------------------------------- | ----------------------------- |
| `low-occupancy-weekday-promo` | Occupancy < 40%                         | Promo weekday suggestion      |
| `high-saturday-demand`        | Saturday occupancy > 90% (current week) | Raise price / extend hours    |
| `low-court-utilization`       | Any court utilization < 20%             | Evaluate pricing/photos/promo |
| `pending-payments`            | Pending bookings > 5                    | Follow up unpaid bookings     |
| `revenue-increase`            | Revenue up vs previous month            | Congratulatory message        |

Multiple rules can fire simultaneously, sorted by priority (high → low).

## Aggregation & performance

The BI snapshot uses **one `Promise.all`** with parallel Prisma calls:

- Booking counts and period bookings (current + previous month in one query)
- Revenue aggregates (current + previous month)
- Courts + operating hours
- Pending payments / pending bookings counts
- Activity sources (bookings, payments, invoices)
- Trend data (7-day payments + bookings)

No N+1 queries. Occupancy and insights are computed in memory from the snapshot.

## UI sections (`/dashboard`)

1. **KPI cards** — 4 primary metrics with comparison
2. **Recommendations** — rule-based action suggestions
3. **Insight cards** — 8 business pattern cards (no chart libraries)
4. **Mini trends** — 7-day CSS bar charts (revenue + bookings)
5. **Activity timeline** — booking, payment, invoice, cancellation events
6. **Quick actions** — links to courts, pricing, hours, export, bookings

## Security

- Server-side only; no public analytics API
- All queries filter by `ownerId` through `court.gor.ownerId`
- Read-only — no writes, no schema changes

## Future extensibility

To add a new insight or KPI:

1. Extend snapshot query in `analytics-repository.ts` if new data is needed
2. Add computation in `analytics-mappers.ts`
3. Add UI section in `src/components/dashboard/bi/`
4. Optional: add rule in `analytics-rules.ts`

Possible extensions: court-level drill-down, custom date ranges, email digests, benchmark vs industry, forecast from historical trends.
