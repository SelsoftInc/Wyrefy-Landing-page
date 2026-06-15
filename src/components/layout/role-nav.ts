import { BarChart3, CreditCard, FolderKanban, LayoutDashboard, Plug, Settings, Users } from "lucide-react";

import type { CurrentOrganization } from "@/src/features/auth/types";
import type { NavItem } from "@/src/components/layout/dashboard-shell";

export const individualNav: NavItem[] = [
  { label: "Dashboard", href: "/individual/dashboard", Icon: LayoutDashboard },
  { label: "Project & Workspace", href: "/individual/projects", Icon: FolderKanban },
  { label: "Connectors", href: "/individual/connectors", Icon: Plug },
  { label: "Billing & Subscription", href: "/individual/billing", Icon: CreditCard },
  { label: "Settings", href: "/individual/settings", Icon: Settings },
];


export const organizationNav: NavItem[] = [
  { label: "Dashboard", href: "/organization/dashboard", Icon: LayoutDashboard },
  { label: "Team Management", href: "/organization/team", Icon: Users },
  { label: "Project & Workspace", href: "/organization/projects", Icon: FolderKanban },
  { label: "Connectors", href: "/organization/connectors", Icon: Plug },
  { label: "Billing & Subscription", href: "/organization/billing", Icon: CreditCard },
  { label: "Settings", href: "/organization/settings", Icon: Settings },
];

export function organizationNavForPermissions(organization?: CurrentOrganization | null): NavItem[] {
  return organizationNav.filter((item) => {
    if (item.href === "/organization/team") {
      return Boolean(organization?.can_manage_members);
    }
    if (item.href === "/organization/billing") {
      return Boolean(organization?.can_manage_billing);
    }
    return true;
  });
}

export const platformNav: NavItem[] = [
  { label: "Dashboard", href: "/platform_admin/dashboard", Icon: LayoutDashboard },
  { label: "User Management", href: "/platform_admin/user-management", Icon: Users },
  { label: "Plan & Billing", href: "/platform_admin/plan-billing", Icon: CreditCard },
  { label: "Platform Usage", href: "/platform_admin/usage", Icon: BarChart3 },
  { label: "Report", href: "/platform_admin/reports", Icon: FolderKanban },
  // { label: "Notification", href: "/platform_admin/notifications", Icon: Bell },
  { label: "Settings", href: "/platform_admin/settings", Icon: Settings },
];
