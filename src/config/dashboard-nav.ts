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
  type LucideIcon,
} from "lucide-react";

export type DashboardNavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
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
