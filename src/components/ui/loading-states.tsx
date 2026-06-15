"use client";

import { AlertTriangle, LockKeyhole, RotateCcw } from "lucide-react";
import Link from "next/link";

import { BrandLogo } from "@/src/components/ui/brand-logo";

export function AppLoading({ label = "Loading Wyrefy" }: Readonly<{ label?: string }>) {
  return (
    <main className="blue-atmosphere relative flex min-h-screen flex-col items-center justify-center px-6 text-[var(--foreground)]">
      <div className="relative z-10 flex flex-col items-center gap-8">
        <div className="relative flex flex-col items-center justify-center">
          <div className="absolute size-20 rounded-full bg-[var(--accent)]/5 pointer-events-none" />
          <div className="relative z-10 p-4">
            <BrandLogo className="size-16" />
          </div>
        </div>

        <div className="flex max-w-sm flex-col items-center gap-4 text-center">
          <div className="flex flex-col items-center gap-1.5">
            <span className="min-h-6 text-base font-medium tracking-wide text-[var(--foreground)]">
              {label}
            </span>
          </div>

          <div className="relative h-1 w-44 overflow-hidden rounded-full bg-[var(--border)]">
            <div className="loading-progress-bar h-full w-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-strong)]" />
          </div>
        </div>
      </div>
    </main>
  );
}

export function SectionLoading({ label = "Loading" }: Readonly<{ label?: string }>) {
  return (
    <div className="relative flex h-full w-full min-h-[60vh] flex-1 flex-col items-center justify-center p-6">
      
      <div className="relative z-10 flex flex-col items-center gap-4">
        <div className="relative flex flex-col items-center justify-center">
          
          
          {/* Core floating logo */}
          <div className="relative z-10">
            <BrandLogo className="size-14" />
          </div>
        </div>
        
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="text-xs font-medium tracking-widest text-[var(--muted)]">{label.toUpperCase()}</span>
          <div className="h-0.5 w-16 overflow-hidden rounded-full bg-[var(--border)] relative">
            <div className="loading-progress-bar h-full w-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-strong)]" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonRows({ rows = 3 }: Readonly<{ rows?: number }>) {
  return (
    <div className="grid gap-3">
      {Array.from({ length: rows }, (_, row) => `skeleton-row-${row + 1}`).map((rowKey) => (
        <div key={rowKey} className="loading-shimmer h-14 rounded-2xl border border-[var(--border)]" />
      ))}
    </div>
  );
}
type AccessStateProps = Readonly<{
  title: string;
  message: string;
  href?: string;
  actionLabel?: string;
  kind?: "forbidden" | "not-found";
}>;

export function AccessState({ title, message, href = "/login", actionLabel = "Continue", kind = "forbidden" }: AccessStateProps) {
  const Icon = kind === "forbidden" ? LockKeyhole : AlertTriangle;
  return (
    <main className="blue-atmosphere flex min-h-screen items-center justify-center px-6 text-[var(--foreground)]">
      <section className="glass-panel page-motion max-w-md rounded-[2rem] p-8 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[var(--surface)] text-[var(--accent)]">
          <Icon size={26} />
        </div>
        <h1 className="mt-6 text-2xl font-semibold">{title}</h1>
        <p className="mt-3 text-sm font-medium leading-6 text-[var(--muted)]">{message}</p>
        <Link href={href} className="primary-button mt-6 inline-flex items-center gap-2">
          <RotateCcw size={17} />
          {actionLabel}
        </Link>
      </section>
    </main>
  );
}
