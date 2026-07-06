import type { AdminSystemStatus } from "@/domains/admin/types";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { pageLayout } from "@/lib/layout-system";

type AdminSystemStatusPanelProps = {
  status: AdminSystemStatus;
};

function StatusRow({
  label,
  value,
  variant,
}: {
  label: string;
  value: string;
  variant?: "confirmed" | "expired" | "outline";
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b py-3 last:border-b-0">
      <span className="text-muted-foreground text-sm">{label}</span>
      {variant ? (
        <Badge variant={variant}>{value}</Badge>
      ) : (
        <span className="text-sm font-medium">{value}</span>
      )}
    </div>
  );
}

export function AdminSystemStatusPanel({
  status,
}: AdminSystemStatusPanelProps) {
  return (
    <div className={pageLayout.cardStack}>
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>
            Kesehatan infrastruktur dan informasi deployment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StatusRow
            label="Database Status"
            value={status.database === "healthy" ? "Healthy" : "Unhealthy"}
            variant={status.database === "healthy" ? "confirmed" : "expired"}
          />
          <StatusRow
            label="Storage Status"
            value={
              status.storage === "configured" ? "Configured" : "Not Configured"
            }
            variant={status.storage === "configured" ? "confirmed" : "expired"}
          />
          <StatusRow label="Current Version" value={status.version} />
          <StatusRow label="Environment" value={status.environment} />
          <StatusRow
            label="Deployment Ref"
            value={status.deploymentRef ?? "—"}
          />
          <StatusRow
            label="Deployment Time"
            value={
              status.deploymentTime
                ? new Date(status.deploymentTime).toLocaleString("id-ID")
                : "—"
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
