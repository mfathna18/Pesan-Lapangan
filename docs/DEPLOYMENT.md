# PesanLapangan — Vercel Deployment Guide

Production deployment checklist and environment variable reference for Vercel.

---

## Deployment Checklist

### 1. Repository & Vercel project

- [ ] Import the Git repository into Vercel
- [ ] Set **Framework Preset** to **Next.js**
- [ ] Set **Root Directory** to repository root (default)
- [ ] Set **Build Command** to `npm run build` (default)
- [ ] Set **Install Command** to `npm install` (default)
- [ ] Set **Output Directory** to `.next` (default)
- [ ] Confirm Node.js version is **20.x** or newer in Project Settings

### 2. Environment variables

- [ ] Configure all required variables in Vercel → **Settings → Environment Variables**
- [ ] Set variables for **Production**, **Preview**, and **Development** scopes as needed
- [ ] Use **HTTPS** URLs for `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` in Production
- [ ] Generate a unique `BETTER_AUTH_SECRET` (32+ characters) per environment
- [ ] Do **not** commit `.env` to Git

### 3. Database (PostgreSQL)

- [ ] Provision PostgreSQL (Neon, Supabase, Vercel Postgres, etc.)
- [ ] Copy the **pooled** connection string into `DATABASE_URL`
- [ ] Ensure `?sslmode=require` (or provider equivalent) for production
- [ ] Run migrations against production **before** or **during** first deploy:
  ```bash
  npm run db:migrate:deploy
  ```
- [ ] `postinstall` runs `prisma generate` automatically on Vercel builds
- [ ] No schema changes are required for deployment — only apply existing migrations

### 4. Better Auth

- [ ] Set `BETTER_AUTH_URL` to your canonical production URL (e.g. `https://your-domain.com`)
- [ ] Set `NEXT_PUBLIC_APP_URL` to the same public URL
- [ ] Both URLs must match the domain users visit (including `www` vs apex consistency)
- [ ] Cookies are `httpOnly` and `Secure` in production via Better Auth
- [ ] Auth API route: `/api/auth/[...all]` (no extra configuration needed)

### 5. Midtrans

- [ ] Set `MIDTRANS_IS_PRODUCTION=true` in Production when using live keys
- [ ] Register production **Payment Notification URL** in Midtrans Dashboard:
  ```
  https://your-domain.com/api/payment/midtrans/callback
  ```
- [ ] Register **Finish Redirect URL** patterns if required by your Midtrans account settings
- [ ] Keep sandbox keys only in Preview/Development environments

### 6. Domain & HTTPS

- [ ] Add custom domain in Vercel → **Settings → Domains**
- [ ] Enable automatic HTTPS (Vercel default)
- [ ] Redirect apex ↔ `www` to a single canonical host
- [ ] Update `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` after domain is final

### 7. Security (already configured in repo)

- [ ] Security headers via `next.config.ts` (HSTS in production, X-Frame-Options, etc.)
- [ ] `X-Powered-By` header disabled
- [ ] Owner dashboard routes blocked in `robots.txt` (`/dashboard/`, `/owner/`, `/api/`)
- [ ] Server Actions require owner session + owner-scoped data access

### 8. SEO & metadata

- [ ] Root metadata configured in `src/app/layout.tsx`
- [ ] `robots.txt` generated at `/robots.txt`
- [ ] `sitemap.xml` generated at `/sitemap.xml` (includes active public venue pages)
- [ ] Per-route metadata on public venue and dashboard pages

### 9. Images

- [ ] Venue/court images use native `<img>` with owner-provided URLs — **no** `next/image` remotePatterns required today
- [ ] When migrating to `next/image`, add `images.remotePatterns` in `next.config.ts` for your CDN domains

### 10. Post-deploy verification

- [ ] `npm run build` passes locally with production-like env vars
- [ ] Home page loads over HTTPS
- [ ] Owner sign-in / sign-up works (`/api/auth/*`)
- [ ] Public venue page loads: `/gor/[slug]`
- [ ] Midtrans sandbox payment flow completes (checkout + callback)
- [ ] Subscription payment callback works for owner billing
- [ ] Dashboard loads for authenticated owner: `/dashboard`
- [ ] `/robots.txt` and `/sitemap.xml` are reachable

### 11. Preview deployments

