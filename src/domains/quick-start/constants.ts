import type { QuickStartStepId } from "@/domains/quick-start/types";

export type QuickStartStepDefinition = {
  id: QuickStartStepId;
  title: string;
  description: string;
  tip: string;
  actionLabel: string;
  href: string;
  external?: boolean;
};

export const QUICK_START_STEPS: QuickStartStepDefinition[] = [
  {
    id: "profile",
    title: "Lengkapi Profil GOR",
    description:
      "Isi nama venue, alamat, kota, dan kontak agar pelanggan mengenali GOR Anda.",
    tip: "Gunakan nama yang mudah dicari dan alamat yang jelas untuk Google Maps.",
    actionLabel: "Buka Pengaturan",
    href: "/dashboard/settings",
  },
  {
    id: "media",
    title: "Upload Logo & Foto GOR",
    description:
      "Tambahkan logo dan foto venue agar halaman booking terlihat profesional.",
    tip: "Upload minimal satu foto lapangan yang terang dan tidak buram.",
    actionLabel: "Buka Pengaturan",
    href: "/dashboard/settings",
  },
  {
    id: "courts",
    title: "Tambah Lapangan",
    description:
      "Buat daftar lapangan yang bisa dipesan pelanggan secara online.",
    tip: "Mulai dengan satu lapangan aktif, lalu tambahkan lainnya kapan saja.",
    actionLabel: "Buka Lapangan",
    href: "/dashboard/courts",
  },
  {
    id: "operating-hours",
    title: "Jam Operasional",
    description:
      "Atur hari dan jam buka agar slot booking tersedia di waktu yang benar.",
    tip: "Pastikan setiap lapangan punya minimal satu jadwal aktif per minggu.",
    actionLabel: "Buka Jam Operasional",
    href: "/dashboard/operating-hours",
  },
  {
    id: "pricing",
    title: "Harga",
    description:
      "Tetapkan harga per jam supaya total booking terhitung otomatis.",
    tip: "Gunakan harga berbeda per hari jika weekend lebih ramai.",
    actionLabel: "Buka Harga",
    href: "/dashboard/pricing",
  },
  {
    id: "payment",
    title: "Upload QRIS / Rekening",
    description:
      "Siapkan metode pembayaran manual agar pelanggan bisa transfer setelah booking.",
    tip: "QRIS mempercepat konfirmasi; rekening bank tetap bisa sebagai cadangan.",
    actionLabel: "Buka Pengaturan",
    href: "/dashboard/settings",
  },
  {
    id: "first-booking",
    title: "Coba Booking Pertama",
    description:
      "Buka halaman publik GOR dan lakukan booking percobaan dari sisi pelanggan.",
    tip: "Uji alur lengkap: pilih slot, isi data, dan lihat halaman checkout.",
    actionLabel: "Buka Halaman Publik GOR",
    href: "/gor",
    external: true,
  },
  {
    id: "notifications",
    title: "Aktifkan Browser Notification",
    description:
      "Dapatkan notifikasi instan saat ada booking atau pembayaran baru.",
    tip: "Izinkan notifikasi browser saat diminta agar tidak ketinggalan order.",
    actionLabel: "Buka Pengaturan Notifikasi",
    href: "/dashboard/settings",
  },
];
