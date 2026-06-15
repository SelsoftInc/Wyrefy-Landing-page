"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

import type { AdminOrganization } from "@/src/features/auth/types";

import { PlatformOrganizationDetail } from "./platform-user-management-detail";
import { PlatformOrganizationsSection } from "./platform-user-management-organizations";
import { PlatformUsersSection } from "./platform-user-management-users";

const tabs = ["Organizations", "Individual users", "Platform Admin"] as const;

type PlatformUserManagementTab = (typeof tabs)[number];

function tabLabel(item: PlatformUserManagementTab) {
  if (item === "Organizations") return "Orgs";
  if (item === "Individual users") return "Users";
  return "Admin";
}

export function PlatformUserManagement() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<PlatformUserManagementTab>(searchParams?.get("resumeOrgDraft") === "1" ? "Organizations" : "Organizations");
  const [selectedOrg, setSelectedOrg] = useState<AdminOrganization | null>(null);

  return (
    <div className="space-y-5">
      <div className="flex justify-center w-full overflow-hidden">
        <div className="glass-card flex w-full sm:w-auto gap-1 sm:gap-2 rounded-3xl p-1.5 sm:p-2 overflow-x-auto no-scrollbar">
          {tabs.map((item) => (
            <button
              type="button"
              key={item}
              onClick={() => setTab(item)}
              className={`flex-1 sm:flex-none sm:min-w-[160px] px-3 sm:px-6 rounded-2xl py-2 sm:py-3 text-xs sm:text-sm font-medium transition-all shrink-0 ${tab === item ? "bg-[var(--accent)] text-white shadow-sm" : "text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]"}`}
            >
              <span className="hidden sm:inline">{item}</span>
              <span className="sm:hidden">{tabLabel(item)}</span>
            </button>
          ))}
        </div>
      </div>
      {tab === "Organizations" ? <PlatformOrganizationsSection onSelect={setSelectedOrg} /> : null}
      {tab === "Individual users" ? <PlatformUsersSection type="individual" /> : null}
      {tab === "Platform Admin" ? <PlatformUsersSection type="platform_admin" /> : null}
      {selectedOrg ? <PlatformOrganizationDetail organization={selectedOrg} onClose={() => setSelectedOrg(null)} /> : null}
    </div>
  );
}
