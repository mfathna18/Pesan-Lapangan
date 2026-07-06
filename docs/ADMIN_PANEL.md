# Super Admin Panel

PesanLapangan Super Admin Dashboard untuk memonitor platform SaaS booking lapangan. Panel ini **bukan** alat manajemen bisnis pemilik venue.

## Architecture

```
src/app/(admin)/admin/          # Route group — isolated dari owner dashboard
src/components/admin/           # UI shell, tables, charts
src/domains/admin/              # Platform-wide queries & services
src/lib/auth/require-super-admin-session.ts
src/domains/admin/services/super-admin-provisioning.ts
```

- **Route group `(admin)`** memisahkan layout admin dari `(owner)/dashboard`.
- **`AdminService`** menjalankan query Prisma **tanpa filter owner** — hanya untuk statistik platform.
- **Tidak memodifikasi** domain booking, payment, invoice, notification, analytics owner, atau customer flow.

## Access Control

| Route      | Guard                                                |
| ---------- | ---------------------------------------------------- |
| `/admin/*` | `requireSuperAdminSession()` di layout + setiap page |

Alur otorisasi:

1. Cek session Better Auth — tanpa session → redirect `/login`
2. Panggil `ensureSuperAdminRole(userId, email)` — baca/update role dari database
3. Jika role bukan `SUPER_ADMIN` → redirect `/dashboard`

**Penting:** Otorisasi memverifikasi role dari **database**, bukan hanya cookie session, agar assignment role tetap akurat setelah login.

Owner dashboard (`requireOwnerSession`) mengarahkan user `SUPER_ADMIN` ke `/admin` agar tidak masuk panel pemilik.

## Role System

Prisma enum `UserRole`:

- `OWNER` — default untuk semua user baru
- `SUPER_ADMIN` — hanya untuk super admin platform

Provisioning otomatis:

- Email **`mfathna18@gmail.com`** mendapat role `SUPER_ADMIN` saat:
  - User dibuat (hook `databaseHooks.user.create.after`)
  - Session dibuat / login (`databaseHooks.session.create.after`)
  - Setiap akses route admin (`ensureSuperAdminRole`)
- User lain **tidak terpengaruh**
- Field `role` di Better Auth: `input: false` — klien tidak bisa self-assign role
- `provisionOwnerAfterUserSignUp` dilewati jika role bukan `OWNER`

## Dashboard

### KPI Cards

Total Owners, Venues, Courts, Bookings, Today's Bookings, Monthly Revenue (langganan SaaS PAID bulan ini), Active/Expired Subscriptions.

### Recent Activity

Booking, registrasi owner, langganan, dan pembayaran terbaru.

### Analytics

New Owners (30 hari), Revenue Trend, Bookings Trend, Popular Sports — chart CSS sederhana tanpa library eksternal.

## Pages (Read-Only)

| Menu          | Path                   | Konten                                   |
| ------------- | ---------------------- | ---------------------------------------- |
| Dashboard     | `/admin`               | KPI, aktivitas, analitik                 |
| Owners        | `/admin/owners`        | Tabel pemilik + search/filter/pagination |
| Venues        | `/admin/venues`        | Tabel venue                              |
| Subscriptions | `/admin/subscriptions` | Tabel langganan SaaS                     |
| Payments      | `/admin/payments`      | Pembayaran langganan & booking           |
| System        | `/admin/system`        | DB, storage, version, environment        |

Tidak ada navigasi admin di sidebar owner.

## Security

- Setiap halaman admin memanggil `requireSuperAdminSession()` di server (defense in depth selain layout).
- Tidak mengandalkan middleware saja.
- Super admin tidak melihat menu owner dashboard; owner tidak melihat menu admin.
- Domain admin hanya **read** — tidak ada endpoint edit owner/venue dari panel ini.

## First Super Admin

Login dengan `mfathna18@gmail.com` → redirect otomatis ke `/admin`.

Login owner biasa → `/dashboard`.
