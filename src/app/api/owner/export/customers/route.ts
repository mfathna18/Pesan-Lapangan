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
import { requireOwnerId } from "@/lib/auth/get-owner-id";
import { getOwnerApiSession } from "@/lib/auth/get-owner-api-session";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await getOwnerApiSession();

  if (!session) {
    return createExportUnauthorizedResponse();
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
