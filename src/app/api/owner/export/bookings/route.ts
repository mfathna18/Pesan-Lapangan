import { exportBookingsFile } from "@/domains/export/services/export-booking-service";
import {
  exportBookingsQuerySchema,
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
  const parsed = exportBookingsQuerySchema.safeParse(
    Object.fromEntries(searchParams.entries()),
  );

  if (!parsed.success) {
    return createExportErrorResponse(formatExportZodError(parsed.error));
  }

  try {
    const ownerId = await requireOwnerId(session.user.id);
    const result = await exportBookingsFile(ownerId, parsed.data);

    return createExportDownloadResponse(result);
  } catch (error) {
    console.error("exportBookingsRoute", error);
    return createExportErrorResponse("Gagal mengekspor data booking.", 500);
  }
}
