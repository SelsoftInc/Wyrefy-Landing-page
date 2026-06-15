import { SignupForm } from "@/src/components/auth/signup-form";

export default async function SignupPage({
  searchParams,
}: Readonly<{
  searchParams?: Promise<{ google_name?: string; google_email?: string }>;
}>) {
  const params = await searchParams;
  return <SignupForm initialName={params?.google_name ?? ""} initialEmail={params?.google_email ?? ""} />;
}
