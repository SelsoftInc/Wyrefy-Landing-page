import { ProtectedIndividualShell } from "@/src/components/auth/protected-shells";
import { requireIndividualUser } from "@/src/features/auth/server";

export default async function IndividualLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await requireIndividualUser();
  return <ProtectedIndividualShell user={user}>{children}</ProtectedIndividualShell>;
}
