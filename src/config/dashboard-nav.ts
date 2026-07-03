import {
  BarChart3,
  CalendarClock,
  CalendarDays,
  Clock,
  FileText,
  LayoutDashboard,
  MapPin,
  Settings,
  Sparkles,
  Tags,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export type DashboardNavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

export type DashboardNavGroup = {
  label: string;
  items: DashboardNavItem[];
};

export const dashboardNavItems: DashboardNavItem[] = [
  {
    title: "Beranda",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Booking",
    href: "/dashboard/bookings",
    icon: CalendarDays,
  },
  {
    title: "Analitik",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    title: "Pendapatan",
    href: "/dashboard/revenue",
    icon: Wallet,
  },
  {
    title: "Lapangan",
    href: "/dashboard/courts",
    icon: MapPin,
  },
  {
    title: "Harga",
    href: "/dashboard/pricing",
    icon: Tags,
  },
  {
    title: "Jam Operasional",
    href: "/dashboard/operating-hours",
    icon: Clock,
  },
  {
    title: "Ketersediaan",
    href: "/dashboard/availability",
    icon: CalendarClock,
  },
  {
    title: "Invoice",
    href: "/dashboard/invoices",
    icon: FileText,
  },
  {
    title: "Langganan",
    href: "/dashboard/subscription",
    icon: Sparkles,
  },
  {
    title: "Pengaturan",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

const navItemByHref = new Map(
  dashboardNavItems.map((item) => [item.href, item] as const),
);

function pickNavItems(hrefs: string[]): DashboardNavItem[] {
  return hrefs.flatMap((href) => {
    const item = navItemByHref.get(href);
    return item ? [item] : [];
  });
}

export const dashboardNavGroups: DashboardNavGroup[] = [
  {
    label: "Operasional",
    items: pickNavItems([
      "/dashboard",
      "/dashboard/bookings",
      "/dashboard/analytics",
      "/dashboard/revenue",
    ]),
  },
  {
    label: "Venue",
    items: pickNavItems([
      "/dashboard/courts",
      "/dashboard/pricing",
      "/dashboard/operating-hours",
      "/dashboard/availability",
    ]),
  },
  {
    label: "Bisnis",
    items: pickNavItems([
      "/dashboard/invoices",
      "/dashboard/subscription",
      "/dashboard/settings",
    ]),
  },
];
