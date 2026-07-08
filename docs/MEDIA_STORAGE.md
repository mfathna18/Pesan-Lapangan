# Media Storage

PesanLapangan stores owner media in **Supabase Storage**. PostgreSQL keeps only public URLs — never binary image data.

## Architecture

```
Owner UI (file picker)
        ↓
Server Action (auth + ownership)
        ↓
Validate MIME / size
        ↓
Browser resize + WebP compress
        ↓
Server validates + uploads to Supabase Storage
        ↓
Public URL saved on Gor / Court record
        ↓
Immediate client preview
```

### Layers

| Layer           | Location                      | Responsibility                           |
| --------------- | ----------------------------- | ---------------------------------------- |
| UI              | `src/components/media/`       | File pickers, previews, gallery controls |
| Actions         | `src/domains/media/actions/`  | Auth, orchestration                      |
| Services        | `src/domains/media/services/` | Optimization, storage, DB updates        |
| Supabase client | `src/lib/supabase/admin.ts`   | Service-role storage client              |

The upload pipeline is **kind-based** (`logo`, `cover`, `qris`, `court`) so storage reuse stays consistent across media types.

## Buckets

| Bucket         | Visibility | Max size | Use                        |
| -------------- | ---------- | -------- | -------------------------- |
| `gor-logo`     | Public     | 2 MB     | Venue logo                 |
| `gor-cover`    | Public     | 5 MB     | Single venue cover image   |
| `gor-qris`     | Public     | 2 MB     | Manual payment QRIS        |
| `court-images` | Public     | 5 MB     | Court gallery (max 5 each) |

### Create buckets

```bash
SUPABASE_URL=https://<project>.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=<service-role-key> \
node scripts/setup-supabase-storage.mjs
```

## Upload flow

1. Owner chooses an image in **Dashboard → Settings** (logo/cover/QRIS) or **Dashboard → Lapangan → Ubah** (court gallery).
2. Client validates format (PNG/JPG/WEBP) and max size.
3. Server action verifies owner session and ownership.
4. Browser optimizes to WebP (resize + compress) before upload.
5. Server validates file and uploads to Supabase Storage.
6. Public URL is written to `gor.logoUrl`, `gor.coverImageUrl`, `gor.qrisImageUrl`, or `court.imageUrls[]`.
7. UI updates immediately without a full page reload.

## Validation

| Kind  | Formats        | Max upload | Max dimension |
| ----- | -------------- | ---------- | ------------- |
| Logo  | PNG, JPG, WEBP | 2 MB       | 512 px        |
| Cover | PNG, JPG, WEBP | 5 MB       | 1920 px       |
| QRIS  | PNG, JPG, WEBP | 2 MB       | 1024 px       |
| Court | PNG, JPG, WEBP | 5 MB       | 1920 px       |

Court gallery: **maximum 5 images per court**.

## Storage paths

- Logo / Cover / QRIS: `{ownerId}/{kind}/{uuid}.webp`
- Court: `{ownerId}/{courtId}/{uuid}.webp`

## Database fields

```prisma
model Gor {
  logoUrl       String?
  coverImageUrl String?
  qrisImageUrl  String?
}

model Court {
  imageUrls String[] @default([])
}
```

Migration `20260708200000_venue_single_cover_court_gallery` converts `coverImages[1]` → `coverImageUrl` and drops the array column.
