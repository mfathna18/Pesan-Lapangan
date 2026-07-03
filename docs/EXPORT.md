# Business Data Export

PesanLapangan allows GOR owners to export their business data on demand as CSV or Excel (`.xlsx`). Files are generated in memory and streamed to the browser. Nothing is stored on disk or in object storage.

## Architecture

```
Dashboard UI (Export dropdown)
        │
        ▼
GET /api/owner/export/{bookings|invoices|revenue|customers}
        │
        ├── getOwnerApiSession()  → owner auth
        ├── requireOwnerId()      → tenant scope
        └── export-*-service      → read + format
                │
                ├── export-read-repository (Prisma, owner-scoped reads)
                └── export-file-builder (CSV / ExcelJS)
```

Export lives in `src/domains/export/` and is separate from booking, invoice, and payment write paths. Existing list actions and business services are not modified.

### Components

| Layer                                   | Responsibility                        |
| --------------------------------------- | ------------------------------------- |
| `schemas.ts`                            | Query validation (filters + `format`) |
| `readers/export-read-repository.ts`     | Owner-scoped read queries             |
| `services/export-*-service.ts`          | Row mapping, summary metrics          |
| `utils/export-file-builder.ts`          | CSV encoding, Excel workbook          |
| `app/api/owner/export/*/route.ts`       | HTTP download responses               |
| `components/export/export-dropdown.tsx` | Dashboard UI trigger                  |

## Supported exports

| Resource  | Endpoint                      | Filters respected                                                         |
| --------- | ----------------------------- | ------------------------------------------------------------------------- |
| Bookings  | `/api/owner/export/bookings`  | date, court, status, booking number search, sort                          |
| Invoices  | `/api/owner/export/invoices`  | invoice number search, booking number search                              |
| Revenue   | `/api/owner/export/revenue`   | date range preset (`today`, `7days`, `30days`, `custom`) + custom from/to |
| Customers | `/api/owner/export/customers` | same filters as bookings (aggregated by phone)                            |

Query parameter: `format=csv` or `format=xlsx` (default: `csv`).

## File formats

### CSV

- Built without external libraries
- UTF-8 with BOM (`\uFEFF`) for Excel compatibility
- RFC-style escaping for commas, quotes, and newlines

### Excel (`.xlsx`)

- Generated with [ExcelJS](https://github.com/exceljs/exceljs)
- **Sheet 1 — Data:** column headers + rows
- **Sheet 2 — Summary:** totals, counts, and revenue metrics for the export

Filenames include a timestamp, e.g. `booking-2026-07-03-12-30-00.csv`.

## Security rules

1. **Authentication:** Every export route requires an owner session (`getOwnerApiSession`). Unauthenticated requests receive `401`.
2. **Tenant isolation:** All queries filter by `ownerId` through the GOR → court → booking/payment relationship. Owners never see another venue's data.
3. **On-demand only:** Files are not persisted; each request generates a fresh buffer.
4. **Row cap:** Exports are limited to `EXPORT_MAX_ROWS` (10,000) to protect server memory.
5. **Read-only:** Export code only reads data; it does not create, update, or delete records.

## UI integration

Export dropdowns appear on:

- **Booking** — export bookings + export customers (derived from filtered booking history)
- **Invoice** — export invoices
- **Pendapatan** (`/dashboard/revenue`) — export revenue/payments

The dropdown passes the current page filters as query parameters so the file matches what the owner sees.

## Future extensibility

The export domain is designed to add new resources without touching core business logic:

1. Add a query schema in `schemas.ts`
2. Add a read function in `export-read-repository.ts` (owner-scoped)
3. Add a service in `services/` that returns an `ExportTable`
4. Add an API route under `app/api/owner/export/`
5. Wire `ExportDropdown` on the relevant dashboard page

Possible future exports: courts, pricing rules, operating hours, subscription billing history, PDF bundles, scheduled email reports.
