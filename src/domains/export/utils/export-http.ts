import { NextResponse } from "next/server";

import type { ExportFileResult } from "@/domains/export/types";

export function createExportDownloadResponse(result: ExportFileResult) {
  return new NextResponse(new Uint8Array(result.buffer), {
    status: 200,
    headers: {
      "Content-Type": result.contentType,
      "Content-Disposition": `attachment; filename="${result.filename}"`,
      "Cache-Control": "private, no-cache",
    },
  });
}

export function createExportErrorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function createExportUnauthorizedResponse() {
  return NextResponse.json(
    { error: "Akses ditolak. Silakan masuk sebagai pemilik venue." },
    { status: 401 },
  );
}

export function parseSearchParams(request: Request): URLSearchParams {
  return new URL(request.url).searchParams;
}