- [ ] Set Preview-scoped env vars (separate DB or branch DB recommended)
- [ ] Use Midtrans **sandbox** keys for Preview (`MIDTRANS_IS_PRODUCTION=false`)
- [ ] Use Preview URL for `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` on preview branches, or use a stable staging domain

---

## Environment Variable Checklist

| Variable                 | Required | Scope          | Production notes                                        |
| ------------------------ | -------- | -------------- | ------------------------------------------------------- |
| `NODE_ENV`               | Auto     | All            | Set to `production` on Vercel Production                |
| `DATABASE_URL`           | Yes      | Server         | Pooled PostgreSQL URL with SSL                          |
| `BETTER_AUTH_SECRET`     | Yes      | Server         | Unique 32+ char secret; never reuse across envs         |
| `BETTER_AUTH_URL`        | Yes      | Server         | **HTTPS** canonical app URL                             |
| `NEXT_PUBLIC_APP_URL`    | Yes      | Client + build | **HTTPS** canonical app URL; baked into client bundle   |
| `MIDTRANS_SERVER_KEY`    | Yes      | Server         | Production key when `MIDTRANS_IS_PRODUCTION=true`       |
| `MIDTRANS_CLIENT_KEY`    | Yes      | Server         | Production key when live                                |
| `MIDTRANS_IS_PRODUCTION` | Yes      | Server         | `true` for live Midtrans; `false` for sandbox           |
| `SKIP_ENV_VALIDATION`    | No       | Build          | Only for CI/Docker; **do not** use on Vercel Production |

### Validation rules (enforced by `src/config/env.ts`)

- `DATABASE_URL`, Midtrans keys: non-empty strings
- `BETTER_AUTH_SECRET`: minimum 32 characters
- `BETTER_AUTH_URL`, `NEXT_PUBLIC_APP_URL`: valid URLs; **HTTPS required for non-local deployments** (localhost HTTP allowed for local builds)
- `MIDTRANS_IS_PRODUCTION`: `"true"` or `"false"` (transformed to boolean)
- Env is validated at server startup via `src/instrumentation.ts`

### Production example

```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
BETTER_AUTH_SECRET=your-unique-secret-at-least-32-characters-long
BETTER_AUTH_URL=https://your-domain.com
MIDTRANS_SERVER_KEY=Mid-server-...
MIDTRANS_CLIENT_KEY=Mid-client-...
MIDTRANS_IS_PRODUCTION=true
```

---

## Vercel-specific notes

### Build

- `postinstall` → `prisma generate` (Prisma Client generated before build)
- `npm run build` → `next build --turbopack`
- Env validation runs during build when server modules import `@/config/env`

### Database connections

- Use connection pooling (`pgbouncer`, Neon pooler, Supabase pooler) in `DATABASE_URL` for serverless functions
- Run `npm run db:migrate:deploy` from CI or locally against production DB — do not rely on build step for migrations unless you add it explicitly

### Serverless runtime

- Prisma uses `@prisma/adapter-pg` with `pg` driver (configured in `src/lib/db/prisma.ts`)
- Prisma client is cached in development; new instance per function in production (expected for serverless)

### Auth cookies on Vercel

- `useSecureCookies` enabled when `NODE_ENV=production`
- Cookie prefix: `pesan-lapangan`
- Requires HTTPS (Vercel provides TLS automatically)

---

## Quick deploy commands (local / CI)

```bash
# Install
npm install

# Apply migrations to target database
npm run db:migrate:deploy

# Verify production build
npm run typecheck
npm run lint
npm run build
```

---

## Troubleshooting

| Issue                         | Likely cause                          | Fix                                                                      |
| ----------------------------- | ------------------------------------- | ------------------------------------------------------------------------ |
| Build fails on env validation | Missing or invalid env vars in Vercel | Add all required vars; use HTTPS URLs in Production                      |
| Auth redirect loops           | `BETTER_AUTH_URL` mismatch            | Match exact deployed domain (scheme + host)                              |
| Midtrans callback 403         | Invalid signature                     | Verify `MIDTRANS_SERVER_KEY` matches environment (sandbox vs production) |
| Midtrans callback 404         | Wrong notification URL                | Set Midtrans dashboard URL to `/api/payment/midtrans/callback`           |
| Database connection errors    | Non-pooled URL or missing SSL         | Use provider pooled URL + `sslmode=require`                              |
| Prisma client not found       | Generate step skipped                 | Ensure `postinstall` runs; check build logs                              |
