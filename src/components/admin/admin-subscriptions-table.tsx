import type { AdminSubscriptionRow } from "@/domains/admin/types";
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

type AdminSubscriptionsTableProps = {
  subscriptions: AdminSubscriptionRow[];
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", { dateStyle: "medium" });
}

function subscriptionStatusVariant(
  status: AdminSubscriptionRow["status"],
): "confirmed" | "pending" | "cancelled" | "expired" {
  switch (status) {
    case "ACTIVE":
    case "TRIAL":
      return "confirmed";
    case "GRACE_PERIOD":
      return "pending";
    case "EXPIRED":
      return "expired";
    default:
      return "cancelled";
  }
}

export function AdminSubscriptionsTable({
  subscriptions,
}: AdminSubscriptionsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscriptions</CardTitle>
        <CardDescription>
          {subscriptions.length} langganan aktif & historis
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Owner</TableHead>
              <TableHead>Current Plan</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Remaining Days</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscriptions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-muted-foreground py-10 text-center text-sm"
                >
                  Belum ada langganan.
                </TableCell>
              </TableRow>
            ) : (
              subscriptions.map((subscription) => (
                <TableRow key={subscription.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{subscription.ownerName}</p>
                      <p className="text-muted-foreground text-xs">
                        {subscription.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{subscription.plan}</TableCell>
                  <TableCell>{formatDate(subscription.startsAt)}</TableCell>
                  <TableCell>
                    {subscription.expiresAt
                      ? formatDate(subscription.expiresAt)
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={subscriptionStatusVariant(subscription.status)}
                    >
                      {subscription.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {subscription.remainingDays !== null
                      ? `${subscription.remainingDays} hari`
                      : "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
