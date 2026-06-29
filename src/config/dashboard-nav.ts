import {
  BarChart3,
  CalendarDays,
  Clock,
  CreditCard,
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
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Bookings",
    href: "/dashboard/bookings",
    icon: CalendarDays,
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    title: "Courts",
    href: "/dashboard/courts",
    icon: MapPin,
  },
  {
    title: "Pricing",
    href: "/dashboard/pricing",
    icon: Tags,
  },
  {
    title: "Operating Hours",
    href: "/dashboard/operating-hours",
    icon: Clock,
  },
  {
    title: "Payments",
    href: "/dashboard/payments",
    icon: CreditCard,
  },
  {
    title: "Invoices",
    href: "/dashboard/invoices",
    icon: FileText,
  },
  {
    title: "Subscription",
    href: "/dashboard/subscription",
    icon: Sparkles,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];
