import { ProtectedOrganizationShell } from "@/src/components/auth/protected-shells";
import { OrganizationBillingPageContent } from "@/src/components/billing/organization-billing-page-content";
import { requireOrganizationUser } from "@/src/features/auth/server";

type OrganizationBillingPageProps = Readonly<{
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>;

export default async function OrganizationBillingPage({ searchParams }: OrganizationBillingPageProps) {
  const params = await searchParams;
  const onboardingToken = typeof params.token === "string" ? params.token : undefined;

  if (onboardingToken) {
    return <OrganizationBillingPageContent />;
  }

  const user = await requireOrganizationUser();
  return (
    <ProtectedOrganizationShell user={user}>
      <OrganizationBillingPageContent />
    </ProtectedOrganizationShell>
  );
}
