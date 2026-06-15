import { AdminUsageOps } from "@/src/components/admin/admin-usage-ops";

export const metadata = {
  title: "Platform Usage | Wyrefy",
  description: "Inspect platform usage and telemetry in Wyrefy.",
};

export default function UsagePage() {
  return <AdminUsageOps />;
}
