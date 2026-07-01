"use server";

import {
  formatInvoiceZodError,
  getOwnerInvoiceDetailSchema,
} from "@/domains/invoice/actions/schemas";
import { getOwnerInvoiceService } from "@/domains/invoice/actions/get-owner-invoice-service";
import {
  actionFailure,
  actionSuccess,
  type ActionResponse,
} from "@/domains/booking/actions/types";
import { InvoiceNotFoundError } from "@/domains/invoice/errors";
import type { OwnerInvoiceDetail } from "@/domains/invoice/types";
import { requireOwnerId } from "@/lib/auth/get-owner-id";
import { requireOwnerSession } from "@/lib/auth/require-owner-session";
import {
  createKnownActionError,
  handleServerActionError,
} from "@/lib/server/actions";

export async function getOwnerInvoiceDetailAction(
  input: unknown,
): Promise<ActionResponse<OwnerInvoiceDetail>> {
  const session = await requireOwnerSession();
  const parsed = getOwnerInvoiceDetailSchema.safeParse(input);

  if (!parsed.success) {
    return actionFailure(formatInvoiceZodError(parsed.error));
  }

  try {
    const ownerId = await requireOwnerId(session.user.id);
    const invoice = await getOwnerInvoiceService().getInvoiceDetail(
      parsed.data.invoiceId,
      ownerId,
    );

    return actionSuccess(invoice);
  } catch (error) {
    return handleServerActionError("getOwnerInvoiceDetailAction", error, {
      fallbackMessage: "Gagal memuat detail invoice.",
      knownErrors: [
        createKnownActionError(
          InvoiceNotFoundError,
          "Invoice tidak ditemukan.",
        ),
      ],
    });
  }
}
