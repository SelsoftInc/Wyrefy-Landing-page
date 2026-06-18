"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { AccessState } from "@/src/components/ui/loading-states";
export default function NotFound() {
  const { replace } = useRouter();

  useEffect(() => {
    globalThis.setTimeout(() => replace("/"), 2500);
  }, [replace]);

  return (
    <AccessState
      title="Page not found"
      message="That page is not available. Wyrefy will return you to the correct entry point."
      href="/"
      actionLabel="Return now"
      kind="not-found"
    />
  );
}
