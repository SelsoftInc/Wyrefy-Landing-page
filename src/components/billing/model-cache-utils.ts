export type ModelCacheMode = "none" | "explicit_context_cache" | "provider_implicit_cache";

const CACHE_MODE_LABELS: Record<ModelCacheMode, string> = {
  none: "No cache",
  explicit_context_cache: "Explicit context cache",
  provider_implicit_cache: "Provider implicit cache",
};

export function cacheModeLabel(value: unknown): string {
  return CACHE_MODE_LABELS[cacheModeValue(value)];
}

export function cacheModeValue(value: unknown): ModelCacheMode {
  return typeof value === "string" && value in CACHE_MODE_LABELS ? (value as ModelCacheMode) : "none";
}
