"use client";

import Image from "next/image";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Button } from "@/src/components/ui/button";
import { TextField } from "@/src/components/ui/form-field";
import { useToast } from "@/src/components/ui/toast";
import { createProject } from "@/src/features/auth/api";
import type { Project } from "@/src/features/auth/types";
import { formString } from "@/src/shared/form-data";
import { Sparkles, X } from "lucide-react";

const FRAMEWORK_OPTIONS = [
  { value: "nextjs", label: "Next.js", description: "", iconSrc: "/features_icon/nextjs.svg" },
  { value: "react", label: "React", description: "", iconSrc: "/features_icon/react.svg" },
  { value: "vue", label: "Vue", description: "", iconSrc: "/features_icon/vue-js.svg" },
  { value: "angular", label: "Angular", description: "", iconSrc: "/features_icon/angular.svg" },
] as const;

const LANGUAGE_OPTIONS = [
  { value: "typescript", label: "TypeScript", description: "", iconSrc: "/features_icon/typescript.svg" },
  { value: "javascript", label: "JavaScript", description: "", iconSrc: "/features_icon/javascript.svg" },
] as const;

const STYLING_OPTIONS = [
  { value: "tailwind", label: "Tailwind CSS", description: "", iconSrc: "/features_icon/tailwindcss.svg" },
  { value: "css", label: "CSS", description: "", iconSrc: "/features_icon/css.svg" },
] as const;

type ForgeModalProps = Readonly<{
  onClose: () => void;
  onSuccess: (project: Project) => void;
}>;

export function ForgeModal({ onClose, onSuccess }: ForgeModalProps) {
  const { showToast } = useToast();
  const [useDefault, setUseDefault] = useState(true);
  const [framework, setFramework] = useState("nextjs");
  const [language, setLanguage] = useState("typescript");
  const [styling, setStyling] = useState("tailwind");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const create = useMutation({
    mutationFn: createProject,
    onSuccess: (project) => {
      onSuccess(project);
    },
    onError: (error) => {
      showToast(error instanceof Error ? error.message : "Unable to create project", "error");
    },
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      await create.mutateAsync({
        name: formString(data, "name"),
        description: "",
        stack_target: { framework, language, styling, use_default: useDefault },
      });
    } catch {
      return;
    }
  };

  const handleFrameworkChange = (val: string) => {
    setFramework(val);
    if (val === "angular") {
      setLanguage("typescript");
      setStyling("css");
    } else if (val === "vue") {
      if (styling !== "css") {
        setStyling("css");
      }
    }
  };

  const applyDefault = (checked: boolean) => {
    setUseDefault(checked);
    if (checked) {
      setFramework("nextjs");
      setLanguage("typescript");
      setStyling("tailwind");
    }
  };

  const disabledLanguages = framework === "angular" ? ["javascript"] : [];
  const disabledStyling = framework === "angular" || framework === "vue" ? ["tailwind"] : [];

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-white/40 dark:bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-300 sm:p-6">
      <button
        type="button"
        aria-label="Close modal"
        onClick={onClose}
        className="absolute inset-0 w-full h-full bg-transparent border-none appearance-none cursor-default"
      />
      <div className="glass-panel relative z-10 w-full max-w-2xl rounded-[2rem] border border-[var(--border)] shadow-2xl animate-in zoom-in-95 duration-500 overflow-hidden flex flex-col max-h-[90vh] backdrop-blur-md">
        {/* Header */}
        <div className="p-6 pb-2 sm:p-8 sm:pb-3 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                Project <span className="text-blue-500">Forge</span>
              </h2>
              <p className="text-[9px] font-black text-[var(--muted)] mt-0.5 uppercase tracking-[0.2em]">
                Initialize Operational Workspace
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex size-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:bg-[var(--surface)]/80 hover:text-[var(--foreground)] transition-all"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-hidden flex-1">
          <form id="forge-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Identity */}
            <div className="glass-card rounded-2xl p-5 border border-[var(--border)] shadow-xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <h3 className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)] mb-4 flex items-center gap-2">
                <Sparkles size={12} className="text-blue-500" />
                Project Identity
              </h3>
              <TextField label="Operational Name" name="name" placeholder="e.g. Apollo Interface" required />
            </div>

            {/* Stack Configuration */}
            <div className="glass-card rounded-2xl p-5 border border-[var(--border)] shadow-xl space-y-5">
              <label className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 cursor-pointer hover:border-blue-500/30 transition-colors group">
                <input
                  type="checkbox"
                  checked={useDefault}
                  onChange={(event) => applyDefault(event.target.checked)}
                  className="sr-only"
                />
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)] group-hover:text-blue-500 transition-colors">
                    Use Default Stack
                  </span>
                  <p className="mt-0.5 text-xs font-bold text-[var(--foreground)]/70">
                    Start with Next.js, TypeScript, and Tailwind CSS.
                  </p>
                </div>
                <span
                  role="switch"
                  aria-label="Use default stack"
                  aria-checked={useDefault}
                  className={`relative shrink-0 inline-flex h-6 w-11 items-center rounded-full border transition-all duration-300 ${
                    useDefault
                      ? "border-blue-500/40 bg-blue-500 shadow-[0_4px_12px_rgba(37,99,235,0.3)]"
                      : "border-[var(--border)] bg-[var(--surface)]"
                  }`}
                >
                  <span
                    className={`inline-block size-4 rounded-full bg-white shadow-md transition-transform duration-300 ${
                      useDefault ? "translate-x-5" : "translate-x-1"
                    }`}
                  />
                </span>
              </label>

              <div className={`space-y-4 transition-all duration-300 ${useDefault ? "opacity-30 grayscale-[0.4] pointer-events-none" : "opacity-100"}`}>
                <StackGroup
                  label="Framework"
                  value={framework}
                  disabled={useDefault}
                  onChange={handleFrameworkChange}
                  options={FRAMEWORK_OPTIONS}
                />
                <div className="grid grid-cols-2 gap-4">
                  <StackGroup
                    label="Language"
                    value={language}
                    disabled={useDefault}
                    disabledOptions={disabledLanguages}
                    onChange={setLanguage}
                    options={LANGUAGE_OPTIONS}
                  />
                  <StackGroup
                    label="Styling"
                    value={styling}
                    disabled={useDefault}
                    disabledOptions={disabledStyling}
                    onChange={setStyling}
                    options={STYLING_OPTIONS}
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[var(--border)]/50 bg-[var(--surface)]/80 shrink-0 flex gap-4">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1 !rounded-xl h-12 bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)] hover:bg-[var(--foreground)] hover:text-[var(--background)] font-black transition-all">
            Cancel
          </Button>
          <Button type="submit" form="forge-form" loading={create.isPending} className="flex-[1.5] !rounded-xl h-12 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-black shadow-xl shadow-blue-500/20 hover:scale-[1.02] transition-transform">
            Initialize Forge
          </Button>
        </div>
      </div>
    </div>
  );
}

