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
Public URL saved in Gor record
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

The upload pipeline is **kind-based** (`logo`, `cover`, `qris`) so future features (court images, coach profiles, documents) can reuse the same storage service with new buckets and actions.

## Buckets

| Bucket      | Visibility | Max size | Use                   |
| ----------- | ---------- | -------- | --------------------- |
| `gor-logo`  | Public     | 2 MB     | Venue logo            |
| `gor-cover` | Public     | 5 MB     | Cover gallery (max 5) |
| `gor-qris`  | Public     | 2 MB     | Manual payment QRIS   |

### Create buckets

```bash
SUPABASE_URL=https://<project>.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=<service-role-key> \
node scripts/setup-supabase-storage.mjs
```

Or create the three public buckets manually in the Supabase dashboard with the limits above.

## Environment variables

| Variable                    | Scope  | Description                          |
| --------------------------- | ------ | ------------------------------------ |
| `SUPABASE_URL`              | Server | Project URL                          |
| `SUPABASE_SERVICE_ROLE_KEY` | Server | Service role key for uploads/deletes |

Add both to Vercel production and local `.env.local`.

## Upload flow

1. Owner chooses an image in **Dashboard → Settings**.
2. Client validates format (PNG/JPG/WEBP) and max size.
3. Server action verifies owner session and GOR ownership.
4. Browser optimizes to WebP (resize + compress) before upload.
5. Server validates file signature and uploads to Supabase Storage.
6. Public URL is written to `gor.logoUrl`, `gor.coverImages`, or `gor.qrisImageUrl`.
7. UI updates immediately without a full page reload.

## Validation

| Kind  | Formats        | Max upload | Max dimension |
| ----- | -------------- | ---------- | ------------- |
| Logo  | PNG, JPG, WEBP | 2 MB       | 512 px        |
| Cover | PNG, JPG, WEBP | 5 MB       | 1920 px       |
| QRIS  | PNG, JPG, WEBP | 2 MB       | 1024 px       |

Cover gallery: **maximum 5 images**.

## Optimization

All uploads are converted to **WebP** in the browser before upload (quality 85). Large originals are downscaled client-side so heavy server image libraries are not required on Vercel.

## Replacement strategy

| Kind          | Behavior                                                |
| ------------- | ------------------------------------------------------- |
| Logo          | Upload new → save URL → delete previous object          |
| QRIS          | Same as logo                                            |
| Cover add     | Append URL to `coverImages[]`                           |
| Cover replace | Upload new → swap URL at index → delete previous object |
| Cover delete  | Remove URL from array → delete object                   |

Object paths are unique (`uuid.webp`); uploads never overwrite by accident.

## Security

- Only authenticated **owners** may upload, replace, reorder, or delete media.
- Every action loads the owner's GOR and checks `ownerId` matches the storage path prefix.
- Deletes only run for URLs hosted on the configured Supabase project and under the owner's folder.

## Database fields

```prisma
logoUrl       String?
coverImages   String[] @default([])
qrisImageUrl  String?
```

Legacy `coverImageUrl` was migrated into `coverImages[0]` via `20260705190000_add_cover_images_array`.

## Next.js images

`next.config.ts` adds `images.remotePatterns` for the Supabase Storage hostname. Owner settings and checkout QRIS use `next/image`.

## Future reuse

To add a new media type:

1. Add a public bucket constant in `src/domains/media/constants.ts`.
2. Add max size/dimension rules.
3. Create a server action that calls `MediaStorageService`.
4. Build a thin UI wrapper around `ImageUploadField` or `CoverGalleryManager`.

No changes to booking, payment, subscription, or notification logic are required.
