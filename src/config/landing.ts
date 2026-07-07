export const landingContent = {
  hero: {
    eyebrow: "Booking Lapangan Online",
    title: "Pesan Lapangan Olahraga Favoritmu dalam Hitungan Menit",
    description:
      "Temukan lapangan badminton, futsal, basket, dan lainnya. Cek ketersediaan, pesan slot, dan bayar dengan mudah — kapan pun, di mana pun.",
    searchPlaceholder: "Cari nama gor, kota, atau jenis olahraga...",
    searchButton: "Cari Lapangan",
  },
  howItWorks: {
    title: "Cara Kerja",
    description: "Empat langkah sederhana untuk mulai bermain.",
    steps: [
      {
        step: "01",
        title: "Cari Lapangan",
        description:
          "Telusuri gor dan lapangan olahraga terdekat sesuai jenis olahraga yang kamu inginkan.",
      },
      {
        step: "02",
        title: "Pilih Jadwal",
        description:
          "Lihat slot waktu yang tersedia dan pilih jadwal yang paling cocok untuk timmu.",
      },
      {
        step: "03",
        title: "Isi Data Booking",
        description:
          "Masukkan informasi kontak dan konfirmasi detail pemesanan sebelum melanjutkan.",
      },
      {
        step: "04",
        title: "Bayar & Main",
        description:
          "Selesaikan pembayaran secara aman, terima konfirmasi, dan langsung siap bermain.",
      },
    ],
  },
  sportsCategories: {
    title: "Kategori Olahraga",
    description: "Berbagai jenis lapangan tersedia untuk kebutuhanmu.",
    categories: [
      {
        name: "Badminton",
        description: "Lapangan indoor dan outdoor dengan jadwal fleksibel.",
      },
      {
        name: "Futsal",
        description: "Lapangan sintetis untuk sepak bola mini dan turnamen.",
      },
      {
        name: "Basketball",
        description:
          "Full court dan half court untuk latihan maupun pertandingan.",
      },
      {
        name: "Volleyball",
        description: "Lapangan indoor dengan permukaan nyaman untuk tim.",
      },
      {
        name: "Tennis",
        description: "Hard court dan lapangan tenis dengan pencahayaan malam.",
      },
      {
        name: "Lainnya",
        description: "Padel, sepak bola, dan olahraga lainnya segera hadir.",
      },
    ],
  },
  whyChooseUs: {
    title: "Kenapa PesanLapangan?",
    description: "Dirancang untuk pemain, tim, dan pengelola gor.",
    benefits: [
      {
        title: "Booking Langsung",
        description:
          "Slot lapangan diperbarui otomatis sehingga kamu tidak double booking.",
      },
      {
        title: "Pembayaran Aman",
        description:
          "Integrasi payment gateway terpercaya untuk transaksi yang cepat dan aman.",
      },
      {
        title: "Nota Digital",
        description:
          "Invoice otomatis setelah pembayaran berhasil, siap disimpan atau dibagikan.",
      },
      {
        title: "Ramah Seluler",
        description:
          "Antarmuka ringan dan responsif, nyaman dipakai dari smartphone.",
      },
    ],
  },
  cta: {
    title: "Siap Main Hari Ini?",
    description:
      "Mulai cari lapangan terdekat dan amankan jadwal favoritmu sebelum penuh.",
    primaryButton: "Cari Lapangan Sekarang",
    secondaryButton: "Pelajari Cara Kerja",
  },
  testimonials: {
    title: "Dipercaya Pemain & Pengelola Gor",
    description:
      "Cerita nyata dari komunitas olahraga yang memakai PesanLapangan.",
    items: [
      {
        quote:
          "Booking jadi jauh lebih rapi. Tim saya bisa pesan slot malam tanpa chat panjang ke admin gor.",
        name: "Rizky A.",
        role: "Kapten Tim Futsal",
      },
      {
        quote:
          "Dashboard pemilik membantu saya melihat booking harian dan pendapatan tanpa buka spreadsheet.",
        name: "Dewi M.",
        role: "Pengelola Gor",
      },
      {
        quote:
          "Pembayaran online dan nota digital membuat main badminton setiap minggu terasa profesional.",
        name: "Bagas P.",
        role: "Pemain Badminton",
      },
    ],
  },
  popularVenues: {
    eyebrow: "Venue Populer",
    title: "Lapangan Favorit Komunitas",
    description:
      "Pilih gor aktif dan lanjutkan booking lapangan favoritmu dalam beberapa langkah.",
  },
  footer: {
    tagline: "Platform booking lapangan olahraga modern untuk Indonesia.",
    links: [
      { label: "Cari Lapangan", href: "#cari-lapangan" },
      { label: "Keunggulan", href: "#keunggulan" },
      { label: "Venue Populer", href: "#venue-populer" },
      { label: "Cara Kerja", href: "#cara-kerja" },
    ],
    support: {
      title: "Dukungan",
      description: "Butuh bantuan mengelola venue atau booking?",
      emailLabel: "0821-2727-7641",
      emailHref: "https://wa.me/6282127277641",
    },
    copyright: "Semua hak dilindungi.",
  },
} as const;
