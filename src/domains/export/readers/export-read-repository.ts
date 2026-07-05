import type { BookingStatus, Prisma } from "@/generated/prisma/client";

import { startOfDay } from "@/domains/availability/utils/time-interval";
import { EXPORT_MAX_ROWS } from "@/domains/export/constants";
import type {
  ExportBookingsQuery,
  ExportInvoicesQuery,
} from "@/domains/export/schemas";
import { prisma } from "@/lib/db/prisma";

export type ExportBookingRecord = {
  id: string;
  bookingNumber: string;
  bookingDate: Date;
  startMinute: number;
  endMinute: number;
  durationMinute: number;
  totalPrice: number;
  status: BookingStatus;
  courtNameSnapshot: string;
  createdAt: Date;
  customerName: string;
  customerPhone: string;
  payments: { status: string; amount: number }[];
};

function buildBookingWhere(
  ownerId: string,
  filters: Omit<ExportBookingsQuery, "format" | "sort">,
): Prisma.BookingWhereInput {
  return {
    court: {
      gor: {
        ownerId,
      },
    },
    ...(filters.courtId ? { courtId: filters.courtId } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.bookingDate
      ? { bookingDate: startOfDay(new Date(filters.bookingDate)) }
      : {}),
    ...(filters.bookingNumberSearch
      ? {
          bookingNumber: {
            contains: filters.bookingNumberSearch,
            mode: "insensitive",
          },
        }
      : {}),
  };
}

export async function findBookingsForExport(
  ownerId: string,
  filters: ExportBookingsQuery,
): Promise<ExportBookingRecord[]> {
  const where = buildBookingWhere(ownerId, filters);

  const bookings = await prisma.booking.findMany({
    where,
    orderBy: {
      createdAt: filters.sort === "newest" ? "desc" : "asc",
    },
    take: EXPORT_MAX_ROWS,
    select: {
      id: true,
      bookingNumber: true,
      bookingDate: true,
      startMinute: true,
      endMinute: true,
      durationMinute: true,
      totalPrice: true,
      status: true,
      courtNameSnapshot: true,
      createdAt: true,
      contact: {
        select: {
          customerName: true,
          customerPhone: true,
        },
      },
      payments: {
        select: {
          status: true,
          amount: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  return bookings.map((booking) => ({
    id: booking.id,
    bookingNumber: booking.bookingNumber,
    bookingDate: booking.bookingDate,
    startMinute: booking.startMinute,
    endMinute: booking.endMinute,
    durationMinute: booking.durationMinute,
    totalPrice: booking.totalPrice,
    status: booking.status,
    courtNameSnapshot: booking.courtNameSnapshot,
    createdAt: booking.createdAt,
    customerName: booking.contact?.customerName ?? "-",
    customerPhone: booking.contact?.customerPhone ?? "-",
    payments: booking.payments,
  }));
}

export type ExportInvoiceRecord = {
  invoiceNumber: string;
  bookingNumber: string;
  customerName: string;
  courtName: string;
  bookingDate: Date;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  generatedAt: Date;
};

export async function findInvoicesForExport(
  ownerId: string,
  filters: Omit<ExportInvoicesQuery, "format">,
): Promise<ExportInvoiceRecord[]> {
  const invoices = await prisma.invoice.findMany({
    where: {
      status: "GENERATED",
      payment: {
        booking: {
          court: {
            gor: {
              ownerId,
            },
          },
        },
      },
      ...(filters.invoiceNumberSearch
        ? {
            invoiceNumber: {
              contains: filters.invoiceNumberSearch,
              mode: "insensitive",
            },
          }
        : {}),
      ...(filters.bookingNumberSearch
        ? {
            bookingNumberSnapshot: {
              contains: filters.bookingNumberSearch,
              mode: "insensitive",
            },
          }
        : {}),
    },
    orderBy: {
      generatedAt: "desc",
    },
    take: EXPORT_MAX_ROWS,
    select: {
      invoiceNumber: true,
      bookingNumberSnapshot: true,
      customerNameSnapshot: true,
      courtNameSnapshot: true,
      bookingDateSnapshot: true,
      totalAmountSnapshot: true,
      status: true,
      generatedAt: true,
      payment: {
        select: {
          status: true,
        },
      },
    },
  });

  return invoices.map((invoice) => ({
    invoiceNumber: invoice.invoiceNumber,
    bookingNumber: invoice.bookingNumberSnapshot,
    customerName: invoice.customerNameSnapshot,
    courtName: invoice.courtNameSnapshot,
    bookingDate: invoice.bookingDateSnapshot,
    totalAmount: invoice.totalAmountSnapshot,
    status: invoice.status,
    paymentStatus: invoice.payment.status,
    generatedAt: invoice.generatedAt,
  }));
}

export type ExportRevenueRecord = {
  bookingNumber: string;
  customerName: string;
  amount: number;
  status: string;
  method: string;
  paidAt: Date | null;
  createdAt: Date;
};

export async function findRevenuePaymentsForExport(
  ownerId: string,
  rangeFrom: Date,
  rangeTo: Date,
): Promise<ExportRevenueRecord[]> {
  const payments = await prisma.payment.findMany({
    where: {
      booking: {
        court: {
          gor: {
            ownerId,
          },
        },
      },
      OR: [
        {
          status: "PAID",
          paidAt: {
            gte: rangeFrom,
            lte: rangeTo,
          },
        },
        {
          status: {
            not: "PAID",
          },
          createdAt: {
            gte: rangeFrom,
            lte: rangeTo,
          },
        },
      ],
    },
    orderBy: {
      paidAt: "desc",
    },
    take: EXPORT_MAX_ROWS,
    select: {
      amount: true,
      status: true,
      method: true,
      paidAt: true,
      createdAt: true,
      booking: {
        select: {
          bookingNumber: true,
          contact: {
            select: {
              customerName: true,
            },
          },
        },
      },
    },
  });

  return payments.map((payment) => ({
    bookingNumber: payment.booking.bookingNumber,
    customerName: payment.booking.contact?.customerName ?? "-",
    amount: payment.amount,
    status: payment.status,
    method: payment.method,
    paidAt: payment.paidAt,
    createdAt: payment.createdAt,
  }));
}
