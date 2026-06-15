"use client";

import { useEffect, useRef, useState } from "react";
import { Laptop, Moon, Sun, User as UserIcon, LogOut, Mail, Shield, Loader2 } from "lucide-react";
import { useThemeStore } from "@/src/features/theme/store";
import { useAuthStore } from "@/src/features/auth/store";
import { logout, billingSummary, organizationBillingSummary, currentOrganization } from "@/src/features/auth/api";
import { queryKeys } from "@/src/features/query-keys";
import { useRouter, usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

function creditBalanceLabel(value: unknown) {
  return value == null ? "0.0000" : Number(value).toFixed(4);
}

const themes = [
  { key: "system", label: "System", Icon: Laptop },
  { key: "light", label: "Light", Icon: Sun },
  { key: "dark", label: "Dark", Icon: Moon },
] as const;
const ONE_HOUR_MS = 60 * 60 * 1000;

export function UserProfileMenu() {
  const { theme, setTheme } = useThemeStore();
  const user = useAuthStore((state) => state.user);
  const pathname = usePathname();
  
  const isOrgContext = pathname.startsWith("/organization") || pathname.startsWith("/platform-admin");
  
  const organization = useQuery({ 
    queryKey: queryKeys.currentOrganization(user?.id ?? ""), 
    queryFn: currentOrganization,
    enabled: isOrgContext && Boolean(user),
    staleTime: ONE_HOUR_MS,
  });
  const ownerScopeId = isOrgContext ? organization.data?.id : user?.id;

  const { data: billing } = useQuery({ 
    queryKey: ownerScopeId ? queryKeys.billingSummary(isOrgContext ? "organization" : "individual", ownerScopeId) : ["billing-summary", "idle"], 
    queryFn: () => isOrgContext ? organizationBillingSummary() : billingSummary(),
    enabled: Boolean(ownerScopeId),
    staleTime: ONE_HOUR_MS,
  });
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { replace } = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function onLogout() {
    setIsLoggingOut(true);
    await logout().catch(() => null);
    replace("/login");
  }

  const initials = user?.full_name
    ? user.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "";

  return (
    <div className="relative z-[1000]" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3.5 rounded-full border border-[var(--border)]/50 bg-[var(--surface)] p-1.5 pl-4 transition-all duration-300 hover:bg-[var(--surface-hover)] hover:border-blue-500/30 hover:scale-[1.02] shadow-lg shadow-black/10 active:scale-95 group"
      >
        <div className="hidden text-left md:block px-1">
          <p className="text-xs font-semibold leading-none text-[var(--foreground)] group-hover:text-blue-400 transition-colors">{user?.full_name ?? "Guest User"}</p>
          <p className="mt-1 text-[8px] font-medium uppercase tracking-[0.22em] text-blue-500 leading-none">
            {user?.role === "individual_user" ? "User" : user?.role.replace("_", " ") ?? "Unknown Role"}
          </p>
        </div>
        <div className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs font-medium shadow-md shadow-blue-500/25 relative border border-blue-400/25 ring-4 ring-blue-500/5">
          {initials || <UserIcon size={16} className="text-white" />}
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-[1001] mt-3 w-72 origin-top-right rounded-2xl border border-[var(--border)] bg-white dark:bg-[#0B1221] p-2 shadow-2xl shadow-black/40 backdrop-blur-3xl transition-all duration-200">
          {/* User Info Section */}
          <div className="mb-2 p-3 pb-4 border-b border-[var(--border)]">
            <p className="text-sm font-medium text-[var(--foreground)]">{user?.full_name}</p>
            <div className="mt-2 space-y-1.5">
              <div className="flex items-center gap-2 text-[11px] text-[var(--muted)]">
                <Mail size={12} />
                <span className="truncate">{user?.email}</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-medium text-[var(--accent)] uppercase tracking-wider">
                <Shield size={12} />
                <span>{user?.role === "individual_user" ? "User" : user?.role.replace("_", " ")}</span>
              </div>
            </div>
          </div>

          <div className="my-1 h-px bg-[var(--border)]" />

          {/* Credits Section */}
          {pathname.startsWith("/platform-admin") || user?.role === "platform_admin" ? null : (
            <>
              <div className="p-1">
                <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">Credit Balance</p>
                <div className="px-3 pb-2 text-3xl font-bold tracking-tighter text-[var(--foreground)]">
                  {creditBalanceLabel(billing?.credit_balance)}
                </div>
              </div>
              <div className="my-1 h-px bg-[var(--border)]" />
            </>
          )}

          {/* Theme Switcher Section */}
          <div className="p-1 hidden">
            <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">Theme Preference</p>
            <div className="grid grid-cols-3 gap-1">
              {themes.map(({ key, label, Icon }) => (
                <button
                  type="button"
                  key={key}
                  onClick={() => setTheme(key)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl py-2.5 text-[10px] font-medium transition-all ${
                    theme === key 
                      ? "bg-gradient-to-br from-[var(--accent)] to-[var(--accent-strong)] text-white shadow-lg shadow-[var(--accent)]/20" 
                      : "text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
                  }`}
                >
                  <Icon size={14} strokeWidth={2.5} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="my-2 h-px bg-[var(--border)]" />

          {/* Logout Section */}
          <button
            type="button"
            onClick={onLogout}
            disabled={isLoggingOut}
            className={`group flex w-full items-center gap-3 rounded-xl p-3 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/10
              ${isLoggingOut ? "opacity-50 pointer-events-none" : ""}`}
          >
            {isLoggingOut ? (
              <Loader2 size={16} className="animate-spin text-red-500 shrink-0" />
            ) : (
              <LogOut size={16} strokeWidth={2.5} className="transition-transform group-hover:-translate-x-1" />
            )}
            {isLoggingOut ? "Logging out..." : "Log out"}
          </button>
        </div>
      )}
    </div>
  );
}
