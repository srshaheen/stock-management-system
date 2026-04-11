import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  History,
  Settings,
} from "lucide-react";

export const NAV_ITEMS = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Inventory", href: "/inventory", icon: Package },
  { label: "New Sale", href: "/sales/new", icon: ShoppingCart },
  { label: "Sales History", href: "/sales", icon: History },
  { label: "Buyers", href: "/buyers", icon: Users },
  { label: "All Logs", href: "/stock-history", icon: Users },
  { label: "Settings", href: "/settings", icon: Settings },
];
