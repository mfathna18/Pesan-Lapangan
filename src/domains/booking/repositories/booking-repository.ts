import type {
  AnalyticsDashboardQueryInput,
  AnalyticsSnapshotRecord,
  CreateBookingInput,
  DeleteBookingInput,
  FindBookingByCourtAndDateInput,
  ListBookingsInput,
  UpdateBookingStatusInput,
} from "@/domains/booking/types";
import { resolveBookingExpiresAt } from "@/domains/booking/utils/booking-expiration";
import type {
  BookingStatus,
  Prisma,
  PrismaClient,
} from "@/generated/prisma/client";

const bookingWithContactArgs = {
  include: {
    contact: true,
  },
} satisfies Prisma.BookingDefaultArgs;

export type BookingWithContact = Prisma.BookingGetPayload<
  typeof bookingWithContactArgs
>;

const bookingListArgs = {
  include: {
    contact: true,
    payments: {
      orderBy: {
        createdAt: "desc" as const,
      },
    },
  },
} satisfies Prisma.BookingDefaultArgs;

export type BookingWithContactAndPayments = Prisma.BookingGetPayload<
  typeof bookingListArgs
>;

const bookingDetailArgs = {
  include: {
    contact: true,
    payments: {
      orderBy: {
        createdAt: "desc" as const,
      },
      include: {
        invoice: true,
      },
    },
  },
} satisfies Prisma.BookingDefaultArgs;

export type BookingDetailRecord = Prisma.BookingGetPayload<
  typeof bookingDetailArgs
>;

export type PublicCheckoutBookingRecord = {
  id: string;
  bookingNumber: string;
  bookingDate: Date;
  startMinute: number;
  endMinute: number;
  durationMinute: number;
  totalPrice: number;
  pricePerHourSnapshot: number;
  status: BookingStatus;
  expiresAt: Date;
  courtNameSnapshot: string;
  contact: {
    customerName: string;
    customerPhone: string;
    note: string | null;
  } | null;
  court: {
    gor: {
      slug: string;
      name: string;
      bankName: string | null;
      bankAccountNumber: string | null;
      bankAccountHolder: string | null;
      qrisImageUrl: string | null;
    };
  };
};

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

type PrismaDbClient =
  | PrismaClient
  | Omit<
      PrismaClient,
      "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends"
    >;

export class BookingRepository {
  constructor(private readonly prisma: PrismaDbClient) {}

  async create(input: CreateBookingInput): Promise<BookingWithContact> {
    const expiresAt = resolveBookingExpiresAt(new Date());

    return this.prisma.booking.create({
      data: {
        courtId: input.courtId,
        bookingNumber: input.bookingNumber,
        bookingDate: startOfDay(input.bookingDate),
        startMinute: input.startMinute,
        endMinute: input.endMinute,
        durationMinute: input.durationMinute,
        totalPrice: input.totalPrice,
        status: input.status,
        expiresAt,
        gorNameSnapshot: input.gorNameSnapshot,
        courtNameSnapshot: input.courtNameSnapshot,
        sportTypeSnapshot: input.sportTypeSnapshot,
        pricePerHourSnapshot: input.pricePerHourSnapshot,
        contact: {
          create: {
            customerName: input.contact.customerName,
            customerPhone: input.contact.customerPhone,
            note: input.contact.note,
          },
        },
      },
      ...bookingWithContactArgs,
    });
  }

  async findById(id: string): Promise<BookingWithContact | null> {
    return this.prisma.booking.findUnique({
      where: { id },
      ...bookingWithContactArgs,
    });
  }

