"use client";

import { FileText, Loader2, Plus, SendHorizontal, XCircle, type LucideIcon } from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent, type RefObject } from "react";
import type { RuntimeModel } from "@/src/features/runtime/types";
import { ComposerAttachmentStrip } from "@/src/components/project/project-chat-attachment-ui";
import type { ProjectChatAttachment } from "@/src/components/project/project-chat-types";
import { ProjectModelPicker } from "@/src/components/project/project-model-picker";
import { FigmaMark } from "@/src/components/project/runtime-model-branding";

function submitOnEnter(event: KeyboardEvent<HTMLTextAreaElement>, onSend: () => void) {
  if (event.key !== "Enter" || event.shiftKey) return;
  event.preventDefault();
  onSend();
}

function adjustTextareaHeight(textarea: HTMLTextAreaElement) {
  textarea.style.height = "0px";
  const computed = globalThis.getComputedStyle(textarea);
  const lineHeight = Number.parseFloat(computed.lineHeight) || 24;
  const verticalPadding = Number.parseFloat(computed.paddingTop) + Number.parseFloat(computed.paddingBottom);
  const maxHeight = lineHeight * 15 + verticalPadding;
  textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
  textarea.style.overflowY = textarea.scrollHeight > maxHeight ? "auto" : "hidden";
}

function useDismissOnOutsideClick(ref: RefObject<HTMLElement | null>, active: boolean, onDismiss: () => void) {
  useEffect(() => {
    if (!active) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current?.contains(event.target as Node) === false) onDismiss();
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [active, onDismiss, ref]);
}

function ComposerAction({ icon: Icon, label, onClick }: Readonly<{ icon: LucideIcon; label: string; onClick: () => void }>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-white/[0.08]"
    >
      <Icon size={15} />
      {label}
    </button>
  );
}

function InlineFigmaAction({ onClick }: Readonly<{ onClick: () => void }>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-500/12 px-3 py-1.5 text-xs font-medium text-violet-100 transition hover:bg-violet-500/18"
    >
      <FigmaMark size={14} />
      <span>Figma +</span>
    </button>
  );
}

type ProjectChatComposerProps = Readonly<{
  active: boolean;
  disabled: boolean;
  isSending: boolean;
  isCancelling?: boolean;
  models: RuntimeModel[];
  open: boolean;
  placeholder: string;
  selectedModelId: string;
  value: string;
  onOpenChange: (open: boolean) => void;
  onSelect: (modelId: string) => void;
  onSend: () => void;
  onValueChange: (value: string) => void;
  onCancel?: () => void;
  onFilesSelected?: (files: File[]) => void;
  onRemoveAttachment?: (path: string) => void;
  hasFigmaConnection?: boolean;
  onConnectFigma?: () => void;
  onFigmaMode?: () => void;
  attachments?: ProjectChatAttachment[];
}>;

