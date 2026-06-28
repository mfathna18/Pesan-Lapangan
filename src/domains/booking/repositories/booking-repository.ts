import type {
  CreateBookingInput,
  DeleteBookingInput,
  FindBookingByCourtAndDateInput,
  UpdateBookingStatusInput,
} from "@/domains/booking/types";
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

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export class BookingRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: CreateBookingInput): Promise<BookingWithContact> {
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
