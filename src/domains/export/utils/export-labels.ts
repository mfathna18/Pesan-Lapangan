const BOOKING_STATUS_LABELS: Record<string, string> = {
  PENDING: "Menunggu",
  CONFIRMED: "Dikonfirmasi",
  CANCELLED: "Dibatalkan",
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  NONE: "Belum Ada",
  PENDING: "Menunggu",
  PAID: "Lunas",
  FAILED: "Gagal",
  EXPIRED: "Kedaluwarsa",
  REFUNDED: "Dikembalikan",
};

const INVOICE_STATUS_LABELS: Record<string, string> = {
  GENERATED: "Diterbitkan",
  VOID: "Batal",
};

export function formatExportBookingStatus(status: string): string {
  return BOOKING_STATUS_LABELS[status] ?? status;
}

export function formatExportPaymentStatus(status: string): string {
  return PAYMENT_STATUS_LABELS[status] ?? status;
}

export function formatExportInvoiceStatus(status: string): string {
  return INVOICE_STATUS_LABELS[status] ?? status;
}

export function formatExportAmount(amount: number): string {
  return String(amount);
}

export function formatExportDateTime(value: Date | null): string {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

export function formatExportDate(value: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(value);
}

export function formatExportTimeRange(
  startMinute: number,
  endMinute: number,
): string {
  const formatMinute = (minute: number) => {
    const hours = Math.floor(minute / 60);
    const mins = minute % 60;
    return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
  };

  return `${formatMinute(startMinute)} - ${formatMinute(endMinute)}`;
}