  async findPublicCheckoutById(
    bookingId: string,
  ): Promise<PublicCheckoutBookingRecord | null> {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        bookingNumber: true,
        bookingDate: true,
        startMinute: true,
        endMinute: true,
        durationMinute: true,
        totalPrice: true,
        pricePerHourSnapshot: true,
        status: true,
        expiresAt: true,
        courtNameSnapshot: true,
        contact: {
          select: {
            customerName: true,
            customerPhone: true,
            note: true,
          },
        },
        court: {
          select: {
            gor: {
              select: {
                slug: true,
                name: true,
                bankName: true,
                bankAccountNumber: true,
                bankAccountHolder: true,
                qrisImageUrl: true,
              },
            },
          },
        },
      },
    });

    if (!booking?.court?.gor) {
      return null;
    }

    return booking;
  }

  async findByBookingNumber(
    bookingNumber: string,
  ): Promise<BookingWithContact | null> {
    return this.prisma.booking.findUnique({
      where: { bookingNumber },
      ...bookingWithContactArgs,
    });
  }

  async findByCourtAndDate(
    input: FindBookingByCourtAndDateInput,
  ): Promise<BookingWithContact[]> {
    return this.prisma.booking.findMany({
      where: {
        courtId: input.courtId,
        bookingDate: startOfDay(input.date),
      },
      orderBy: {
        startMinute: "asc",
      },
      ...bookingWithContactArgs,
    });
  }

  async findManyWithFilters(input: ListBookingsInput): Promise<{
    items: BookingWithContactAndPayments[];
    total: number;
  }> {
    const where: Prisma.BookingWhereInput = {
      court: {
        gor: {
          ownerId: input.ownerId,
        },
      },
      ...(input.courtId ? { courtId: input.courtId } : {}),
      ...(input.status ? { status: input.status } : {}),
      ...(input.bookingDate
        ? { bookingDate: startOfDay(input.bookingDate) }
        : {}),
      ...(input.bookingNumberSearch
        ? {
            bookingNumber: {
              contains: input.bookingNumberSearch,
              mode: "insensitive",
            },
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        orderBy: {
          createdAt: input.sort === "newest" ? "desc" : "asc",
        },
        skip: (input.page - 1) * input.pageSize,
        take: input.pageSize,
        ...bookingListArgs,
      }),
      this.prisma.booking.count({ where }),
    ]);

    return { items, total };
  }

  async findDetailById(
    id: string,
    ownerId: string,
  ): Promise<BookingDetailRecord | null> {
    return this.prisma.booking.findFirst({
      where: {
        id,
        court: {
          gor: {
            ownerId,
          },
        },
      },
      ...bookingDetailArgs,
    });
  }

  async fetchAnalyticsSnapshot(
    input: AnalyticsDashboardQueryInput,
  ): Promise<AnalyticsSnapshotRecord> {
    const ownerCourtFilter = {
      gor: {
        ownerId: input.ownerId,
      },
    };

    const [bookings, courts, operatingHours] = await Promise.all([
      this.prisma.booking.findMany({
        where: {
          bookingDate: {
            gte: startOfDay(input.periodStart),
            lte: startOfDay(input.periodEnd),
          },
          court: ownerCourtFilter,
        },
        select: {
          id: true,
          courtId: true,
          courtNameSnapshot: true,
          status: true,
          bookingDate: true,
          startMinute: true,
          durationMinute: true,
          payments: {
            where: {
              status: "PAID",
            },
            select: {
              amount: true,
            },
          },
        },
      }),
      this.prisma.court.findMany({
        where: {
          isActive: true,
          ...ownerCourtFilter,
        },
        select: {
          id: true,
          name: true,
        },
        orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
      }),
      this.prisma.operatingHours.findMany({
        where: {
          isActive: true,
          court: ownerCourtFilter,
        },
        select: {
          courtId: true,
          dayOfWeek: true,
          startMinute: true,
          endMinute: true,
        },
      }),
    ]);

    return {
      bookings,
      courts,
      operatingHours,
    };
  }

  async expirePendingBookings(
    referenceDate: Date = new Date(),
  ): Promise<{ count: number; bookingIds: string[] }> {
    const expiredBookings = await this.prisma.booking.findMany({
      where: {
        status: "PENDING",
        expiresAt: {
          lt: referenceDate,
        },
      },
      select: {
        id: true,
      },
    });

    if (expiredBookings.length === 0) {
      return { count: 0, bookingIds: [] };
    }

    const bookingIds = expiredBookings.map((booking) => booking.id);

    await this.prisma.payment.updateMany({
      where: {
        bookingId: {
          in: bookingIds,
        },
        status: {
          in: ["PENDING", "AWAITING_CONFIRMATION"],
        },
      },
      data: {
        status: "EXPIRED",
      },
    });

    const result = await this.prisma.booking.updateMany({
      where: {
        id: {
          in: bookingIds,
        },
        status: "PENDING",
      },
      data: {
        status: "CANCELLED",
      },
    });

    return {
      count: result.count,
      bookingIds,
    };
  }

  async updateStatus(
    input: UpdateBookingStatusInput,
  ): Promise<BookingWithContact> {
    return this.prisma.booking.update({
      where: { id: input.id },
      data: { status: input.status },
      ...bookingWithContactArgs,
    });
  }

  async delete(input: DeleteBookingInput): Promise<BookingWithContact> {
    return this.prisma.booking.delete({
      where: { id: input.id },
      ...bookingWithContactArgs,
    });
  }
}

export function createBookingRepository(
  prisma: PrismaClient,
): BookingRepository {
  return new BookingRepository(prisma);
}

export type { BookingStatus };
