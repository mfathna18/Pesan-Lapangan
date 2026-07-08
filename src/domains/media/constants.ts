export const MEDIA_BUCKET = {
  GOR_LOGO: "gor-logo",
  GOR_COVER: "gor-cover",
  GOR_QRIS: "gor-qris",
  COURT_IMAGES: "court-images",
} as const;

export type MediaBucket = (typeof MEDIA_BUCKET)[keyof typeof MEDIA_BUCKET];

export const MEDIA_KIND = {
  LOGO: "logo",
  COVER: "cover",
  QRIS: "qris",
  COURT: "court",
} as const;

export type MediaKind = (typeof MEDIA_KIND)[keyof typeof MEDIA_KIND];

export const MEDIA_ALLOWED_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
] as const;

export const MEDIA_ALLOWED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp"];

export const MEDIA_MAX_FILE_BYTES = {
  [MEDIA_KIND.LOGO]: 2 * 1024 * 1024,
  [MEDIA_KIND.COVER]: 5 * 1024 * 1024,
  [MEDIA_KIND.QRIS]: 2 * 1024 * 1024,
  [MEDIA_KIND.COURT]: 5 * 1024 * 1024,
} as const;

export const MEDIA_MAX_DIMENSION = {
  [MEDIA_KIND.LOGO]: 512,
  [MEDIA_KIND.COVER]: 1920,
  [MEDIA_KIND.QRIS]: 1024,
  [MEDIA_KIND.COURT]: 1920,
} as const;

export const MEDIA_WEBP_QUALITY = 85;

export const COURT_GALLERY_MAX_IMAGES = 5;

export const MEDIA_ERROR_MESSAGE = {
  INVALID_FORMAT: "Format gambar tidak didukung. Gunakan PNG, JPG, atau WEBP.",
  FILE_TOO_LARGE: (maxMb: number) =>
    `Ukuran file terlalu besar. Maksimum ${maxMb} MB.`,
  UPLOAD_FAILED: "Gagal mengunggah gambar. Coba lagi.",
  DELETE_FAILED: "Gagal menghapus gambar. Coba lagi.",
  STORAGE_UNAVAILABLE:
    "Penyimpanan gambar tidak tersedia. Pastikan SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY sudah diisi di Vercel, lalu deploy ulang.",
  COURT_GALLERY_LIMIT: `Maksimum ${COURT_GALLERY_MAX_IMAGES} foto lapangan.`,
  GOR_REQUIRED: "Simpan profil GOR terlebih dahulu sebelum mengunggah gambar.",
  COURT_REQUIRED: "Lapangan tidak ditemukan atau tidak memiliki akses.",
  UNAUTHORIZED: "Anda tidak memiliki akses untuk mengelola gambar ini.",
  INVALID_COVER_URL: "Foto sampul tidak valid.",
  INVALID_COURT_IMAGE_URL: "Foto lapangan tidak valid.",
} as const;

export function getMediaBucket(kind: MediaKind): MediaBucket {
  switch (kind) {
    case MEDIA_KIND.LOGO:
      return MEDIA_BUCKET.GOR_LOGO;
    case MEDIA_KIND.COVER:
      return MEDIA_BUCKET.GOR_COVER;
    case MEDIA_KIND.QRIS:
      return MEDIA_BUCKET.GOR_QRIS;
    case MEDIA_KIND.COURT:
      return MEDIA_BUCKET.COURT_IMAGES;
  }
}
