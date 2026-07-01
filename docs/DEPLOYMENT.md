# PesanLapangan — Production Deployment (Vercel)

Guide for deploying PesanLapangan to Vercel with PostgreSQL, Better Auth, Midtrans, and Prisma migrations.

---

## 1. GitHub

1. Push the repository to GitHub (private or public).
2. Ensure these files are committed:
   - `prisma/migrations/` — all migration history
   - `prisma/schema.prisma`
   - `vercel.json` — cron schedule for booking expiration
   - `.env.example` — variable reference (never commit `.env`)
3. Protect the `main` branch if working with a team.
4. Use **Preview** deployments for feature branches; use **Production** only for the live domain.

---

## 2. Vercel

### Create project

1. Go to [vercel.com/new](https://vercel.com/new) and import the GitHub repository.
2. **Framework Preset:** Next.js (auto-detected).
3. **Root Directory:** repository root.
4. **Build Command:** leave default — Vercel runs `vercel-build` when defined in `package.json`:
   ```json
   "vercel-build": "node scripts/prisma-migrate-deploy.mjs && next build --turbopack"
   ```
5. **Install Command:** `npm install` (default). `postinstall` runs `prisma generate`.
6. **Node.js version:** 20.x or newer (see `engines` in `package.json`).

### Cron jobs

`vercel.json` registers a cron job:

| Path                        | Schedule     | Purpose                        |
| --------------------------- | ------------ | ------------------------------ |
| `/api/cron/expire-bookings` | Every minute | Expire unpaid pending bookings |

Set `CRON_SECRET` in Vercel Environment Variables. Vercel automatically sends `Authorization: Bearer <CRON_SECRET>` when invoking cron routes.

### Serverless runtime

These routes require the **Node.js** runtime (not Edge):

- `/api/auth/[...all]`
- `/api/payment/midtrans/callback`
- `/api/cron/expire-bookings`
- Invoice PDF routes (`*/invoice/pdf`)

PDF generation uses **pdfkit** (listed in `serverExternalPackages` in `next.config.ts`) with built-in Helvetica fonts — compatible with Vercel serverless functions.

---

## 3. Environment Variables

Configure in **Vercel → Project → Settings → Environment Variables**.

| Variable                 | Required | Scopes              | Description                                                  |
| ------------------------ | -------- | ------------------- | ------------------------------------------------------------ |
| `DATABASE_URL`           | Yes      | All                 | Pooled URL (Supabase port 6543) for app runtime              |
| `DIRECT_URL`             | Yes*     | All                 | Direct URL (Supabase port 5432) for Prisma migrations        |
| `BETTER_AUTH_SECRET`     | Yes      | All                 | 32+ character secret; unique per environment                 |
| `BETTER_AUTH_URL`        | Yes      | All                 | Public app URL (must match domain users visit)               |
| `NEXT_PUBLIC_APP_URL`    | Yes      | All                 | Same as `BETTER_AUTH_URL`; baked into client bundle at build |
| `MIDTRANS_SERVER_KEY`    | Yes      | All                 | Midtrans server key (sandbox or production)                  |
| `MIDTRANS_CLIENT_KEY`    | Yes      | All                 | Midtrans client key                                          |
| `MIDTRANS_IS_PRODUCTION` | Yes      | All                 | `false` for sandbox, `true` for live Midtrans                |
| `CRON_SECRET`            | Yes      | Production, Preview | Secret for `/api/cron/expire-bookings`                       |
| `SKIP_ENV_VALIDATION`    | No       | Never on Production | Only for special CI/Docker builds                            |

\* **Required on Vercel when `DATABASE_URL` uses Supabase pooler (6543 / `pgbouncer=true`).** Optional locally if `DATABASE_URL` is a direct connection.

### Auto-provided by Vercel (do not set)

| Variable     | Purpose                                   |
| ------------ | ----------------------------------------- |
| `VERCEL_URL` | Current deployment hostname               |
| `VERCEL_ENV` | `production`, `preview`, or `development` |

Preview deployments automatically trust `https://${VERCEL_URL}` for Better Auth CSRF (see `src/config/auth-urls.ts`).

### Validation (`src/config/env.ts`)

- URLs must use **HTTPS** except `localhost` / `127.0.0.1` (local dev only).
- Env is loaded at server startup via `src/instrumentation.ts`.
- Build fails if required variables are missing or invalid.

### Production example

```env
NEXT_PUBLIC_APP_URL=https://your-domain.com
DATABASE_URL=postgresql://...@pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://...@pooler.supabase.com:5432/postgres
BETTER_AUTH_SECRET=<generate-unique-32-plus-chars>
BETTER_AUTH_URL=https://your-domain.com
MIDTRANS_SERVER_KEY=Mid-server-...
MIDTRANS_CLIENT_KEY=Mid-client-...
MIDTRANS_IS_PRODUCTION=true
CRON_SECRET=<generate-unique-32-plus-chars>
```

### Preview / staging example

```env
NEXT_PUBLIC_APP_URL=https://your-app-git-branch.vercel.app
BETTER_AUTH_URL=https://your-app-git-branch.vercel.app
MIDTRANS_IS_PRODUCTION=false
# Use sandbox Midtrans keys
# Use a separate staging database (recommended)
```

Copy `.env.example` locally:

```bash
cp .env.example .env
```

---

## 4. Prisma

### Local development

```bash
npm install
npm run db:generate
npm run db:migrate        # prisma migrate dev
```

### Production deployment

Migrations run automatically on Vercel via `vercel-build`:

```bash
node scripts/prisma-migrate-deploy.mjs && next build --turbopack
```

You can also run migrations manually before the first deploy:

```bash
npm run db:migrate:deploy
```

### Supabase (required for Vercel)

Use **two** connection strings in Vercel Environment Variables:

| Variable       | Connection                                                   | Used by                              |
| -------------- | ------------------------------------------------------------ | ------------------------------------ |
| `DATABASE_URL` | Transaction pooler — port **6543**, append `?pgbouncer=true` | App runtime (`src/lib/db/prisma.ts`) |
| `DIRECT_URL`   | Session/direct — port **5432**                               | Prisma CLI (`prisma migrate deploy`) |

Get both from Supabase → **Project Settings → Database → Connect**.

**Why:** `prisma migrate deploy` through the pooler (6543 / PgBouncer) often **hangs indefinitely** with no error — this is the most common Vercel + Supabase deploy failure.

`prisma.config.ts` uses `DIRECT_URL` for CLI commands. The app runtime continues using pooled `DATABASE_URL` via `@prisma/adapter-pg`.

If `DATABASE_URL` uses the pooler and `DIRECT_URL` is missing, the migrate script exits immediately with a clear error instead of hanging.

### Database provider tips

- Use a **pooled** connection string for serverless (Neon pooler, Supabase pooler, Vercel Postgres, PgBouncer).
- Include `?sslmode=require` (or provider equivalent) in production.
- Prisma uses `@prisma/adapter-pg` with the `pg` driver (`src/lib/db/prisma.ts`).
- `postinstall` runs `prisma generate` on every install/build.

### Do not use in production

- `prisma db push` — bypasses migration history
- `prisma migrate dev` — interactive; for local dev only

---

## 5. Domain

1. In Vercel → **Settings → Domains**, add your custom domain (e.g. `pesanlapangan.com`).
2. Configure DNS per Vercel instructions (A/CNAME records).
3. Enable automatic HTTPS (Vercel default).
4. Pick one canonical host (apex or `www`) and redirect the other.
5. Update environment variables to the **final** HTTPS URL:
   - `NEXT_PUBLIC_APP_URL=https://your-domain.com`
   - `BETTER_AUTH_URL=https://your-domain.com`
6. Redeploy after changing `NEXT_PUBLIC_APP_URL` (client bundle is built at deploy time).

Public URLs in the app (sitemap, robots, Open Graph, canonical links) come from `NEXT_PUBLIC_APP_URL` via `src/config/site.ts` — no hardcoded localhost in production.

---

## 6. First Deployment

### Pre-deploy checklist

- [ ] PostgreSQL database provisioned
- [ ] All environment variables set in Vercel (Production scope)
- [ ] `BETTER_AUTH_SECRET` and `CRON_SECRET` generated (32+ chars each)
- [ ] HTTPS URLs for `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL`
- [ ] Midtrans notification URL registered (see section 8 for sandbox)

### Deploy

1. Push to `main` (or merge PR) — Vercel starts a Production deployment.
2. Watch build logs:
   - `prisma migrate deploy` applies pending migrations
   - `prisma generate` (via postinstall)
   - `next build --turbopack`
3. Confirm deployment status is **Ready**.

### Alternative: manual migration before deploy

```bash
export DATABASE_URL="postgresql://..."
npm run db:migrate:deploy
git push origin main
```

---

## 7. Post-Deployment Verification

Run locally first (optional):

```bash
npm run lint
npm run typecheck
npm run build
```

### Smoke tests (Production)

| Check             | URL / action                        | Expected                                |
| ----------------- | ----------------------------------- | --------------------------------------- |
| Home page         | `/`                                 | Loads over HTTPS                        |
| Robots            | `/robots.txt`                       | Disallows `/dashboard/`, `/api/`        |
| Sitemap           | `/sitemap.xml`                      | Lists venue URLs with production domain |
| Owner register    | `/register`                         | Form loads                              |
| Owner login       | `/login`                            | Session cookie set after login          |
| Dashboard         | `/dashboard`                        | Redirects to login if unauthenticated   |
| Public venue      | `/gor/[slug]`                       | Venue page loads                        |
| Booking flow      | Public booking → checkout           | Snap / payment UI loads                 |
| Midtrans callback | Pay in sandbox                      | Booking status updates                  |
| Invoice PDF       | Download from dashboard or checkout | A4 PDF downloads                        |
| Cron              | Vercel Cron logs                    | 200 from `/api/cron/expire-bookings`    |

### Security headers (configured in `next.config.ts`)

- `Strict-Transport-Security` (production only)
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: origin-when-cross-origin`
- `X-Powered-By` disabled

### Auth cookies (Better Auth)

- `httpOnly` session cookies
- `Secure` flag in production (`useSecureCookies: true`)
- Cookie prefix: `pesan-lapangan`

---

## 8. Midtrans Sandbox Activation

Use sandbox on **Preview** and for local/staging verification before going live.

### Environment (sandbox)

```env
MIDTRANS_IS_PRODUCTION=false
MIDTRANS_SERVER_KEY=SB-Mid-server-...
MIDTRANS_CLIENT_KEY=SB-Mid-client-...
NEXT_PUBLIC_APP_URL=https://your-deployment-url
BETTER_AUTH_URL=https://your-deployment-url
```

Get keys from [Midtrans Sandbox Dashboard](https://dashboard.sandbox.midtrans.com) → **Settings → Access Keys**.

### Notification URL

Register in Midtrans Sandbox → **Settings → Configuration → Payment Notification URL**:

```text
https://your-deployment-url/api/payment/midtrans/callback
```

| Environment                 | URL                                                                                  |
| --------------------------- | ------------------------------------------------------------------------------------ |
| Vercel Preview / Production | `https://<your-vercel-or-custom-domain>/api/payment/midtrans/callback`               |
| Local dev                   | Requires HTTPS tunnel (ngrok, Cloudflare Tunnel) — Midtrans cannot reach `localhost` |

See [docs/MIDTRANS_SANDBOX.md](./MIDTRANS_SANDBOX.md) for the full end-to-end sandbox flow (test cards, `deny` → failed, invoice PDF).

### Going live (production Midtrans)

1. Obtain production keys from [Midtrans Dashboard](https://dashboard.midtrans.com).
2. Set `MIDTRANS_IS_PRODUCTION=true` in Vercel **Production** only.
3. Update notification URL to production domain.
4. Redeploy Production.

---

## Troubleshooting

| Issue                                   | Likely cause                   | Fix                                                                         |
| --------------------------------------- | ------------------------------ | --------------------------------------------------------------------------- |
| Build fails on env validation           | Missing/invalid env vars       | Add all required vars; use HTTPS in Production                              |
| `prisma migrate deploy` hangs on Vercel | Pooler URL used for migrations | Set `DIRECT_URL` (port 5432); keep pooler in `DATABASE_URL` only            |
| Auth redirect loops                     | URL mismatch                   | `BETTER_AUTH_URL` must exactly match browser URL                            |
| Preview auth fails                      | Wrong trusted origin           | Set Preview `BETTER_AUTH_URL` to preview URL, or rely on `VERCEL_URL` trust |
| Midtrans callback 403                   | Wrong server key               | Match sandbox vs production keys with `MIDTRANS_IS_PRODUCTION`              |
| Midtrans callback 404                   | Wrong notification URL         | Must be `/api/payment/midtrans/callback`                                    |
| PDF generation error                    | Edge runtime                   | Routes use `runtime = "nodejs"`; pdfkit in `serverExternalPackages`         |
| Database connection errors              | Non-pooled URL                 | Use provider connection pooler                                              |
| Cron 401                                | Missing/wrong `CRON_SECRET`    | Set in Vercel env; redeploy                                                 |

---

## Quick reference commands

```bash
# Local
cp .env.example .env
npm install
npm run db:migrate
npm run dev

# Pre-deploy verification
npm run lint
npm run typecheck
npm run build

# Manual production migration
DATABASE_URL="..." npm run db:migrate:deploy
```
