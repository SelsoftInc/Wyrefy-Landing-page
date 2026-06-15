"use client";

import Image from "next/image";

const PROVIDER_LOGO_FALLBACKS: Record<string, string> = {
  anthropic: "claude",
  claude: "claude",
  deepseek: "deepseek",
  gemini: "gemini",
  google: "gemini",
  grok: "grok",
  minimax: "minimax",
  moonshot: "moonshot",
  openai: "openai",
  xai: "grok",
  zai: "zai",
};

export const RUNTIME_MODEL_LOGO_OPTIONS = [
  "openai",
  "claude",
  "gemini",
  "grok",
  "deepseek",
  "zai",
  "minimax",
  "moonshot",
] as const;

export type RuntimeModelLogoName = (typeof RUNTIME_MODEL_LOGO_OPTIONS)[number];

type RuntimeModelLike = {
  provider: string;
  metadata_json?: Record<string, unknown>;
};

export function resolveRuntimeModelLogoName(model: RuntimeModelLike): string | null {
  const configured = typeof model.metadata_json?.logo_name === "string" ? model.metadata_json.logo_name.trim().toLowerCase() : "";
  if (configured) return configured;

  const providerKey = model.provider.trim().toLowerCase();
  return PROVIDER_LOGO_FALLBACKS[providerKey] ?? null;
}

export function runtimeModelLogoPath(logoName: string | null | undefined): string | null {
  if (!logoName) return null;
  return `/llm_model_images/${logoName}.svg`;
}

export function RuntimeModelLogo({
  logoName,
  alt,
  size = 18,
  className = "",
}: Readonly<{
  logoName: string | null | undefined;
  alt: string;
  size?: number;
  className?: string;
}>) {
  const src = runtimeModelLogoPath(logoName);
  if (!src) return null;

  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/90 ring-1 ring-black/5 dark:bg-slate-950/70 dark:ring-white/10 ${className}`}
      style={{ width: size, height: size }}
    >
      <Image src={src} alt={alt} width={size} height={size} className="h-[78%] w-[78%] object-contain" />
    </span>
  );
}

export function FigmaMark({ size = 14 }: Readonly<{ size?: number }>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2H8a4 4 0 1 0 0 8h4z" fill="#F24E1E" />
      <path d="M12 10H8a4 4 0 1 0 0 8h4z" fill="#A259FF" />
      <path d="M8 18a4 4 0 1 0 4 4v-4z" fill="#0ACF83" />
      <path d="M12 2h4a4 4 0 1 1 0 8h-4z" fill="#FF7262" />
      <path d="M20 14a4 4 0 1 1-8 0 4 4 0 0 1 8 0" fill="#1ABCFE" />
    </svg>
  );
}
