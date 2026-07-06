import {
  Building2,
  CreditCard,
  LayoutDashboard,
  Server,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";

export type AdminNavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

export const adminNavItems: AdminNavItem[] = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Owners",
    href: "/admin/owners",
    icon: Users,
  },
  {
    title: "Venues",
    href: "/admin/venues",
    icon: Building2,
  },
  {
    title: "Subscriptions",
    href: "/admin/subscriptions",
    icon: Sparkles,
  },
  {
    title: "Payments",
    href: "/admin/payments",
    icon: CreditCard,
  },
  {
    title: "System",
    href: "/admin/system",
    icon: Server,
  },
];
