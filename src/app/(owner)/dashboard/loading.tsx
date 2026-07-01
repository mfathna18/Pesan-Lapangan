export default function DashboardLoading() {
  return (
    <div
      className="text-muted-foreground flex flex-1 items-center justify-center p-8 text-sm"
      aria-live="polite"
      aria-busy="true"
    >
      Memuat dashboard...
    </div>
  );
}
