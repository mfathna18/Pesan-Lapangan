"use server";

import {
  formatInvoiceZodError,
  listOwnerInvoicesSchema,
} from "@/domains/invoice/actions/schemas";
import { getOwnerInvoiceService } from "@/domains/invoice/actions/get-owner-invoice-service";
import {
  actionFailure,
  actionSuccess,
  type ActionResponse,
} from "@/domains/booking/actions/types";
import type { ListOwnerInvoicesResult } from "@/domains/invoice/types";
import { requireOwnerId } from "@/lib/auth/get-owner-id";
import { requireOwnerSession } from "@/lib/auth/require-owner-session";
import { handleServerActionError } from "@/lib/server/actions";

export async function listOwnerInvoicesAction(
  input: unknown,
): Promise<ActionResponse<ListOwnerInvoicesResult>> {
  const session = await requireOwnerSession();
  const parsed = listOwnerInvoicesSchema.safeParse(input);

  if (!parsed.success) {
    return actionFailure(formatInvoiceZodError(parsed.error));
  }

  try {
    const ownerId = await requireOwnerId(session.user.id);
    const result = await getOwnerInvoiceService().listInvoices({
      ownerId,
      page: parsed.data.page,
      pageSize: parsed.data.pageSize,
      invoiceNumberSearch: parsed.data.invoiceNumberSearch || undefined,
      bookingNumberSearch: parsed.data.bookingNumberSearch || undefined,
    });

    return actionSuccess(result);
  } catch (error) {
    return handleServerActionError("listOwnerInvoicesAction", error, {
      fallbackMessage: "Gagal memuat invoice.",
    });
  }
}
