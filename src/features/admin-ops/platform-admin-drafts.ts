export type OrganizationCreationDraft = {
  name: string;
  allowed_email_domain: string;
  admin_full_name: string;
  admin_email: string;
  plan_slug: string;
};

const ORGANIZATION_DRAFT_KEY = "wyrefy.platformAdmin.organizationDraft";

const EMPTY_DRAFT: OrganizationCreationDraft = {
  name: "",
  allowed_email_domain: "",
  admin_full_name: "",
  admin_email: "",
  plan_slug: "",
};

export function emptyOrganizationCreationDraft(): OrganizationCreationDraft {
  return { ...EMPTY_DRAFT };
}

export function readOrganizationCreationDraft(): OrganizationCreationDraft | null {
  if (typeof window === "undefined" || !globalThis.sessionStorage) return null;
  const rawValue = globalThis.sessionStorage.getItem(ORGANIZATION_DRAFT_KEY);
  if (!rawValue) return null;
  try {
    const parsed = JSON.parse(rawValue) as Partial<OrganizationCreationDraft>;
    return {
      name: parsed.name ?? "",
      allowed_email_domain: parsed.allowed_email_domain ?? "",
      admin_full_name: parsed.admin_full_name ?? "",
      admin_email: parsed.admin_email ?? "",
      plan_slug: parsed.plan_slug ?? "",
    };
  } catch {
    return null;
  }
}

export function writeOrganizationCreationDraft(draft: OrganizationCreationDraft): void {
  if (typeof window === "undefined" || !globalThis.sessionStorage) return;
  globalThis.sessionStorage.setItem(ORGANIZATION_DRAFT_KEY, JSON.stringify(draft));
}

export function clearOrganizationCreationDraft(): void {
  if (typeof window === "undefined" || !globalThis.sessionStorage) return;
  globalThis.sessionStorage.removeItem(ORGANIZATION_DRAFT_KEY);
}
