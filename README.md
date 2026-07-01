# PesanLapangan

SaaS platform for sports field booking management.

## Tech Stack

- Next.js 15 (App Router)
- TypeScript (Strict Mode)
- Tailwind CSS v4
- shadcn/ui
- Prisma ORM
- PostgreSQL
- Better Auth
- ESLint + Prettier
- Husky + lint-staged

## Getting Started

1. Copy environment variables:

```bash
cp .env.example .env
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

| Script                      | Description                     |
| --------------------------- | ------------------------------- |
| `npm run dev`               | Start development server        |
| `npm run build`             | Create production build         |
| `npm run vercel-build`      | Vercel deploy (migrate + build) |
| `npm run start`             | Start production server         |
| `npm run lint`              | Run ESLint                      |
| `npm run format`            | Format code with Prettier       |
| `npm run typecheck`         | Run TypeScript type checking    |
| `npm run db:generate`       | Generate Prisma Client          |
| `npm run db:push`           | Push schema to database         |
| `npm run db:migrate`        | Run database migrations (dev)   |
| `npm run db:migrate:deploy` | Apply migrations (production)   |
| `npm run db:studio`         | Open Prisma Studio              |

## Project Structure

```
src/
├── app/              # Next.js App Router
│   └── api/auth/     # Better Auth API route
├── components/       # React components
│   └── ui/           # shadcn/ui components
├── config/           # App configuration & env validation
├── constants/        # Shared constants
├── hooks/            # Custom React hooks
├── lib/              # Utilities & integrations
│   ├── auth.ts       # Better Auth server config
│   ├── auth-client.ts
│   └── db/           # Database client
└── types/            # Shared TypeScript types
prisma/
└── schema.prisma     # Database schema
```

## Environment Variables

See `.env.example` for required variables and [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for the full Vercel deployment guide (GitHub, env vars, Prisma, domain, Midtrans sandbox).

## Database

Configure `DATABASE_URL` in `.env` with your PostgreSQL connection string, then run:

```bash
npm run db:generate
npm run db:push
```

Auth models can be generated later with:

```bash
npx @better-auth/cli generate
```
