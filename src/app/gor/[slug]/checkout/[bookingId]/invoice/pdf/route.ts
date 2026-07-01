import { NextResponse } from "next/server";

import { getPublicInvoiceService } from "@/domains/invoice/actions/get-public-invoice-service";
import { PublicInvoiceNotFoundError } from "@/domains/invoice/errors";

export const runtime = "nodejs";

type InvoicePdfRouteProps = {
  params: Promise<{
    slug: string;
    bookingId: string;
  }>;
};

export async function GET(_request: Request, { params }: InvoicePdfRouteProps) {
  const { slug, bookingId } = await params;

  try {
    const { buffer, filename } =
      await getPublicInvoiceService().generatePdfForCheckout(slug, bookingId);

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-cache",
      },
    });
  } catch (error) {
    if (error instanceof PublicInvoiceNotFoundError) {
      return NextResponse.json(
        { error: "Invoice tidak ditemukan." },
        { status: 404 },
      );
    }

    throw error;
  }
}
