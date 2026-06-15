"use client";

import { FileImage, FileText, Loader2, Paperclip, X } from "lucide-react";
import { FigmaMark } from "@/src/components/project/runtime-model-branding";
import type { ProjectChatAttachment } from "@/src/components/project/project-chat-types";

function renderAttachmentIcon(attachment: ProjectChatAttachment) {
  if (attachment.status === "processing") return <Loader2 size={16} className="animate-spin" />;
  if (attachment.mimeType?.startsWith("image/")) return <FileImage size={16} />;
  if (attachment.kind === "document" || attachment.mimeType?.includes("pdf")) return <FileText size={16} />;
  return <Paperclip size={16} />;
}

function attachmentTone(status: string | undefined) {
  if (status === "processing") return "border-amber-400/30 bg-amber-500/10 text-amber-200";
  return "border-blue-400/20 bg-blue-500/10 text-blue-100";
}

function attachmentStatusLabel(status: string | undefined) {
  if (status === "processing") return "In run";
  if (status === "attached") return "Attached";
  return null;
}

function AttachmentCard({
  attachment,
  onRemove,
}: Readonly<{
  attachment: ProjectChatAttachment;
  onRemove?: (path: string) => void;
}>) {
  const statusLabel = attachmentStatusLabel(attachment.status);

  return (
    <div className={`flex min-w-0 items-center gap-3 rounded-2xl border px-3 py-2 shadow-sm backdrop-blur-xl ${attachmentTone(attachment.status)}`}>
      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-950/30 text-current">
        {renderAttachmentIcon(attachment)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{attachment.filename}</p>
        {statusLabel ? <p className="text-[11px] font-medium text-current/75">{statusLabel}</p> : null}
      </div>
      {onRemove && attachment.status !== "processing" ? (
        <button
          type="button"
          onClick={() => onRemove(attachment.path)}
          className="rounded-full p-1 text-current/70 transition hover:bg-white/10 hover:text-current"
          aria-label={`Remove ${attachment.filename}`}
        >
          <X size={14} />
        </button>
      ) : null}
    </div>
  );
}

function FigmaChip({ onRemove }: Readonly<{ onRemove?: () => void }>) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-violet-400/25 bg-violet-500/12 px-3 py-2 text-violet-50 shadow-sm backdrop-blur-xl">
      <span className="flex size-6 items-center justify-center"><FigmaMark size={14} /></span>
      <span className="text-sm font-semibold">Figma</span>
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          className="rounded-full p-1 text-violet-100/70 transition hover:bg-white/10 hover:text-violet-50"
          aria-label="Remove Figma"
        >
          <X size={14} />
        </button>
      ) : null}
    </div>
  );
}

export function ComposerAttachmentStrip({
  attachments,
  hasFigmaChip,
  onRemoveAttachment,
  onRemoveFigma,
}: Readonly<{
  attachments: ProjectChatAttachment[];
  hasFigmaChip: boolean;
  onRemoveAttachment?: (path: string) => void;
  onRemoveFigma?: () => void;
}>) {
  if (attachments.length === 0 && !hasFigmaChip) return null;

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {hasFigmaChip ? <FigmaChip onRemove={onRemoveFigma} /> : null}
      {attachments.map((attachment) => (
        <AttachmentCard key={attachment.path} attachment={attachment} onRemove={onRemoveAttachment} />
      ))}
    </div>
  );
}

export function MessageAttachmentStrip({
  attachments,
  align,
}: Readonly<{
  attachments: ProjectChatAttachment[];
  align: "start" | "end";
}>) {
  if (attachments.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-2 ${align === "end" ? "justify-end" : "justify-start"}`}>
      {attachments.map((attachment) => (
        <AttachmentCard key={attachment.path} attachment={attachment} />
      ))}
    </div>
  );
}
