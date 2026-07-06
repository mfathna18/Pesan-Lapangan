import type { AdminVenueRow } from "@/domains/admin/types";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type AdminVenuesTableProps = {
  venues: AdminVenueRow[];
};

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function AdminVenuesTable({ venues }: AdminVenuesTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Venues</CardTitle>
        <CardDescription>
          {venues.length} venue terdaftar di platform
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Venue Name</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Courts</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {venues.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-muted-foreground py-10 text-center text-sm"
                >
                  Belum ada venue.
                </TableCell>
              </TableRow>
            ) : (
              venues.map((venue) => (
                <TableRow key={venue.id}>
                  <TableCell className="font-medium">
                    {venue.venueName}
                  </TableCell>
                  <TableCell>{venue.ownerName}</TableCell>
                  <TableCell>{venue.city || "—"}</TableCell>
                  <TableCell>{venue.courtCount}</TableCell>
                  <TableCell>
                    <Badge variant={venue.isActive ? "confirmed" : "expired"}>
                      {venue.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDateTime(venue.updatedAt)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
