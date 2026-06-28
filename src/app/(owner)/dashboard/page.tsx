import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8">
      <div className="space-y-1">
        <p className="text-muted-foreground text-sm font-medium tracking-widest uppercase">
          Overview
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dashboard Coming Soon</CardTitle>
          <CardDescription>
            The owner dashboard shell is ready. Business widgets will be added
            in upcoming sprints.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Use the sidebar to navigate between future owner modules.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
