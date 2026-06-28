"use client";

import { useEffect, useState, useTransition } from "react";

import { BookingDetailPanel } from "@/components/booking/booking-detail-panel";
import {
  BookingStatusBadge,
  PaymentStatusBadge,
} from "@/components/booking/booking-status-badges";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getBookingDetailAction } from "@/domains/booking/actions/get-booking-detail.action";
import {
  getBookingFilterOptionsAction,
  listBookingsAction,
} from "@/domains/booking/actions/list-bookings.action";
import { BOOKING_LIST_DEFAULT_PAGE_SIZE } from "@/domains/booking/constants";
import type {
  BookingDetail,
  BookingFilterOptions,
  BookingListItem,
  ListBookingsResult,
} from "@/domains/booking/types";
import {
  formatBookingDate,
  formatMinuteOfDay,
} from "@/domains/booking/utils/booking-display";

type BookingFiltersState = {
  bookingDate: string;
  courtId: string;
  status: string;
  bookingNumberSearch: string;
  sort: "newest" | "oldest";
};

const initialFilters = (): BookingFiltersState => ({
  bookingDate: "",
  courtId: "all",
  status: "all",
  bookingNumberSearch: "",
  sort: "newest",
});

export function BookingManagement() {
  const [filters, setFilters] = useState<BookingFiltersState>(initialFilters);
  const [filterOptions, setFilterOptions] =
    useState<BookingFilterOptions | null>(null);
  const [listResult, setListResult] = useState<ListBookingsResult | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null,
  );
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<BookingDetail | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [isLoadingList, startListTransition] = useTransition();
  const [isLoadingDetail, startDetailTransition] = useTransition();

  useEffect(() => {
    void getBookingFilterOptionsAction().then((response) => {
      if (response.success) {
        setFilterOptions(response.data);
      }
    });
  }, []);

  useEffect(() => {
    startListTransition(async () => {
      setListError(null);

      const response = await listBookingsAction({
        page,
        pageSize: BOOKING_LIST_DEFAULT_PAGE_SIZE,
        sort: filters.sort,
        courtId: filters.courtId === "all" ? undefined : filters.courtId,
        status:
          filters.status === "all"
            ? undefined
            : (filters.status as "PENDING" | "CONFIRMED" | "CANCELLED"),
        bookingDate: filters.bookingDate || undefined,
        bookingNumberSearch: filters.bookingNumberSearch || undefined,
      });

      if (!response.success) {
        setListError(response.error);
        setListResult(null);
        return;
      }

      setListResult(response.data);
    });
  }, [filters, page]);

  const updateFilter = <TKey extends keyof BookingFiltersState>(
    key: TKey,
    value: BookingFiltersState[TKey],
  ) => {
    setPage(1);
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const openDetail = (booking: BookingListItem) => {
    setSelectedBookingId(booking.id);
    setDetailOpen(true);
    setDetail(null);
    setDetailError(null);

    startDetailTransition(async () => {
      const response = await getBookingDetailAction({ id: booking.id });

      if (!response.success) {
        setDetailError(response.error);
        return;
      }

      setDetail(response.data);
    });
  };

  const closeDetail = () => {
    setDetailOpen(false);
    setSelectedBookingId(null);
    setDetail(null);
    setDetailError(null);
  };

  const totalPages = listResult?.totalPages ?? 1;

  return (
    <>
      <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8">
        <div className="space-y-1">
          <p className="text-muted-foreground text-sm font-medium tracking-widest uppercase">
            Management
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">Bookings</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              <div className="space-y-2">
                <Label htmlFor="booking-date">Date</Label>
                <Input
                  id="booking-date"
                  type="date"
                  value={filters.bookingDate}
                  onChange={(event) =>
                    updateFilter("bookingDate", event.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Court</Label>
                <Select
                  value={filters.courtId}
                  onValueChange={(value) =>
                    updateFilter("courtId", value ?? "all")
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All courts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All courts</SelectItem>
                    {filterOptions?.courts.map((court) => (
                      <SelectItem key={court.id} value={court.id}>
                        {court.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Booking Status</Label>
                <Select
                  value={filters.status}
                  onValueChange={(value) =>
                    updateFilter("status", value ?? "all")
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="booking-number-search">
                  Search Booking Number
                </Label>
                <Input
                  id="booking-number-search"
                  placeholder="BK-20260628-0001"
                  value={filters.bookingNumberSearch}
                  onChange={(event) =>
                    updateFilter("bookingNumberSearch", event.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Sort</Label>
                <Select
                  value={filters.sort}
                  onValueChange={(value) =>
                    updateFilter("sort", value as "newest" | "oldest")
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="oldest">Oldest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Booking List</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {listError ? (
              <p className="text-destructive text-sm" role="alert">
                {listError}
              </p>
            ) : null}

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking Number</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Court</TableHead>
                  <TableHead>Booking Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingList && !listResult ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-muted-foreground">
                      Loading bookings...
                    </TableCell>
                  </TableRow>
                ) : null}

                {!isLoadingList &&
                listResult &&
                listResult.items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-muted-foreground">
                      No bookings found.
                    </TableCell>
                  </TableRow>
                ) : null}

                {listResult?.items.map((booking) => (
                  <TableRow
                    key={booking.id}
                    data-state={
                      selectedBookingId === booking.id ? "selected" : undefined
                    }
                  >
                    <TableCell className="font-medium">
                      {booking.bookingNumber}
                    </TableCell>
                    <TableCell>{booking.customerName}</TableCell>
                    <TableCell>{booking.courtName}</TableCell>
                    <TableCell>
                      {formatBookingDate(booking.bookingDate)}
                    </TableCell>
                    <TableCell>
                      {formatMinuteOfDay(booking.startMinute)} -{" "}
                      {formatMinuteOfDay(booking.endMinute)}
                    </TableCell>
                    <TableCell>
                      <BookingStatusBadge status={booking.bookingStatus} />
                    </TableCell>
                    <TableCell>
                      <PaymentStatusBadge status={booking.paymentStatus} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDetail(booking)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-muted-foreground text-sm">
                Page {listResult?.page ?? page} of {totalPages}
                {listResult ? ` · ${listResult.total} bookings` : ""}
              </p>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1 || isLoadingList}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages || isLoadingList}
                  onClick={() =>
                    setPage((current) => Math.min(totalPages, current + 1))
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <BookingDetailPanel
        booking={detail}
        open={detailOpen}
        loading={isLoadingDetail}
        error={detailError}
        onClose={closeDetail}
      />
    </>
  );
}
