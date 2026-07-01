import { NextResponse } from "next/server";

import { getOwnerInvoiceService } from "@/domains/invoice/actions/get-owner-invoice-service";
import { InvoiceNotFoundError } from "@/domains/invoice/errors";
import { requireOwnerId } from "@/lib/auth/get-owner-id";
import { requireOwnerSession } from "@/lib/auth/require-owner-session";

export const runtime = "nodejs";

type OwnerInvoicePdfRouteProps = {
  params: Promise<{
    invoiceId: string;
  }>;
};

export async function GET(
  _request: Request,
  { params }: OwnerInvoicePdfRouteProps,
) {
  const session = await requireOwnerSession();
  const ownerId = await requireOwnerId(session.user.id);
  const { invoiceId } = await params;

  try {
    const { buffer, filename } =
      await getOwnerInvoiceService().generatePdfForOwner(invoiceId, ownerId);

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-cache",
      },
    });
  } catch (error) {
    if (error instanceof InvoiceNotFoundError) {
      return NextResponse.json(
        { error: "Invoice tidak ditemukan." },
        { status: 404 },
      );
    }

    throw error;
  }
}
