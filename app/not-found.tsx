"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AccessState } from "@/src/components/ui/loading-states";
import { me } from "@/src/features/auth/api";
import { routeForUser } from "@/src/features/auth/routing";
import { useAuthStore } from "@/src/features/auth/store";

export default function NotFound() {
  const { replace } = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const [target, setTarget] = useState("/login");

  useEffect(() => {
    me()
      .then((result) => {
        setUser(result.user);
        const next = routeForUser(result.user);
        setTarget(next);
        globalThis.setTimeout(() => replace(next), 1200);
      })
      .catch(() => {
        setUser(null);
        globalThis.setTimeout(() => replace("/login"), 1200);
      });
  }, [replace, setUser]);

  return (
    <AccessState
      title="Page not found"
      message="That page is not available. Wyrefy will return you to the correct entry point."
      href={target}
      actionLabel="Return now"
      kind="not-found"
    />
  );
}
