import {
  formatBookingDate,
  formatCurrency,
  formatTimeRange,
} from "@/domains/booking/utils/booking-display";
import type { WhatsAppBookingContext } from "@/domains/whatsapp/whatsapp-types";

export type OwnerNewBookingTemplateVars = {
  ownerName: string;
  customerName: string;
  courtName: string;
  date: string;
  time: string;
  amount: string;
  link: string;
};

export type OwnerPaymentAwaitingTemplateVars = {
  bookingNumber: string;
  customerName: string;
  amount: string;
  link: string;
};

export type OwnerBookingCancelledTemplateVars = Record<string, never>;

export type CustomerBookingCreatedTemplateVars = {
  amount: string;
};

export type CustomerPaymentApprovedTemplateVars = {
  link: string;
};

export type CustomerPaymentRejectedTemplateVars = Record<string, never>;

export type CustomerBookingReminderTemplateVars = {
  time: string;
  courtName: string;
};

export type OwnerSubscriptionActivatedTemplateVars = {
  planLabel: string;
  link: string;
};

export function buildOwnerNewBookingMessage(
  vars: OwnerNewBookingTemplateVars,
): string {
  return [
    `Halo ${vars.ownerName}`,
    "",
    "Ada booking baru.",
    "",
    "Customer:",
    vars.customerName,
    "",
    "Lapangan:",
    vars.courtName,
    "",
    "Tanggal:",
    vars.date,
    "",
    "Jam:",
    vars.time,
    "",
    "Nominal:",
    vars.amount,
    "",
    "Buka Dashboard:",
    vars.link,
  ].join("\n");
}

export function buildOwnerPaymentAwaitingMessage(
  vars: OwnerPaymentAwaitingTemplateVars,
): string {
  return [
    "Ada pembayaran yang menunggu konfirmasi.",
    "",
    "Booking:",
    vars.bookingNumber,
    "",
    "Customer:",
    vars.customerName,
    "",
    "Nominal:",
    vars.amount,
    "",
    "Klik:",
    vars.link,
  ].join("\n");
}

export function buildOwnerBookingCancelledMessage(): string {
  return ["Booking dibatalkan.", "", "Slot kembali tersedia."].join("\n");
}

export function buildCustomerBookingCreatedMessage(
  vars: CustomerBookingCreatedTemplateVars,
): string {
  return [
    "Booking berhasil dibuat.",
    "",
    "Silakan lakukan pembayaran.",
    "",
    "Nominal:",
    vars.amount,
  ].join("\n");
}

export function buildCustomerPaymentApprovedMessage(
  vars: CustomerPaymentApprovedTemplateVars,
): string {
  return [
    "Pembayaran telah dikonfirmasi.",
    "",
    "Sampai jumpa di GOR.",
    "",
    "Invoice:",
    vars.link,
  ].join("\n");
}

export function buildCustomerPaymentRejectedMessage(): string {
  return [
    "Pembayaran belum dapat diverifikasi.",
    "",
    "Silakan hubungi pengelola.",
  ].join("\n");
}

export function buildCustomerBookingReminderMessage(
  vars: CustomerBookingReminderTemplateVars,
): string {
  return [
    "Besok Anda bermain.",
    "",
    "Jam:",
    vars.time,
    "",
    "Lapangan:",
    vars.courtName,
  ].join("\n");
}

export function buildOwnerSubscriptionActivatedMessage(
  vars: OwnerSubscriptionActivatedTemplateVars,
): string {
  return [
    "Langganan aktif.",
    "",
    `Paket: ${vars.planLabel}`,
    "",
    "Kelola langganan:",
    vars.link,
  ].join("\n");
}

export function buildOwnerNewBookingFromContext(
  context: WhatsAppBookingContext,
  link: string,
): string {
  return buildOwnerNewBookingMessage({
    ownerName: context.ownerName,
    customerName: context.customerName,
    courtName: context.courtName,
    date: formatBookingDate(context.bookingDate),
    time: formatTimeRange(context.startMinute, context.endMinute),
    amount: formatCurrency(context.amount),
    link,
  });
}

export function buildOwnerPaymentAwaitingFromContext(
  context: WhatsAppBookingContext,
  link: string,
): string {
  return buildOwnerPaymentAwaitingMessage({
    bookingNumber: context.bookingNumber,
    customerName: context.customerName,
    amount: formatCurrency(context.amount),
    link,
  });
}

export function buildCustomerBookingCreatedFromContext(
  context: WhatsAppBookingContext,
): string {
  return buildCustomerBookingCreatedMessage({
    amount: formatCurrency(context.amount),
  });
}

export function buildCustomerPaymentApprovedFromContext(link: string): string {
  return buildCustomerPaymentApprovedMessage({ link });
}

export function buildCustomerBookingReminderFromContext(
  context: WhatsAppBookingContext,
): string {
  return buildCustomerBookingReminderMessage({
    time: formatTimeRange(context.startMinute, context.endMinute),
    courtName: context.courtName,
  });
}
