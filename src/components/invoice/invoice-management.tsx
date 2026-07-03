"use client";

import { useEffect, useState, useTransition } from "react";
import { Download, FileText } from "lucide-react";

import { ExportDropdown } from "@/components/export/export-dropdown";
import { InvoiceDetailPanel } from "@/components/invoice/invoice-detail-panel";
import { InvoiceStatusBadge } from "@/components/invoice/invoice-status-badge";
import { TableSkeletonRows } from "@/components/layout/dashboard-page-skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getOwnerInvoiceDetailAction } from "@/domains/invoice/actions/get-owner-invoice-detail.action";
import { listOwnerInvoicesAction } from "@/domains/invoice/actions/list-owner-invoices.action";
import { INVOICE_LIST_DEFAULT_PAGE_SIZE } from "@/domains/invoice/constants";
import type {
  ListOwnerInvoicesResult,
  OwnerInvoiceDetail,
} from "@/domains/invoice/types";
import { layout } from "@/lib/design-system";
import { pageLayout } from "@/lib/layout-system";
import {
  formatBookingDate,
  formatCurrency,
} from "@/domains/booking/utils/booking-display";

type InvoiceFiltersState = {
  invoiceNumberSearch: string;
  bookingNumberSearch: string;
};

const initialFilters = (): InvoiceFiltersState => ({
  invoiceNumberSearch: "",
  bookingNumberSearch: "",
});

function hasActiveFilters(filters: InvoiceFiltersState): boolean {
  return (
    filters.invoiceNumberSearch.trim() !== "" ||
    filters.bookingNumberSearch.trim() !== ""
  );
}

export function InvoiceManagement() {
  const [filters, setFilters] = useState<InvoiceFiltersState>(initialFilters);
  const [listResult, setListResult] = useState<ListOwnerInvoicesResult | null>(
    null,
  );
  const [listError, setListError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<OwnerInvoiceDetail | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [isLoadingList, startListTransition] = useTransition();
  const [isLoadingDetail, startDetailTransition] = useTransition();

  useEffect(() => {
    startListTransition(async () => {
      setListError(null);

      const response = await listOwnerInvoicesAction({
        page,
        pageSize: INVOICE_LIST_DEFAULT_PAGE_SIZE,
        invoiceNumberSearch: filters.invoiceNumberSearch || undefined,
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

  function openDetail(invoiceId: string) {
    setDetailOpen(true);
    setDetail(null);
    setDetailError(null);

    startDetailTransition(async () => {
      const response = await getOwnerInvoiceDetailAction({ invoiceId });

      if (!response.success) {
        setDetailError(response.error);
        setDetail(null);
        return;
      }

      setDetail(response.data);
      setDetailError(null);
    });
  }

  function closeDetail() {
    setDetailOpen(false);
    setDetail(null);
    setDetailError(null);
  }

  const totalPages = listResult
    ? Math.max(1, Math.ceil(listResult.total / listResult.pageSize))
    : 1;

  const filtersActive = hasActiveFilters(filters);
  const isAccountEmpty =
    listResult !== null && listResult.total === 0 && !filtersActive;
  const isSearchEmpty =
    listResult !== null && listResult.items.length === 0 && filtersActive;

  return (
    <div className={layout.page}>
      <PageHeader
        eyebrow="Tagihan"
        title="Invoice"
        description="Lihat dan unduh invoice dari booking yang sudah dibayar."
        actions={
          <ExportDropdown
            endpoint="/api/owner/export/invoices"
            params={{
              invoiceNumberSearch: filters.invoiceNumberSearch || undefined,
              bookingNumberSearch: filters.bookingNumberSearch || undefined,
            }}
            disabled={isAccountEmpty}
          />
        }
      />

      {listError ? (
        <p className="text-destructive text-sm" role="alert">
          {listError}
        </p>
      ) : null}

      {isLoadingList && !listResult ? (
        <Card>
          <CardContent className="py-6">
            <TableSkeletonRows rows={5} columns={6} />
          </CardContent>
        </Card>
      ) : null}

      {isAccountEmpty ? (
        <EmptyState
          icon={FileText}
          title="Belum ada invoice"
          description="Invoice akan muncul otomatis setelah pelanggan menyelesaikan pembayaran booking. Anda bisa mengunduh PDF invoice kapan saja dari halaman ini."
        />
      ) : null}

      {!isAccountEmpty && listResult ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Filter</CardTitle>
            </CardHeader>
            <CardContent className={pageLayout.filterGridTwoCol}>
              <div className="space-y-2">
                <Label htmlFor="invoice-number-search">Nomor Invoice</Label>
                <Input
                  id="invoice-number-search"
                  value={filters.invoiceNumberSearch}
                  onChange={(event) => {
                    setPage(1);
                    setFilters((current) => ({
                      ...current,
                      invoiceNumberSearch: event.target.value,
                    }));
                  }}
                  placeholder="Cari nomor invoice"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="booking-number-search">Nomor Booking</Label>
                <Input
                  id="booking-number-search"
                  value={filters.bookingNumberSearch}
                  onChange={(event) => {
                    setPage(1);
                    setFilters((current) => ({
                      ...current,
                      bookingNumberSearch: event.target.value,
                    }));
                  }}
                  placeholder="Cari nomor booking"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Daftar Invoice</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nomor Invoice</TableHead>
                      <TableHead>Booking</TableHead>
                      <TableHead>Pelanggan</TableHead>
                      <TableHead>Lapangan</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isSearchEmpty ? (
                      <TableRow>
                        <TableCell colSpan={8}>
                          <p className="text-muted-foreground py-4 text-center text-sm">
                            Tidak ada invoice yang cocok dengan filter. Coba
                            ubah kata kunci pencarian.
                          </p>
                        </TableCell>
                      </TableRow>
                    ) : null}

                    {listResult.items.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">
                          {invoice.invoiceNumber}
                        </TableCell>
                        <TableCell>{invoice.bookingNumber}</TableCell>
                        <TableCell>{invoice.customerName}</TableCell>
                        <TableCell>{invoice.courtName}</TableCell>
                        <TableCell>
                          {formatBookingDate(invoice.bookingDate)}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(invoice.totalAmount)}
                        </TableCell>
                        <TableCell>
                          <InvoiceStatusBadge
                            invoiceStatus={invoice.status}
                            paymentStatus={invoice.paymentStatus}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => openDetail(invoice.id)}
                            >
                              Lihat
                            </Button>
                            <a
                              href={`/dashboard/invoices/${invoice.id}/pdf`}
                              className="inline-flex"
                            >
                              <Button type="button" variant="outline" size="sm">
                                <Download className="size-4" />
                                Unduh PDF
                              </Button>
                            </a>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {!isSearchEmpty ? (
                <div className="flex items-center justify-between gap-3">
                  <p className="text-muted-foreground text-sm">
                    Halaman {page} dari {totalPages}
                    {` · ${listResult.total} invoice`}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={page <= 1 || isLoadingList}
                      onClick={() =>
                        setPage((current) => Math.max(1, current - 1))
                      }
                    >
                      Sebelumnya
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages || isLoadingList}
                      onClick={() =>
                        setPage((current) => Math.min(totalPages, current + 1))
                      }
                    >
                      Berikutnya
                    </Button>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </>
      ) : null}

      <InvoiceDetailPanel
        open={detailOpen}
        detail={detail}
        isLoading={isLoadingDetail}
        error={detailError}
        onClose={closeDetail}
      />
    </div>
  );
}
