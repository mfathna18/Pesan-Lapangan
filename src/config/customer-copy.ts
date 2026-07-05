/**
 * Sprint 16C — customer-facing UI copy (display strings only)
 */

export const CUSTOMER_COPY = {
  venue: {
    badge: "Tempat Olahraga",
    addressFallback: "Alamat belum tersedia",
    bookCta: "Booking Sekarang",
    viewCourts: "Lihat Lapangan",
    noCourtsTitle: "Belum ada lapangan",
    noCourtsDescription:
      "Venue ini belum menampilkan lapangan yang bisa dipesan. Coba kembali lagi nanti.",
    noSportsTitle: "Belum ada olahraga tersedia",
    noSportsDescription:
      "Jenis olahraga di venue ini belum ditampilkan saat ini.",
    courtAvailable: "Tersedia",
    courtUnavailable: "Tidak Tersedia",
    courtInactiveNote: "Lapangan ini belum bisa dipesan saat ini.",
  },
  discovery: {
    noVenuesTitle: "Belum ada venue tersedia",
    noVenuesDescription:
      "Saat ini belum ada tempat olahraga aktif yang bisa dipesan. Coba kembali lagi nanti.",
    noSearchTitle: "Venue tidak ditemukan",
    noSearchDescription: (query: string) =>
      `Tidak ada venue dengan kata kunci "${query}". Coba nama gor, kota, atau jenis olahraga lain.`,
    clearSearch: "Tampilkan Semua Venue",
    viewVenue: "Lihat Venue",
  },
  court: {
    eyebrow: "Detail Lapangan",
    priceTitle: "Harga Mulai",
    priceDescription: "Perkiraan harga per jam untuk lapangan ini.",
    pricePerHour: "/ jam",
    bookCta: "Booking Sekarang",
    pickTimeCta: "Pilih Waktu",
    noSlotsTitle: "Tidak ada slot tersedia",
    noSlotsDescription:
      "Tidak ada jadwal kosong untuk tanggal ini. Coba tanggal lain atau periksa jam operasional venue.",
    imagePlaceholder: "Foto lapangan segera hadir",
  },
  booking: {
    pickTimeEyebrow: "Pilih Waktu",
    formEyebrow: "Data Booking",
    formTitle: "Lengkapi Informasi",
    formDescription: "Isi data kontak Anda untuk melanjutkan ke pembayaran.",
    customerSection: "Informasi Pelanggan",
    customerHint: "Nama dan nomor telepon wajib diisi.",
    nameLabel: "Nama Lengkap",
    nameRequired: "Wajib",
    phoneLabel: "Nomor Telepon",
    phoneRequired: "Wajib",
    noteLabel: "Catatan",
    noteOptional: "Opsional",
    continueCta: "Lanjutkan ke Pembayaran",
    saving: "Memproses...",
    back: "Kembali",
    pickOtherTime: "Pilih Waktu Lain",
    fillFormCta: "Lanjutkan ke Data Booking",
    reloadSlots: "Perbarui Jadwal",
    rangeEmpty: "Pilih slot waktu untuk melihat ringkasan booking.",
    rangeInvalid:
      "Rentang waktu tidak valid. Pastikan semua jam di antara waktu mulai dan selesai masih tersedia.",
    endBeforeStart: "Waktu selesai harus setelah waktu mulai.",
    slotUnavailable:
      "Slot waktu yang dipilih sudah tidak tersedia. Silakan pilih waktu lain.",
    slotPastCutoff: "Waktu booking telah terlewat.",
  },
  checkout: {
    eyebrow: "Pembayaran",
    title: "Selesaikan Pembayaran",
    description: "Tinjau detail booking Anda, lalu lanjutkan pembayaran.",
    manualDescription:
      "Transfer sesuai nominal ke rekening atau QRIS pemilik venue, lalu konfirmasi setelah membayar.",
    manualBanner:
      "Pembayaran langsung ke pemilik venue. PesanLapangan tidak menerima dana booking.",
    confirmPaid: "Saya Sudah Membayar",
    cancelBooking: "Batalkan Booking",
    waitingOwnerTitle: "Pembayaran Sedang Diverifikasi",
    waitingOwnerDescription:
      "Pemilik lapangan akan memeriksa pembayaran Anda. Mohon tunggu konfirmasi.",
    waitingOwnerBanner:
      "Status: Menunggu Konfirmasi Owner. Anda tidak perlu melakukan tindakan lagi.",
    waitingConfirmButton: "Menunggu Konfirmasi Owner",
    rejectedTitle: "Pembayaran Ditolak",
    rejectedDescription:
      "Pembayaran Anda ditolak oleh pemilik venue. Hubungi venue jika perlu klarifikasi.",
    rejectedBanner: "Status: Pembayaran Ditolak",
    summaryTitle: "Ringkasan Booking",
    customerTitle: "Informasi Pelanggan",
    breakdownTitle: "Rincian Harga",
    totalLabel: "Total Pembayaran",
    payNow: "Bayar Sekarang",
    continuePay: "Lanjutkan Pembayaran",
    processing: "Memproses...",
    paymentMethodTitle: "Metode Pembayaran",
    paymentMethodDescription:
      "Pembayaran aman via kartu, e-wallet, atau transfer bank.",
    paymentMethodName: "Pembayaran Online",
    pendingNote:
      "Anda masih punya sesi pembayaran yang belum selesai. Lanjutkan untuk menyelesaikannya.",
    payErrorTitle: "Pembayaran gagal dimulai",
    venueLabel: "Venue",
    backToVenue: "Kembali ke Venue",
    waitingTitle: "Pembayaran Sedang Diproses",
    waitingDescription:
      "Kami menunggu konfirmasi pembayaran. Halaman ini akan diperbarui otomatis setelah berhasil.",
    waitingBanner: "Kami memeriksa status pembayaran Anda secara otomatis.",
    retryPay: "Coba Bayar Lagi",
    failedTitle: "Pembayaran Gagal",
    failedDescription:
      "Transaksi tidak berhasil. Anda bisa mencoba pembayaran lagi dari halaman pembayaran.",
    expiredTitle: "Booking Sudah Kedaluwarsa",
    expiredDescription:
      "Waktu pembayaran sudah habis dan slot tidak lagi ditahan untuk Anda.",
    expiredAction: "Booking Lagi",
  },
  success: {
    title: "Pembayaran Berhasil!",
    subtitle: "Booking Anda sudah dikonfirmasi.",
    detailsTitle: "Detail Booking",
    paymentTitle: "Ringkasan Pembayaran",
    invoiceTitle: "Invoice",
    invoiceReady: "Invoice sudah tersedia untuk booking ini.",
    invoicePending:
      "Invoice sedang diproses. Halaman akan diperbarui otomatis.",
    invoiceWaiting: "Menyiapkan invoice...",
    viewDetails: "Lihat Detail Booking",
    viewInvoice: "Lihat Invoice",
    downloadPdf: "Unduh PDF",
    backToVenue: "Kembali ke Venue",
    sharePlaceholder: "Bagikan Booking",
    shareHint: "Fitur bagikan segera hadir.",
    paymentMethodFallback: "Pembayaran Online",
    statusPaid: "Lunas",
    statusConfirmed: "Dikonfirmasi",
  },
  invoice: {
    eyebrow: "Invoice",
    issuedAt: (date: string) => `Diterbitkan ${date}`,
    summaryTitle: "Ringkasan Invoice",
    bookingTitle: "Detail Booking",
    customerTitle: "Informasi Pelanggan",
    paymentTitle: "Informasi Pembayaran",
    venueTitle: "Informasi Venue",
    downloadPdf: "Unduh PDF",
    backToSuccess: "Kembali ke Konfirmasi",
    unavailableTitle: "Invoice Belum Tersedia",
    unavailableDescription:
      "Invoice untuk booking ini belum dibuat atau masih diproses.",
    unavailableHint:
      "Jika Anda baru menyelesaikan pembayaran, tunggu beberapa saat lalu buka kembali halaman ini.",
    viewBookingStatus: "Lihat Status Booking",
    backToPayment: "Kembali ke Pembayaran",
  },
  notFound: {
    venueTitle: "Venue Tidak Ditemukan",
    venueDescription:
      "Halaman venue yang Anda cari tidak tersedia atau sudah tidak aktif.",
    checkoutTitle: "Pembayaran Tidak Ditemukan",
    checkoutDescription:
      "Halaman pembayaran yang Anda cari tidak tersedia atau sudah tidak valid.",
    invoiceTitle: "Invoice Tidak Ditemukan",
    invoiceDescription:
      "Invoice untuk booking ini belum tersedia atau sudah tidak valid.",
    backHome: "Kembali ke Beranda",
  },
} as const;
