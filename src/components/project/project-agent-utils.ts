import type { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/src/features/query-keys";

export function extractFigmaUrl(value: string) {
  return /https:\/\/(?:www\.)?figma\.com\/[^\s]+/i.exec(value)?.[0] ?? null;
}

export function invalidateCreditQueries(
  queryClient: QueryClient,
  ownerType: "individual" | "organization",
  ownerScopeId: string,
  projectId: string,
) {
  [
    queryKeys.billingSummary(ownerType, ownerScopeId),
    queryKeys.projectDetail(projectId),
    queryKeys.projectList(ownerType, ownerScopeId),
  ].forEach((queryKey) => {
    queryClient.invalidateQueries({ queryKey });
  });
}
