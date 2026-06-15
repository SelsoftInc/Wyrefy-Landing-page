"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { initializeTheme } from "@/src/features/theme/store";
import { ToastProvider } from "@/src/components/ui/toast";
import { useAuthStore } from "@/src/features/auth/store";
import { me } from "@/src/features/auth/api";
import { usePathname, useRouter } from "next/navigation";
import { SmoothScroll } from "@/src/components/ui/SmoothScroll";

const PUBLIC_ROUTES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/terms",
  "/privacy",
  "/contact",
  "/invite",
  "/verify-first-login",
  "/google-confirmation",
];

function isPublicRoute(pathname: string, searchParams: URLSearchParams) {
  if (pathname === "/" || PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return true;
  }
  return pathname === "/organization/billing" && searchParams.has("token");
}

export function AppProviders({ children }: Readonly<{ children: React.ReactNode }>) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  }));
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const pathname = usePathname();
  const { replace } = useRouter();

  useEffect(() => {
    const searchParams = new URLSearchParams(globalThis.location.search);
    if (!isPublicRoute(pathname, searchParams) || user) return;

    let cancelled = false;
    me()
      .then((res) => {
        if (cancelled) return;
        setUser(res.user);
      })
      .catch(() => {
        if (cancelled) return;
        setUser(null);
      });

    return () => {
      cancelled = true;
    };
  }, [setUser, user, pathname]);

  useEffect(() => {
    if (user?.password_setup_required && pathname !== "/setup-password") {
      replace("/setup-password");
    }
  }, [user, pathname, replace]);

  useEffect(() => {
    return initializeTheme();
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <SmoothScroll>
          {children}
        </SmoothScroll>
      </ToastProvider>
    </QueryClientProvider>
  );
}
