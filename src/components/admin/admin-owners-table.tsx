"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AdminOwnersListResult } from "@/domains/admin/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { pageLayout } from "@/lib/layout-system";

type AdminOwnersTableProps = {
  data: AdminOwnersListResult;
  searchParams: {
    q?: string;
    plan?: string;
    status?: string;
    page?: string;
  };
};

const PLAN_OPTIONS = ["FREE", "STARTER", "PRO", "ELITE"] as const;
const STATUS_OPTIONS = [
  "TRIAL",
  "ACTIVE",
  "GRACE_PERIOD",
  "EXPIRED",
  "CANCELLED",
] as const;

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function subscriptionStatusVariant(
  status: string | null,
): "confirmed" | "pending" | "cancelled" | "expired" | "outline" {
  switch (status) {
    case "ACTIVE":
    case "TRIAL":
      return "confirmed";
    case "GRACE_PERIOD":
      return "pending";
    case "EXPIRED":
      return "expired";
    case "CANCELLED":
      return "cancelled";
    default:
      return "outline";
  }
}

export function AdminOwnersTable({
  data,
  searchParams,
}: AdminOwnersTableProps) {
  const router = useRouter();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function updateParams(updates: Record<string, string | undefined>) {
    const next = new URLSearchParams(params.toString());

    for (const [key, value] of Object.entries(updates)) {
      if (!value) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    }

    startTransition(() => {
      router.push(`/admin/owners?${next.toString()}`);
    });
  }

  return (
    <div className={pageLayout.cardStack}>
      <Card>
        <CardHeader>
          <CardTitle>Filter</CardTitle>
          <CardDescription>
            Cari dan saring daftar pemilik venue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
            onSubmit={(event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              updateParams({
                q: String(formData.get("q") ?? "").trim() || undefined,
                plan: String(formData.get("plan") ?? "") || undefined,
                status: String(formData.get("status") ?? "") || undefined,
                page: "1",
              });
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="q">Search</Label>
              <Input
                id="q"
                name="q"
                defaultValue={searchParams.q ?? ""}
                placeholder="Nama, email, atau GOR"
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan">Plan</Label>
              <select
                id="plan"
                name="plan"
                defaultValue={searchParams.plan ?? ""}
                disabled={isPending}
                className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-[var(--radius-button)] border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                <option value="">Semua plan</option>
                {PLAN_OPTIONS.map((plan) => (
                  <option key={plan} value={plan}>
                    {plan}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                defaultValue={searchParams.status ?? ""}
                disabled={isPending}
                className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-[var(--radius-button)] border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                <option value="">Semua status</option>
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? "Memuat..." : "Terapkan"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Owners</CardTitle>
          <CardDescription>
            {data.total} pemilik — halaman {data.page} dari {data.totalPages}
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Owner Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>GOR</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-muted-foreground py-10 text-center text-sm"
                  >
                    Tidak ada pemilik ditemukan.
                  </TableCell>
                </TableRow>
              ) : (
                data.items.map((owner) => (
                  <TableRow key={owner.id}>
                    <TableCell className="font-medium">
                      {owner.ownerName}
                    </TableCell>
                    <TableCell>{owner.email}</TableCell>
                    <TableCell>{owner.gorName ?? "—"}</TableCell>
                    <TableCell>{owner.plan ?? "—"}</TableCell>
                    <TableCell>
                      {owner.status ? (
                        <Badge
                          variant={subscriptionStatusVariant(owner.status)}
                        >
                          {owner.status}
                        </Badge>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>{formatDateTime(owner.createdAt)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <div className="mt-4 flex items-center justify-between gap-4">
            <Button
              type="button"
              variant="outline"
              disabled={data.page <= 1 || isPending}
              onClick={() =>
                updateParams({ page: String(Math.max(1, data.page - 1)) })
              }
            >
              Sebelumnya
            </Button>
            <p className="text-muted-foreground text-sm">
              Halaman {data.page} / {data.totalPages}
            </p>
            <Button
              type="button"
              variant="outline"
              disabled={data.page >= data.totalPages || isPending}
              onClick={() => updateParams({ page: String(data.page + 1) })}
            >
              Berikutnya
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