export function ProjectChatComposer({
  active,
  disabled,
  isSending,
  isCancelling = false,
  models,
  open,
  placeholder,
  selectedModelId,
  value,
  onOpenChange,
  onSelect,
  onSend,
  onValueChange,
  onCancel,
  onFilesSelected,
  onRemoveAttachment,
  hasFigmaConnection = false,
  onConnectFigma,
  onFigmaMode,
  attachments = [],
}: ProjectChatComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showFigmaConnect, setShowFigmaConnect] = useState(false);
  const [hasFigmaChip, setHasFigmaChip] = useState(false);

  const shouldOfferFigma = value.toLowerCase().includes("figma") && hasFigmaChip === false;

  useDismissOnOutsideClick(menuRef, menuOpen, () => setMenuOpen(false));

  useEffect(() => {
    if (textareaRef.current) adjustTextareaHeight(textareaRef.current);
  }, [value]);

  const handleValueChange = (nextValue: string) => {
    onValueChange(nextValue);
  };

  const handleFilesChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    if (files.length > 0) onFilesSelected?.(files);
    event.currentTarget.value = "";
  };

  const attachFigmaContext = () => {
    setMenuOpen(false);
    if (hasFigmaConnection) {
      setHasFigmaChip(true);
      onFigmaMode?.();
      textareaRef.current?.focus();
      return;
    }
    setShowFigmaConnect(true);
  };

  return (
    <div className={`mx-auto w-full transition-all duration-300 ${active ? "max-w-5xl" : "max-w-4xl"}`}>
      <div className="relative">
        <div className={`absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.18),transparent_62%)] blur-3xl transition-opacity ${active ? "opacity-100" : "opacity-80"}`} />
        <div className="relative rounded-2xl border border-[var(--border)]/80 bg-[color-mix(in_srgb,var(--surface),white_18%)] p-1.5 shadow-[0_26px_70px_rgba(15,23,42,0.14)] backdrop-blur-2xl dark:bg-[color-mix(in_srgb,var(--surface),black_16%)]">
          <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/20" />
          <input ref={fileRef} aria-label="Upload files" type="file" multiple className="hidden" onChange={handleFilesChange} />

          <div className="flex items-start gap-2 rounded-xl border border-[var(--border)]/60 bg-[var(--background)]/72 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.32)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            <div className="relative shrink-0" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((current) => !current)}
                disabled={disabled || isSending}
                className="flex size-7 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] transition hover:border-blue-400/30 hover:text-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
                title="Add context"
                aria-label="Add context"
              >
                <Plus size={14} />
              </button>
              {menuOpen ? (
                <div className="absolute bottom-14 left-0 z-40 w-60 rounded-[1.4rem] border border-slate-200/80 bg-white/96 p-2 shadow-[0_28px_70px_rgba(15,23,42,0.22)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/96">
                  <ComposerAction icon={FileText} label="Upload document" onClick={() => { setMenuOpen(false); fileRef.current?.click(); }} />
                  <button
                    type="button"
                    onClick={attachFigmaContext}
                    className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-white/[0.08]"
                  >
                    <FigmaMark size={15} />
                    Add Figma context
                  </button>
                </div>
              ) : null}
            </div>

            <div className="min-w-0 flex-1">
              <textarea
                ref={textareaRef}
                aria-label="Message prompt"
                value={value}
                rows={1}
                onChange={(event) => handleValueChange(event.target.value)}
                onKeyDown={(event) => submitOnEnter(event, onSend)}
                placeholder={placeholder}
                className="custom-scrollbar max-h-[16rem] min-h-[28px] w-full resize-none overflow-y-hidden border-none bg-transparent py-0 text-[13px] font-semibold leading-snug text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]/55"
              />

              <div className="mt-3 flex flex-wrap items-center gap-2.5">
                <ComposerAttachmentStrip
                  attachments={attachments}
                  hasFigmaChip={hasFigmaChip}
                  onRemoveAttachment={onRemoveAttachment}
                  onRemoveFigma={() => setHasFigmaChip(false)}
                />
                {shouldOfferFigma ? <InlineFigmaAction onClick={attachFigmaContext} /> : null}
              </div>
            </div>

            <div className="flex shrink-0 items-start gap-2">
              <ProjectModelPicker
                models={models}
                selectedModelId={selectedModelId}
                open={open}
                onOpenChange={onOpenChange}
                onSelect={onSelect}
              />
              {isSending && onCancel ? (
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={isCancelling}
                  className="flex size-7 items-center justify-center rounded-lg border border-rose-400/20 bg-rose-500/10 text-rose-300 transition hover:bg-rose-500/15 disabled:cursor-wait disabled:opacity-80"
                  title="Cancel run"
                >
                  {isCancelling ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onSend}
                  disabled={disabled || isSending}
                  className="flex size-7 items-center justify-center rounded-lg border border-blue-400/20 bg-blue-600 text-white shadow-[0_16px_30px_rgba(37,99,235,0.28)] transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                  title="Send message"
                >
                  {isSending ? <Loader2 size={14} className="animate-spin" /> : <SendHorizontal size={14} />}
                </button>
              )}
            </div>
          </div>

          {showFigmaConnect ? (
            <div className="mt-3 rounded-[1.35rem] border border-blue-400/20 bg-slate-950/92 p-4 text-left text-white shadow-[0_18px_40px_rgba(15,23,42,0.4)] backdrop-blur-2xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold">Figma OAuth is not connected</p>
                  <p className="mt-1 text-xs leading-5 text-slate-300">Connect Figma, then return here and paste the Figma link in the chat.</p>
                </div>
                <button type="button" onClick={() => setShowFigmaConnect(false)} className="text-slate-400 transition hover:text-white" aria-label="Close Figma connection prompt">
                  <XCircle size={17} />
                </button>
              </div>
              <button
                type="button"
                onClick={() => { setShowFigmaConnect(false); onConnectFigma?.(); }}
                className="mt-4 rounded-xl border border-blue-400/20 bg-blue-600 px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-500"
              >
                Connect Figma
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
