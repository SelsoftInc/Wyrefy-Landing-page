"use client";

import { AccessState } from "@/src/components/ui/loading-states";
import { useAuthStore } from "@/src/features/auth/store";

function dashboardForRole(role?: string, userType?: string) {
  if (role === "platform_admin") return "/platform_admin/dashboard";
  if (userType === "organization") return "/organization/dashboard";
  return "/individual/dashboard";
}

export default function ForbiddenPage() {
  const user = useAuthStore((state) => state.user);
  return (
    <AccessState
      title="Access unavailable"
      message="This area is not available for your current role or organization permissions."
      href={dashboardForRole(user?.role, user?.user_type)}
      actionLabel="Return to dashboard"
    />
  );
}