function StackGroup(props: Readonly<{
  label: string;
  value: string;
  disabled: boolean;
  options: ReadonlyArray<{
    value: string;
    label: string;
    description: string;
    iconSrc: string;
  }>;
  disabledOptions?: ReadonlyArray<string>;
  onChange: (value: string) => void;
}>) {
  const isMultiCol = props.options.length > 2;

  return (
    <fieldset className="space-y-2">
      <legend className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)] mb-1">{props.label}</legend>
      <div className={`grid gap-2 ${isMultiCol ? "grid-cols-4" : "grid-cols-2"}`}>
        {props.options.map((option) => {
          const selected = props.value === option.value;
          const isOptionDisabled = props.disabled || (props.disabledOptions?.includes(option.value) ?? false);

          let buttonClass = "border-[var(--border)] bg-[var(--surface)]/50 hover:border-blue-500/25 hover:bg-blue-500/5 text-[var(--foreground)]/70";
          if (selected) {
            buttonClass = "border-blue-500 bg-blue-500/10 text-blue-400 shadow-[0_4px_12px_rgba(37,99,235,0.06)]";
          } else if (isOptionDisabled) {
            buttonClass = "border-[var(--border)] bg-[var(--surface)]/20 text-[var(--muted)]/50 cursor-not-allowed opacity-40";
          }

          return (
            <button
              key={option.value}
              type="button"
              disabled={isOptionDisabled}
              onClick={() => props.onChange(option.value)}
              className={`group relative flex items-center justify-center gap-2 rounded-xl border py-2 px-3 text-center transition-all ${buttonClass} ${isOptionDisabled ? "cursor-default" : "cursor-pointer active:scale-95"}`}
            >
              <Image
                src={option.iconSrc}
                alt=""
                aria-hidden="true"
                width={14}
                height={14}
                className="size-[14px] object-contain"
              />
              <span className={`text-[11px] font-extrabold truncate ${selected ? "text-blue-400" : "text-[var(--foreground)]/80 group-hover:text-[var(--foreground)]"}`}>
                {option.label}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
