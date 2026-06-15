"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { DashboardShell } from "@/src/components/layout/dashboard-shell";
import { individualNav, organizationNavForPermissions, platformNav } from "@/src/components/layout/role-nav";
import { currentOrganization } from "@/src/features/auth/api";
import { queryKeys } from "@/src/features/query-keys";
import { useAuthStore } from "@/src/features/auth/store";

import type { User } from "@/src/features/auth/types";

type ProtectedShellProps = Readonly<{
  user: User;
  children: React.ReactNode;
}>;

function sameUser(current: User | null, next: User) {
  return current?.id === next.id &&
    current.email === next.email &&
    current.full_name === next.full_name &&
    current.role === next.role &&
    current.status === next.status &&
    current.user_type === next.user_type &&
    current.redirect_path === next.redirect_path &&
    current.password_setup_required === next.password_setup_required;
}

function AuthStoreBootstrap({ user, children }: ProtectedShellProps) {
  useEffect(() => {
    const current = useAuthStore.getState().user;
    if (!sameUser(current, user)) {
      useAuthStore.setState({ user });
    }
  }, [user]);

  return children;
}

export function ProtectedIndividualShell({ user, children }: ProtectedShellProps) {
  return (
    <AuthStoreBootstrap user={user}>
      <DashboardShell nav={individualNav} homeHref="/individual/dashboard">{children}</DashboardShell>
    </AuthStoreBootstrap>
  );
}

export function ProtectedOrganizationShell({ user, children }: ProtectedShellProps) {
  const organization = useQuery({
    queryKey: queryKeys.currentOrganization(user.id),
    queryFn: currentOrganization,
  });

  return (
    <AuthStoreBootstrap user={user}>
      <DashboardShell nav={organizationNavForPermissions(organization.data)} homeHref="/organization/dashboard">{children}</DashboardShell>
    </AuthStoreBootstrap>
  );
}

export function ProtectedPlatformAdminShell({ user, children }: ProtectedShellProps) {
  return (
    <AuthStoreBootstrap user={user}>
      <DashboardShell nav={platformNav} homeHref="/platform_admin/dashboard">{children}</DashboardShell>
    </AuthStoreBootstrap>
  );
}
