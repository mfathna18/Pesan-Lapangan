import { exportCustomersFile } from "@/domains/export/services/export-customer-service";
import {
  exportCustomersQuerySchema,
  formatExportZodError,
} from "@/domains/export/schemas";
import {
  createExportDownloadResponse,
  createExportErrorResponse,
  createExportUnauthorizedResponse,
  parseSearchParams,
} from "@/domains/export/utils/export-http";
import { requireOwnerExportSession } from "@/domains/export/utils/require-owner-export-session";
import { requireOwnerId } from "@/lib/auth/get-owner-id";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { session, errorResponse } = await requireOwnerExportSession();

  if (!session) {
    return errorResponse ?? createExportUnauthorizedResponse();
  }

  const searchParams = parseSearchParams(request);
  const parsed = exportCustomersQuerySchema.safeParse(
    Object.fromEntries(searchParams.entries()),
  );

  if (!parsed.success) {
    return createExportErrorResponse(formatExportZodError(parsed.error));
  }

  try {
    const ownerId = await requireOwnerId(session.user.id);
    const result = await exportCustomersFile(ownerId, parsed.data);

    return createExportDownloadResponse(result);
  } catch (error) {
    console.error("exportCustomersRoute", error);
    return createExportErrorResponse("Gagal mengekspor data pelanggan.", 500);
  }
}
