import { ProtectedPlatformAdminShell } from "@/src/components/auth/protected-shells";
import { requirePlatformAdminUser } from "@/src/features/auth/server";

export default async function PlatformAdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await requirePlatformAdminUser();
  return <ProtectedPlatformAdminShell user={user}>{children}</ProtectedPlatformAdminShell>;
}
