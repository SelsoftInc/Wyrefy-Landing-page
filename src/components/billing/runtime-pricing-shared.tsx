"use client";

import { Pencil, Plus, Save, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import {  useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/src/components/ui/button";

export function RuntimeSection(props: Readonly<{ title: string; buttonLabel?: string; showForm?: boolean; onAdd?: () => void; children: ReactNode }>) {
  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-xl font-semibold text-[var(--foreground)]">{props.title}</h3>
        {props.buttonLabel && props.onAdd ? <Button onClick={props.onAdd} icon={<Plus size={18} />} disabled={props.showForm}>{props.buttonLabel}</Button> : null}
      </div>
      {props.children}
    </section>
  );
}

export function RuntimeForm(props: Readonly<{ title: string; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void; onCancel: () => void; pending: boolean; hiddenFields?: ReactNode; children: ReactNode }>) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const dialogContent = (
    <dialog
      open
      aria-label={props.title}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/40 dark:bg-black/60 p-4 backdrop-blur-sm border-none m-0 w-full h-full max-w-none max-h-none overflow-hidden"
    >
      <button
        type="button"
        aria-label="Close dialog"
        onClick={props.onCancel}
        className="absolute inset-0 w-full h-full bg-transparent border-none appearance-none cursor-default"
      />
      <div className="glass-panel relative z-10 flex max-h-[90vh] min-h-0 w-full max-w-3xl flex-col rounded-3xl shadow-2xl">
        <form onSubmit={props.onSubmit} className="flex min-h-0 flex-1 flex-col p-8">
          <div className="mb-5 flex shrink-0 items-center justify-between gap-4">
            <h4 className="text-lg font-semibold">{props.title}</h4>
            <Button type="button" variant="ghost" onClick={props.onCancel}>Cancel</Button>
          </div>
          {props.hiddenFields}
          <div data-lenis-prevent="true" className="custom-scrollbar min-h-0 flex-1 overflow-y-auto pr-2">
            <div className="grid gap-4 md:grid-cols-2 pb-2">{props.children}</div>
          </div>
          <div className="mt-5 shrink-0">
            <Button type="submit" className="h-12 w-full" loading={props.pending} icon={<Save size={18} />}>Save Pricing Row</Button>
          </div>
        </form>
      </div>
    </dialog>
  );

  if (!mounted) return null;
  return createPortal(dialogContent, document.body);
}

type PriceCardAction = Readonly<{
  label: string;
  onClick: () => void;
  pending: boolean;
  variant?: "secondary" | "danger";
  icon?: ReactNode;
}>;

function statusBadgeClass(status: string): string {
  return status === "active"
    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
    : "border-amber-500/20 bg-amber-500/10 text-amber-400";
}

export function PriceCard(
  props: Readonly<{ icon: ReactNode; title: string; subtitle: string; status: string; action?: PriceCardAction; secondaryAction?: PriceCardAction; children: ReactNode }>,
) {
  return (
    <article className="group relative rounded-[2.5rem] border border-[var(--border)]/60 bg-[var(--background)]/60 p-6 md:p-7 shadow-xl backdrop-blur-3xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_-15px_rgba(59,130,246,0.1)] hover:border-blue-500/30 flex flex-col h-full overflow-hidden">
      {/* Decorative background glow */}
      <div className="pointer-events-none absolute -inset-px rounded-[2.5rem] bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      
      <div className="relative z-10 mb-6 flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--surface)]/50 border border-[var(--border)]/50 text-[var(--foreground)] shadow-inner transition-transform duration-300 group-hover:scale-105 group-hover:border-blue-500/30 group-hover:text-blue-500 group-hover:bg-blue-500/10">{props.icon}</div>
          <div className="mt-1 min-w-0">
            <h4 className="text-lg font-bold tracking-tight text-[var(--foreground)] truncate">{props.title}</h4>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)] truncate">{props.subtitle}</p>
          </div>
        </div>
        <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest ${statusBadgeClass(props.status)}`}>{props.status}</span>
      </div>
      
      <div className="relative z-10 grid gap-3 sm:grid-cols-2 flex-1">{props.children}</div>
      
      {props.action || props.secondaryAction ? (
        <div className="relative z-10 mt-auto grid gap-3 pt-6 sm:grid-cols-2">
          {props.action ? (
            <Button
              variant={props.action.variant ?? "secondary"}
              onClick={props.action.onClick}
              loading={props.action.pending}
              icon={props.action.icon ?? (props.action.variant === "danger" ? <Trash2 size={16} /> : <Pencil size={16} />)}
              className="w-full shadow-sm"
            >
              {props.action.label}
            </Button>
          ) : null}
          {props.secondaryAction ? (
            <Button
              variant={props.secondaryAction.variant ?? "secondary"}
              onClick={props.secondaryAction.onClick}
              loading={props.secondaryAction.pending}
              icon={props.secondaryAction.icon ?? (props.secondaryAction.variant === "danger" ? <Trash2 size={16} /> : <Pencil size={16} />)}
              className="w-full shadow-sm"
            >
              {props.secondaryAction.label}
            </Button>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

export function Metric({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="flex flex-col justify-center rounded-[1.25rem] border border-[var(--border)]/40 bg-[var(--surface)]/30 p-3.5 transition-colors group-hover:bg-[var(--surface)]/50 group-hover:border-[var(--border)]">
      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--muted)]">{label}</p>
      <p className="mt-1.5 break-words text-sm font-semibold text-[var(--foreground)]">{value}</p>
    </div>
  );
}
