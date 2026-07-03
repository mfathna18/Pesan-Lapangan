"use client";

import { MapPin, Plus } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState, useTransition } from "react";

import {
  CourtFormPanel,
  type CourtFormValues,
} from "@/components/court/court-form-panel";
import { TableSkeletonRows } from "@/components/layout/dashboard-page-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createCourtAction } from "@/domains/booking/actions/create-court.action";
import { deleteCourtAction } from "@/domains/booking/actions/delete-court.action";
import { listCourtsAction } from "@/domains/booking/actions/list-courts.action";
import { setCourtActiveAction } from "@/domains/booking/actions/set-court-active.action";
import { updateCourtAction } from "@/domains/booking/actions/update-court.action";
import { UI_COPY } from "@/config/ui-copy";
import type { OwnerCourtListItem } from "@/domains/booking/types";
import { layout } from "@/lib/design-system";

type FormMode = "create" | "edit";

export function CourtManagement() {
  const [courts, setCourts] = useState<OwnerCourtListItem[]>([]);
  const [listError, setListError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>("create");
  const [selectedCourt, setSelectedCourt] = useState<OwnerCourtListItem | null>(
    null,
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isLoadingList, startListTransition] = useTransition();
  const [isSavingForm, startSaveTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [isTogglingActive, startToggleTransition] = useTransition();

  const loadCourts = useCallback(() => {
    startListTransition(async () => {
      setListError(null);

      const response = await listCourtsAction();

      if (!response.success) {
        setListError(response.error);
        setCourts([]);
        return;
      }

      setCourts(response.data);
    });
  }, []);

  useEffect(() => {
    loadCourts();
  }, [loadCourts]);

  function openCreateForm() {
    setFormMode("create");
    setSelectedCourt(null);
    setFormError(null);
    setFormOpen(true);
  }

  function openEditForm(court: OwnerCourtListItem) {
    setFormMode("edit");
    setSelectedCourt(court);
    setFormError(null);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setFormError(null);
  }

  function handleFormSubmit(values: CourtFormValues) {
    startSaveTransition(async () => {
      setFormError(null);

      const response =
        formMode === "create"
          ? await createCourtAction(values)
          : await updateCourtAction({
              ...values,
              courtId: selectedCourt?.id ?? "",
            });

      if (!response.success) {
        setFormError(response.error);
        return;
      }

      setFormOpen(false);
      loadCourts();
    });
  }

  function handleToggleActive(court: OwnerCourtListItem) {
    setActionError(null);

    startToggleTransition(async () => {
      const response = await setCourtActiveAction({
        courtId: court.id,
        isActive: !court.isActive,
      });

      if (!response.success) {
        setActionError(response.error);
        return;
      }

      loadCourts();
    });
  }

  function handleDelete(courtId: string) {
    setActionError(null);

    startDeleteTransition(async () => {
      const response = await deleteCourtAction({ courtId });

      if (!response.success) {
        setActionError(response.error);
        return;
      }

      setDeleteConfirmId(null);
      loadCourts();
    });
  }

  const isBusy =
    isLoadingList || isSavingForm || isDeleting || isTogglingActive;

  return (
    <div className={layout.page}>
      <PageHeader
        eyebrow="Venue"
        title="Lapangan"
        description="Kelola lapangan venue kamu dari halaman ini."
        actions={
          <Button onClick={openCreateForm} disabled={isBusy}>
            <Plus />
            Tambah Lapangan
          </Button>
        }
      />

      {listError ? (
        <p
          role="alert"
          className="border-destructive/30 bg-destructive/10 text-destructive mb-4 rounded-lg border px-4 py-3 text-sm"
        >
          {listError}
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

      <Card>
        <CardHeader>
          <CardTitle>Lapangan Anda</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingList && courts.length === 0 ? (
            <TableSkeletonRows rows={4} columns={4} />
          ) : courts.length === 0 ? (
            <EmptyState
              variant="plain"
              icon={MapPin}
              title="Belum ada lapangan"
              description="Tambahkan lapangan pertama Anda untuk melanjutkan onboarding venue."
              tips={
                <p>
                  Jika profil GOR belum diatur, lengkapi di{" "}
                  <Link
                    href="/dashboard/settings"
                    className="text-foreground underline"
                  >
                    Pengaturan
                  </Link>{" "}
                  terlebih dahulu.
                </p>
              }
              action={
                <Button onClick={openCreateForm}>
                  <Plus />
                  Tambah Lapangan
                </Button>
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Olahraga</TableHead>
                  <TableHead>{UI_COPY.status}</TableHead>
                  <TableHead className="text-right">
                    {UI_COPY.actions}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courts.map((court) => (
                  <TableRow key={court.id}>
                    <TableCell className="font-medium">{court.name}</TableCell>
                    <TableCell>{court.sportLabel}</TableCell>
                    <TableCell>
                      <Badge
                        variant={court.isActive ? "confirmed" : "cancelled"}
                      >
                        {court.isActive ? UI_COPY.active : UI_COPY.inactive}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditForm(court)}
                          disabled={isBusy}
                        >
                          {UI_COPY.edit}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleActive(court)}
                          disabled={isBusy}
                        >
                          {court.isActive
                            ? UI_COPY.deactivate
                            : UI_COPY.activate}
                        </Button>
                        {deleteConfirmId === court.id ? (
                          <>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(court.id)}
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
                            onClick={() => setDeleteConfirmId(court.id)}
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

      <CourtFormPanel
        open={formOpen}
        mode={formMode}
        court={selectedCourt}
        loading={isSavingForm}
        error={formError}
        onClose={closeForm}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}
