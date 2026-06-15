"use client";

import { AccessState } from "@/src/components/ui/loading-states";

export default function UnauthorizedPage() {
  return (
    <AccessState
      title="Session required"
      message="Your session is missing or expired. Sign in again to continue."
      href="/login"
      actionLabel="Sign in"
    />
  );
}
