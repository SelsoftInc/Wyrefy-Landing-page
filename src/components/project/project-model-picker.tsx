"use client";

import { Bot, Check, ChevronDown, Search, Sparkles } from "lucide-react";
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import type { RuntimeModel } from "@/src/features/runtime/types";
import { resolveRuntimeModelLogoName, RuntimeModelLogo } from "@/src/components/project/runtime-model-branding";

function providerLabel(provider: string) {
  return provider
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function modelMatches(model: RuntimeModel, query: string) {
  const haystack = [
    model.model_name,
    model.model_id,
    model.provider,
    providerLabel(model.provider),
    typeof model.metadata_json?.logo_name === "string" ? model.metadata_json.logo_name : "",
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

function modelPriceSummary(model: RuntimeModel) {
  const inPrice = Number.parseFloat(model.input_price_per_million.toString());
  const outPrice = Number.parseFloat(model.output_price_per_million.toString());
  return `$${inPrice} in / $${outPrice} out per 1M`;
}

type ProjectModelPickerProps = Readonly<{
  models: RuntimeModel[];
  selectedModelId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (modelId: string) => void;
}>;

export function ProjectModelPicker({ models, selectedModelId, open, onOpenChange, onSelect }: ProjectModelPickerProps) {
  const [searchValue, setSearchValue] = useState("");
  const [providerFilter, setProviderFilter] = useState<string>("all");
  const deferredSearchValue = useDeferredValue(searchValue.trim().toLowerCase());
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedModel = models.find((model) => model.id === selectedModelId);

  const closePicker = useCallback(() => {
    setSearchValue("");
    setProviderFilter("all");
    onOpenChange(false);
  }, [onOpenChange]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (open && containerRef.current?.contains(event.target as Node) === false) closePicker();
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [closePicker, open]);

  const providers = useMemo(
    () => Array.from(new Set(models.map((model) => model.provider))).sort((left, right) => left.localeCompare(right)),
    [models],
  );

  const groupedModels = useMemo(() => {
    const groups = new Map<string, RuntimeModel[]>();

    for (const model of models) {
      if (providerFilter !== "all" && model.provider !== providerFilter) continue;
      if (deferredSearchValue && !modelMatches(model, deferredSearchValue)) continue;
      const group = groups.get(model.provider) ?? [];
      group.push(model);
      groups.set(model.provider, group);
    }

    return Array.from(groups.entries())
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([provider, providerModels]) => ({
        provider,
        label: providerLabel(provider),
        models: [...providerModels].sort((left, right) => left.model_name.localeCompare(right.model_name)),
      }));
  }, [deferredSearchValue, models, providerFilter]);

  const selectedLogoName = selectedModel ? resolveRuntimeModelLogoName(selectedModel) : null;

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => {
          if (open) {
            closePicker();
            return;
          }
          onOpenChange(true);
        }}
        className={`flex min-w-0 shrink-0 items-center gap-1.5 rounded-md border px-1.5 py-0.5 text-left transition ${
          open
            ? "border-blue-400/25 bg-blue-500/[0.12] text-blue-100"
            : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:border-blue-400/25 hover:text-blue-300"
        }`}
        title={selectedModel ? `Model: ${selectedModel.model_name}` : "Choose runtime model"}
        aria-label="Choose runtime model"
      >
        {selectedLogoName ? (
          <RuntimeModelLogo logoName={selectedLogoName} alt={selectedModel?.model_name ?? "Model"} size={20} />
        ) : (
          <Bot size={12} className="shrink-0" />
        )}
        <div className="min-w-0">
          <span className="block truncate text-[10px] font-semibold">{selectedModel?.model_name ?? "Choose model"}</span>
          <span className="block truncate text-[8px] font-medium text-[var(--muted)]">
            {selectedModel ? providerLabel(selectedModel.provider) : "Runtime pricing catalog"}
          </span>
        </div>
        <ChevronDown size={12} className={`shrink-0 transition ${open ? "rotate-180" : "rotate-0"}`} />
      </button>

      {open ? (
        <div className="absolute bottom-12 left-0 z-40 w-[14rem] overflow-hidden rounded-xl border border-slate-200/80 bg-white/96 shadow-[0_28px_70px_rgba(15,23,42,0.22)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/96 sm:w-[15rem]">
          <div className="border-b border-slate-200/80 px-2 py-2 dark:border-white/10">
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 dark:border-white/10 dark:bg-white/[0.04]">
              <Search size={13} className="text-[var(--muted)]" />
              <input
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full bg-transparent text-[11px] font-medium text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-200 dark:placeholder:text-slate-500"
                aria-label="Search runtime models"
              />
            </div>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setProviderFilter("all")}
                className={`rounded-md px-2 py-0.5 text-[9px] font-medium transition ${
                  providerFilter === "all" ? "bg-blue-600 text-white shadow-sm" : "bg-slate-100 text-[var(--muted)] hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1]"
                }`}
              >
                All providers
              </button>
              {providers.map((provider) => (
                <button
                  key={provider}
                  type="button"
                  onClick={() => setProviderFilter(provider)}
                  className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[9px] font-medium transition ${
                    providerFilter === provider ? "bg-blue-600 text-white shadow-sm" : "bg-slate-100 text-[var(--muted)] hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1]"
                  }`}
                >
                  <span className="truncate">{providerLabel(provider)}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="custom-scrollbar max-h-60 overflow-y-auto px-1 py-1" data-lenis-prevent>
            {groupedModels.length > 0 ? (
              groupedModels.map((group) => (
                <div key={group.provider} className="pb-2">
                  <div className="sticky top-0 z-10 flex items-center gap-1.5 bg-white/95 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--muted)] dark:bg-slate-950/95">
                    <Sparkles size={10} />
                    <span>{group.label}</span>
                  </div>
                  <div className="space-y-1">
                    {group.models.map((model) => {
                      const isSelected = model.id === selectedModelId;
                      const logoName = resolveRuntimeModelLogoName(model);
                      return (
                        <button
                          key={model.id}
                          type="button"
                          onClick={() => {
                            onSelect(model.id);
                            closePicker();
                          }}
                          className={`flex w-full items-center justify-between gap-1.5 rounded-lg px-1.5 py-1 text-left transition ${
                            isSelected
                              ? "bg-blue-600 text-white shadow-[0_14px_30px_rgba(37,99,235,0.25)]"
                              : "text-slate-800 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-white/[0.06]"
                          }`}
                        >
                          <div className="flex min-w-0 flex-1 gap-1.5">
                            {logoName ? <RuntimeModelLogo logoName={logoName} alt={model.model_name} size={14} className="mt-0.5 shrink-0" /> : null}
                            <div className="min-w-0 flex-1">
                              <span className="block truncate text-[11px] font-medium leading-tight">{model.model_name}</span>
                              <span className={`block truncate text-[9px] font-medium leading-tight mt-0.5 ${isSelected ? "text-blue-100/85" : "text-[var(--muted)]"}`}>
                                {model.model_id}
                              </span>
                              <span className={`mt-0.5 block truncate text-[8px] font-medium ${isSelected ? "text-blue-50/75" : "text-[var(--muted)]/80"}`}>
                                {modelPriceSummary(model)}
                              </span>
                            </div>
                          </div>
                          <span className="flex shrink-0 items-center">
                            {isSelected ? <Check size={12} /> : null}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-3 py-10 text-center text-sm font-medium text-[var(--muted)]">
                No models match the current search or provider filter.
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
