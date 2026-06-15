import { ForgotPasswordForm } from "@/src/components/auth/forgot-password-form";

export default function ForgotPasswordPage({
  searchParams,
}: Readonly<{
  searchParams?: { email?: string };
}>) {
  return <ForgotPasswordForm initialEmail={searchParams?.email ?? ""} />;
}
