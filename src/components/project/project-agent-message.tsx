"use client";

import Image from "next/image";
import { memo, useState } from "react";
import { CheckCircle2, ChevronDown, Loader2, User, Wrench } from "lucide-react";
import { MessageAttachmentStrip } from "@/src/components/project/project-chat-attachment-ui";
import type { ProjectChatAttachment } from "@/src/components/project/project-chat-types";
import { ProjectStreamMarkdown } from "@/src/components/project/project-stream-markdown";

function StepStatusIcon({ isItemActive, isPast }: Readonly<{ isItemActive: boolean; isPast: boolean }>) {
  if (isItemActive) return <Loader2 size={11} className="animate-spin text-blue-500 dark:text-blue-400" />;
  if (isPast) return <CheckCircle2 size={11} className="text-emerald-500 dark:text-emerald-400" />;
  return <Wrench size={11} className="text-slate-400 dark:text-slate-500" />;
}

export const StatusGroup = memo(function StatusGroup({
  summary,
  steps,
  isActive = false,
}: Readonly<{ summary?: string; steps: string[]; isActive?: boolean }>) {
  const [isOpen, setIsOpen] = useState(false);
  if (steps.length === 0) return null;

  const title = summary ?? steps.at(-1) ?? "Runtime update";

  return (
    <div className="my-1.5 flex w-full justify-start pl-8">
      <div className="w-full max-w-2xl">
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="flex items-center gap-2.5 py-1 text-left transition text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <span className={`flex size-4 shrink-0 items-center justify-center rounded-md border ${isActive ? "border-blue-400/20 bg-blue-500/10 text-blue-500 dark:text-blue-400" : "border-emerald-400/15 bg-emerald-500/10 text-emerald-500 dark:text-emerald-400"}`}>
            {isActive ? <Loader2 size={10} className="animate-spin" /> : <CheckCircle2 size={10} />}
          </span>
          <span className="text-[12px] font-medium tracking-tight text-slate-600 dark:text-slate-300">{title}</span>
          <ChevronDown size={12} className={`shrink-0 text-slate-400 transition-transform ${isOpen ? "rotate-180" : "rotate-0"}`} />
        </button>

        {isOpen ? (
          <div className="pl-6 pb-2 pt-1.5">
            <ol className="space-y-2">
              {steps.map((step, index) => {
                const currentStep = steps.length - 1;
                const isItemActive = index === currentStep && isActive;
                const isPast = index < currentStep || !isActive;
                return (
                  <li key={`${index}-${step}`} className="flex items-start gap-2.5 text-[12px] leading-5">
                    <span className="mt-0.5 flex size-3 shrink-0 items-center justify-center">
                      <StepStatusIcon isItemActive={isItemActive} isPast={isPast} />
                    </span>
                    <span className={`${isItemActive ? "font-semibold text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400"}`}>{step}</span>
                  </li>
                );
              })}
            </ol>
          </div>
        ) : null}
      </div>
    </div>
  );
});

export const Message = memo(function Message({
  role,
  content,
  pending = false,
  attachments = [],
}: Readonly<{
  role: "agent" | "user" | "status";
  content: string;
  pending?: boolean;
  attachments?: ProjectChatAttachment[];
}>) {
  if (role === "status") {
    return (
      <div className="my-1 flex justify-start">
        <div className="rounded-xl border border-blue-500/10 bg-blue-500/5 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-blue-300/80">
          {content}
        </div>
      </div>
    );
  }

  const isUser = role === "user";
  const hasStreamingContent = pending && content.trim().length > 0;

  return (
    <div className={`flex flex-col gap-3 ${isUser ? "items-end" : "items-start"}`}>
      <MessageAttachmentStrip attachments={attachments} align={isUser ? "end" : "start"} />

      <div className={`flex w-full gap-3.5 ${isUser ? "justify-end" : "justify-start"}`}>
        {isUser ? null : (
          <div className="flex size-5 shrink-0 items-center justify-center rounded-md border border-blue-400/20 bg-blue-500/10 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)] mt-0.5">
            <Image src="/wyrefy_logo.ico" alt="Wyrefy" width={10} height={10} className="size-2.5 rounded-sm" />
          </div>
        )}

        <div
          className={`max-w-[90%] break-words rounded-lg px-3 py-1.5 shadow-xl transition-all ${
            isUser
              ? "rounded-tr-sm border border-blue-500/20 bg-gradient-to-br from-blue-600 via-blue-600 to-blue-700 text-white shadow-blue-900/10"
              : "glass-card rounded-tl-sm bg-white/72 text-[var(--foreground)] dark:bg-white/[0.04]"
          }`}
        >
          {pending && !hasStreamingContent ? (
            <div className="flex items-center gap-1" aria-label="Agent response loading">
              {[0, 1, 2].map((item) => (
                <span key={item} className="size-1.5 animate-pulse rounded-full bg-blue-400" style={{ animationDelay: `${item * 120}ms` }} />
              ))}
            </div>
          ) : (
            <div className={isUser ? "text-[12px] font-medium leading-normal" : "text-[12px] leading-normal"}>
              <ProjectStreamMarkdown
                content={content}
                isStreaming={pending}
                className={`project-streamdown ${isUser ? "project-streamdown-user" : "project-streamdown-agent"}`}
              />
              {pending ? (
                <div className="mt-3 flex items-center gap-1.5 text-blue-400" aria-label="Agent response streaming">
                  {[0, 1, 2].map((item) => (
                    <span key={item} className="size-1.5 animate-pulse rounded-full bg-blue-400" style={{ animationDelay: `${item * 120}ms` }} />
                  ))}
                </div>
              ) : null}
            </div>
          )}
        </div>

        {isUser ? (
          <div className="flex size-5 shrink-0 items-center justify-center rounded-md border border-slate-300 bg-slate-200/70 text-slate-500 shadow-[inset_0_1px_0_rgba(0,0,0,0.05)] dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] mt-0.5">
            <User size={11} />
          </div>
        ) : null}
      </div>
    </div>
  );
});
