"use client";

import { Plus, Tags } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState, useTransition } from "react";

import {
  PriceRuleFormPanel,
  type PriceRuleFormValues,
} from "@/components/pricing/price-rule-form-panel";
import { TableSkeletonRows } from "@/components/layout/dashboard-page-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
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
import { createPriceRuleAction } from "@/domains/booking/actions/create-price-rule.action";
import { deletePriceRuleAction } from "@/domains/booking/actions/delete-price-rule.action";
import { listCourtsAction } from "@/domains/booking/actions/list-courts.action";
import { listPriceRulesAction } from "@/domains/booking/actions/list-price-rules.action";
import { setPriceRuleActiveAction } from "@/domains/booking/actions/set-price-rule-active.action";
import { updatePriceRuleAction } from "@/domains/booking/actions/update-price-rule.action";
import type {
  OwnerCourtListItem,
  OwnerPriceRuleListItem,
} from "@/domains/booking/types";
import { UI_COPY } from "@/config/ui-copy";
import { layout } from "@/lib/design-system";
import { pageLayout } from "@/lib/layout-system";

type FormMode = "create" | "edit";

export function PricingManagement() {
  const [courts, setCourts] = useState<OwnerCourtListItem[]>([]);
  const [selectedCourtId, setSelectedCourtId] = useState<string>("");
  const [rules, setRules] = useState<OwnerPriceRuleListItem[]>([]);
  const [courtsError, setCourtsError] = useState<string | null>(null);
  const [rulesError, setRulesError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>("create");
  const [selectedRule, setSelectedRule] =
    useState<OwnerPriceRuleListItem | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isLoadingCourts, startCourtsTransition] = useTransition();
  const [isLoadingRules, startRulesTransition] = useTransition();
  const [isSavingForm, startSaveTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [isTogglingActive, startToggleTransition] = useTransition();

  const selectedCourt = courts.find((court) => court.id === selectedCourtId);

  const loadCourts = useCallback(() => {
    startCourtsTransition(async () => {
      setCourtsError(null);

      const response = await listCourtsAction();

      if (!response.success) {
        setCourtsError(response.error);
        setCourts([]);
        return;
      }

      setCourts(response.data);

      if (response.data.length > 0) {
        setSelectedCourtId((current) => current || response.data[0]?.id || "");
      }
    });
  }, []);

  const loadRules = useCallback((courtId: string) => {
    if (!courtId) {
      setRules([]);
      return;
    }

    startRulesTransition(async () => {
      setRulesError(null);
      setActionSuccess(null);

      const response = await listPriceRulesAction({ courtId });

      if (!response.success) {
        setRulesError(response.error);
        setRules([]);
        return;
      }

      setRules(response.data);
    });
  }, []);

  useEffect(() => {
    loadCourts();
  }, [loadCourts]);

  useEffect(() => {
    if (selectedCourtId) {
      loadRules(selectedCourtId);
    }
  }, [selectedCourtId, loadRules]);

  function openCreateForm() {
    setFormMode("create");
    setSelectedRule(null);
    setFormError(null);
    setFormOpen(true);
  }

  function openEditForm(rule: OwnerPriceRuleListItem) {
    setFormMode("edit");
    setSelectedRule(rule);
    setFormError(null);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setFormError(null);
  }

  function handleFormSubmit(values: PriceRuleFormValues) {
    if (!selectedCourtId) {
      return;
    }

    const price = Number(values.price);

    if (!Number.isFinite(price) || price <= 0) {
      setFormError("Harga harus lebih dari nol.");
      return;
    }

    startSaveTransition(async () => {
      setFormError(null);
      setActionError(null);

      const payload = {
        courtId: selectedCourtId,
        dayOfWeek: values.dayOfWeek,
        startTime: values.startTime,
        endTime: values.endTime,
        price,
        isActive: values.isActive,
      };

      const response =
        formMode === "create"
          ? await createPriceRuleAction(payload)
          : await updatePriceRuleAction({
              ...payload,
              priceRuleId: selectedRule?.id ?? "",
            });

      if (!response.success) {
        setFormError(response.error);
        return;
      }

      setFormOpen(false);
      setActionSuccess(
        formMode === "create"
          ? "Aturan harga berhasil dibuat."
          : "Aturan harga berhasil diperbarui.",
      );
      loadRules(selectedCourtId);
    });
  }

  function handleToggleActive(rule: OwnerPriceRuleListItem) {
    if (!selectedCourtId) {
      return;
    }

    setActionError(null);

    startToggleTransition(async () => {
      const response = await setPriceRuleActiveAction({
        courtId: selectedCourtId,
        priceRuleId: rule.id,
        isActive: !rule.isActive,
      });

      if (!response.success) {
        setActionError(response.error);
        return;
      }

      setActionSuccess(
        response.data.isActive
          ? "Aturan harga berhasil diaktifkan."
          : "Aturan harga berhasil dinonaktifkan.",
      );
      loadRules(selectedCourtId);
    });
  }

  function handleDelete(priceRuleId: string) {
    if (!selectedCourtId) {
      return;
    }

    setActionError(null);

    startDeleteTransition(async () => {
      const response = await deletePriceRuleAction({
        courtId: selectedCourtId,
        priceRuleId,
      });

      if (!response.success) {
        setActionError(response.error);
        return;
      }

      setDeleteConfirmId(null);
      setActionSuccess("Aturan harga berhasil dihapus.");
      loadRules(selectedCourtId);
    });
  }

  const isBusy =
    isLoadingCourts ||
    isLoadingRules ||
    isSavingForm ||
    isDeleting ||
    isTogglingActive;

  return (
    <div className={layout.page}>
      <PageHeader
        eyebrow="Venue"
        title="Harga"
        description="Atur aturan harga untuk setiap lapangan."
        actions={
          <Button
            onClick={openCreateForm}
            disabled={!selectedCourtId || isBusy || courts.length === 0}
          >
            <Plus />
            Tambah Aturan Harga
          </Button>
        }
      />

      {courtsError ? (
        <p
          role="alert"
          className="border-destructive/30 bg-destructive/10 text-destructive mb-4 rounded-lg border px-4 py-3 text-sm"
        >
          {courtsError}
        </p>
      ) : null}

      {courts.length === 0 && !isLoadingCourts ? (
        <EmptyState
          icon={Tags}
          title="Belum ada lapangan"
          description="Minimal satu lapangan diperlukan sebelum mengatur aturan harga."
          action={
            <Link href="/dashboard/courts" className={buttonVariants()}>
              Ke Halaman Lapangan
            </Link>
          }
        />
      ) : (
        <div className={pageLayout.cardStack}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Pilih Lapangan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-w-md space-y-2">
                <Label htmlFor="pricing-court">{UI_COPY.court}</Label>
                <Select
                  value={selectedCourtId}
                  onValueChange={(value) =>
                    setSelectedCourtId(value ?? selectedCourtId)
                  }
                  disabled={isBusy || courts.length === 0}
                >
                  <SelectTrigger id="pricing-court" className="w-full">
                    <SelectValue placeholder={UI_COPY.selectCourt}>
                      {() => selectedCourt?.name}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {courts.map((court) => (
                      <SelectItem key={court.id} value={court.id}>
                        {court.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedCourt ? (
                  <p className="text-muted-foreground text-sm">
                    Mengelola harga untuk {selectedCourt.name}.
                  </p>
                ) : null}
              </div>
            </CardContent>
          </Card>

          {rulesError ? (
            <p
              role="alert"
              className="border-destructive/30 bg-destructive/10 text-destructive mb-4 rounded-lg border px-4 py-3 text-sm"
            >
              {rulesError}
            </p>
          ) : null}

          {actionError ? (
            <p
              role="alert"
              className="border-destructive/30 bg-destructive/10 text-destructive mb-4 rounded-lg border px-4 py-3 text-sm"
            >
              {actionError}
            </p>
          ) : null}

          {actionSuccess ? (
            <p
              role="status"
              className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
            >
              {actionSuccess}
            </p>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle>
                {selectedCourt
                  ? `Aturan Harga — ${selectedCourt.name}`
                  : "Aturan Harga"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingRules && rules.length === 0 ? (
                <TableSkeletonRows rows={4} columns={6} />
              ) : rules.length === 0 ? (
                <EmptyState
                  variant="plain"
                  icon={Tags}
                  title="Belum ada aturan harga"
                  description="Tambahkan aturan harga pertama untuk lapangan yang dipilih agar slot booking dapat dihitung."
                  action={
                    <Button
                      onClick={openCreateForm}
                      disabled={!selectedCourtId}
                    >
                      <Plus />
                      Tambah Aturan Harga
                    </Button>
                  }
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hari</TableHead>
                      <TableHead>Mulai</TableHead>
                      <TableHead>Selesai</TableHead>
                      <TableHead>Harga</TableHead>
                      <TableHead>{UI_COPY.status}</TableHead>
                      <TableHead className="text-right">
                        {UI_COPY.actions}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rules.map((rule) => (
                      <TableRow key={rule.id}>
                        <TableCell className="font-medium">
                          {rule.dayLabel}
                        </TableCell>
                        <TableCell>{rule.startTime}</TableCell>
                        <TableCell>{rule.endTime}</TableCell>
                        <TableCell>{rule.priceLabel}</TableCell>
                        <TableCell>
                          <Badge
                            variant={rule.isActive ? "confirmed" : "cancelled"}
                          >
                            {rule.isActive ? UI_COPY.active : UI_COPY.inactive}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-wrap justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditForm(rule)}
                              disabled={isBusy}
                            >
                              {UI_COPY.edit}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleActive(rule)}
                              disabled={isBusy}
                            >
                              {rule.isActive
                                ? UI_COPY.deactivate
                                : UI_COPY.activate}
                            </Button>
                            {deleteConfirmId === rule.id ? (
                              <>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDelete(rule.id)}
                                  disabled={isBusy}
                                >
                                  {isDeleting
                                    ? UI_COPY.deleting
                                    : UI_COPY.confirmDelete}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setDeleteConfirmId(null)}
                                  disabled={isBusy}
                                >
                                  {UI_COPY.cancel}
                                </Button>
                              </>
                            ) : (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setDeleteConfirmId(rule.id)}
                                disabled={isBusy}
                              >
                                {UI_COPY.delete}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <PriceRuleFormPanel
            open={formOpen}
            mode={formMode}
            rule={selectedRule}
            loading={isSavingForm}
            error={formError}
            onClose={closeForm}
            onSubmit={handleFormSubmit}
          />
        </div>
      )}
    </div>
  );
}
