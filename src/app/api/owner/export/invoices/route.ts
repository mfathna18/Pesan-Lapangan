import { exportInvoicesFile } from "@/domains/export/services/export-invoice-service";
import {
  exportInvoicesQuerySchema,
  formatExportZodError,
} from "@/domains/export/schemas";
import {
  createExportDownloadResponse,
  createExportErrorResponse,
  createExportUnauthorizedResponse,
  parseSearchParams,
} from "@/domains/export/utils/export-http";
import { requireOwnerId } from "@/lib/auth/get-owner-id";
import { getOwnerApiSession } from "@/lib/auth/get-owner-api-session";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await getOwnerApiSession();

  if (!session) {
    return createExportUnauthorizedResponse();
  }

  const searchParams = parseSearchParams(request);
  const parsed = exportInvoicesQuerySchema.safeParse(
    Object.fromEntries(searchParams.entries()),
  );

  if (!parsed.success) {
    return createExportErrorResponse(formatExportZodError(parsed.error));
  }

  try {
    const ownerId = await requireOwnerId(session.user.id);
    const result = await exportInvoicesFile(ownerId, parsed.data);

    return createExportDownloadResponse(result);
  } catch (error) {
    console.error("exportInvoicesRoute", error);
    return createExportErrorResponse("Gagal mengekspor data invoice.", 500);
  }
}
