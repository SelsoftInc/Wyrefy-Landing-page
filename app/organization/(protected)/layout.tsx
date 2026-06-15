import { ProtectedOrganizationShell } from "@/src/components/auth/protected-shells";
import { requireOrganizationUser } from "@/src/features/auth/server";

export default async function ProtectedOrganizationLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await requireOrganizationUser();
  return <ProtectedOrganizationShell user={user}>{children}</ProtectedOrganizationShell>;
}
