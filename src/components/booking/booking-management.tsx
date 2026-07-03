"use client";

import { useEffect, useState, useTransition } from "react";

import { BookingDetailPanel } from "@/components/booking/booking-detail-panel";
import {
  BookingStatusBadge,
  PaymentStatusBadge,
} from "@/components/booking/booking-status-badges";
import { ExportDropdown } from "@/components/export/export-dropdown";
import { TableSkeletonRows } from "@/components/layout/dashboard-page-skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
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
import { UI_COPY } from "@/config/ui-copy";
import { layout } from "@/lib/design-system";
import { pageLayout } from "@/lib/layout-system";
import { CalendarDays } from "lucide-react";

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
  const [filterOptionsError, setFilterOptionsError] = useState<string | null>(
    null,
  );
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
        setFilterOptionsError(null);
        return;
      }

      setFilterOptionsError(response.error);
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
      <div className={layout.page}>
        <PageHeader
          eyebrow="Manajemen"
          title="Booking"
          description="Kelola dan pantau seluruh booking venue Anda."
          actions={
            <div className="flex flex-wrap gap-2">
              <ExportDropdown
                endpoint="/api/owner/export/bookings"
                params={{
                  sort: filters.sort,
                  courtId: filters.courtId,
                  status: filters.status,
                  bookingDate: filters.bookingDate || undefined,
                  bookingNumberSearch: filters.bookingNumberSearch || undefined,
                }}
              />
              <ExportDropdown
                label="Export Pelanggan"
                endpoint="/api/owner/export/customers"
                params={{
                  sort: filters.sort,
                  courtId: filters.courtId,
                  status: filters.status,
                  bookingDate: filters.bookingDate || undefined,
                  bookingNumberSearch: filters.bookingNumberSearch || undefined,
                }}
              />
            </div>
          }
        />

        <Card>
          <CardHeader>
            <CardTitle>Filter</CardTitle>
          </CardHeader>
          <CardContent>
            {filterOptionsError ? (
              <p className="text-destructive mb-4 text-sm" role="alert">
                {filterOptionsError}
              </p>
            ) : null}
            <div className={pageLayout.filterGrid}>
              <div className="space-y-2">
                <Label htmlFor="booking-date">Tanggal</Label>
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
                <Label>{UI_COPY.court}</Label>
                <Select
                  value={filters.courtId}
                  onValueChange={(value) =>
                    updateFilter("courtId", value ?? "all")
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={UI_COPY.allCourts} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{UI_COPY.allCourts}</SelectItem>
                    {filterOptions?.courts.map((court) => (
                      <SelectItem key={court.id} value={court.id}>
                        {court.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status Booking</Label>
                <Select
                  value={filters.status}
                  onValueChange={(value) =>
                    updateFilter("status", value ?? "all")
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Semua status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua status</SelectItem>
                    <SelectItem value="PENDING">Menunggu</SelectItem>
                    <SelectItem value="CONFIRMED">Dikonfirmasi</SelectItem>
                    <SelectItem value="CANCELLED">Dibatalkan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="booking-number-search">
                  Cari Nomor Booking
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
                <Label>Urutkan</Label>
                <Select
                  value={filters.sort}
                  onValueChange={(value) =>
                    updateFilter("sort", value as "newest" | "oldest")
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Urutkan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Terbaru</SelectItem>
                    <SelectItem value="oldest">Terlama</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daftar Booking</CardTitle>
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
                  <TableHead>Nomor Booking</TableHead>
                  <TableHead>Pelanggan</TableHead>
                  <TableHead>{UI_COPY.court}</TableHead>
                  <TableHead>Tanggal Booking</TableHead>
                  <TableHead>Jam</TableHead>
                  <TableHead>{UI_COPY.status}</TableHead>
                  <TableHead>Pembayaran</TableHead>
                  <TableHead className="text-right">
                    {UI_COPY.actions}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingList && !listResult ? (
                  <TableRow>
                    <TableCell colSpan={8} className="p-6">
                      <TableSkeletonRows rows={5} columns={8} />
                    </TableCell>
                  </TableRow>
                ) : null}

                {!isLoadingList &&
                listResult &&
                listResult.items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="p-0">
                      <EmptyState
                        variant="plain"
                        icon={CalendarDays}
                        title="Belum ada booking"
                        description="Booking dari pelanggan akan muncul di sini. Pastikan lapangan, jam operasional, dan harga sudah diatur."
                      />
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
                        {UI_COPY.view}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-muted-foreground text-sm">
                Halaman {listResult?.page ?? page} dari {totalPages}
                {listResult ? ` · ${listResult.total} booking` : ""}
              </p>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1 || isLoadingList}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  {UI_COPY.previous}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages || isLoadingList}
                  onClick={() =>
                    setPage((current) => Math.min(totalPages, current + 1))
                  }
                >
                  {UI_COPY.next}
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
