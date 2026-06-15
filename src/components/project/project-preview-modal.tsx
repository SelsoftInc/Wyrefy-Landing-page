"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { X, Lock, RotateCw, ChevronLeft, ChevronRight, Check, Copy, ExternalLink } from "lucide-react";

const BRIDGE_SOURCE = "wyrefy-preview-bridge";
const PARENT_SOURCE = "wyrefy-preview-parent";

type PreviewBridgeLocationMessage = {
  source: typeof BRIDGE_SOURCE;
  type: "location";
  path?: string;
  pathname?: string;
  search?: string;
  hash?: string;
};

function previewOrigin(previewUrl: string): string {
  try {
    return new URL(previewUrl, globalThis.location.origin).origin;
  } catch {
    return globalThis.location.origin;
  }
}

function removeTokenFromSearch(search: string): string {
  const params = new URLSearchParams(search);
  params.delete("token");
  const value = params.toString();
  return value ? `?${value}` : "";
}

function normalizeRouteSuffix(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "/";
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

function suffixFromAbsoluteAddress(address: string, previewUrl: string): string | null {
  try {
    const parsed = new URL(address);
    if (parsed.origin !== previewOrigin(previewUrl)) return null;
    return `${parsed.pathname || "/"}${removeTokenFromSearch(parsed.search)}${parsed.hash}`;
  } catch {
    return null;
  }
}

function previewUrlForRoute(previewUrl: string, routeValue: string): string | null {
  const absoluteSuffix = routeValue.startsWith("http://") || routeValue.startsWith("https://")
    ? suffixFromAbsoluteAddress(routeValue, previewUrl)
    : null;
  if ((routeValue.startsWith("http://") || routeValue.startsWith("https://")) && absoluteSuffix === null) return null;

  const suffix = normalizeRouteSuffix(absoluteSuffix ?? routeValue);
  const url = new URL(previewUrl, globalThis.location.origin);
  const [pathAndSearch, hash = ""] = suffix.split("#", 2);
  const [pathname, search = ""] = pathAndSearch.split("?", 2);
  url.pathname = normalizeRouteSuffix(pathname);
  const token = new URL(previewUrl, globalThis.location.origin).searchParams.get("token");
  url.search = search ? `?${search}` : "";
  if (token) url.searchParams.set("token", token);
  url.hash = hash ? `#${hash}` : "";
  return url.toString();
}

function routeSuffixFromIframe(iframe: HTMLIFrameElement): string | undefined {
  try {
    const loc = iframe.contentWindow?.location;
    if (!loc || loc.href === "about:blank") return undefined;
    return `${loc.pathname || "/"}${removeTokenFromSearch(loc.search)}${loc.hash}`;
  } catch {}
  return undefined;
}

function isBridgeLocationMessage(value: unknown): value is PreviewBridgeLocationMessage {
  if (typeof value !== "object" || value === null) return false;
  const message = value as Partial<PreviewBridgeLocationMessage>;
  return message.source === BRIDGE_SOURCE && message.type === "location";
}

type ProjectPreviewModalProps = Readonly<{
  open: boolean;
  projectName: string;
  available: boolean;
  previewUrl: string | null | undefined;
  routeClass?: string | null;
  gatewayUrl?: string | null;
  isFetching: boolean;
  message?: string | null;
  onClose: () => void;
}>;

export function ProjectPreviewModal({
  open,
  projectName,
  available,
  previewUrl,
  routeClass,
  gatewayUrl,
  isFetching,
  message,
  onClose,
}: ProjectPreviewModalProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [displaySuffix, setDisplaySuffix] = useState("/");
  const [editValue, setEditValue] = useState("");

  const syncPreviewRoute = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe || !previewUrl) return undefined;
    return routeSuffixFromIframe(iframe);
  }, [previewUrl]);

  const postBridgeCommand = useCallback((type: "navigate" | "reload" | "back" | "forward", path?: string) => {
    const iframe = iframeRef.current;
    if (!iframe || !previewUrl) return false;
    iframe.contentWindow?.postMessage({ source: PARENT_SOURCE, type, path }, previewOrigin(previewUrl));
    return true;
  }, [previewUrl]);

  useEffect(() => {
    if (!open || !available || !previewUrl) return;
    const expectedOrigin = previewOrigin(previewUrl);
    const handleMessage = (event: MessageEvent<unknown>) => {
      if (event.origin !== expectedOrigin || !isBridgeLocationMessage(event.data)) return;
      const suffix = normalizeRouteSuffix(event.data.path ?? "/");
      if (!isEditing) {
        setDisplaySuffix(suffix);
        setEditValue(suffix);
      }
    };
    globalThis.addEventListener("message", handleMessage);
    return () => globalThis.removeEventListener("message", handleMessage);
  }, [available, isEditing, open, previewUrl]);

  useEffect(() => {
    if (!open) {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const displayUrl = useMemo(() => {
    if (!previewUrl) return "Preview unavailable";
    if (isEditing) return editValue;
    return `${previewOrigin(previewUrl)}${displaySuffix}`;
  }, [previewUrl, isEditing, editValue, displaySuffix]);

  const handleAddressSubmit = () => {
    setIsEditing(false);
    if (!previewUrl || !iframeRef.current) return;
    const target = previewUrlForRoute(previewUrl, editValue);
    if (target === null) {
      setEditValue(displaySuffix);
      return;
    }
    const suffix = suffixFromAbsoluteAddress(target, previewUrl) ?? normalizeRouteSuffix(editValue);
    setDisplaySuffix(suffix);
    setEditValue(suffix);
    postBridgeCommand("navigate", suffix);
    iframeRef.current.src = target;
  };

  const handleReload = () => {
    if (postBridgeCommand("reload")) return;
    const iframe = iframeRef.current;
    if (iframe) iframe.contentWindow?.location.reload();
  };

  const handleHistory = (type: "back" | "forward") => {
    if (postBridgeCommand(type)) return;
    try {
      if (type === "back") iframeRef.current?.contentWindow?.history.back();
      else iframeRef.current?.contentWindow?.history.forward();
    } catch {}
  };

  const handleCopy = async () => {
    if (!previewUrl) return;
    const text = previewUrlForRoute(previewUrl, displaySuffix) ?? previewUrl;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenExternal = () => {
    if (!previewUrl) return;
    const url = previewUrlForRoute(previewUrl, displaySuffix) ?? previewUrl;
    globalThis.open(url, "_blank", "noopener,noreferrer");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-white/40 dark:bg-black/80 p-4 backdrop-blur-xl transition-all duration-300">
      <button
        type="button"
        aria-label="Close modal"
        onClick={onClose}
        className="absolute inset-0 w-full h-full bg-transparent border-none appearance-none cursor-default"
      />
      <div className="relative z-10 flex h-[min(85vh,820px)] w-full max-w-6xl flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950 shadow-[0_32px_90px_rgba(0,0,0,0.65)]">
        <div className="flex flex-col border-b border-white/10 bg-slate-900/60 px-5 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-full bg-red-500/80" />
              <span className="size-3 rounded-full bg-yellow-500/80" />
              <span className="size-3 rounded-full bg-green-500/80" />
              <span className="ml-2 text-xs font-semibold text-slate-400">Wyrefy Live Container Preview</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex size-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-200 transition hover:bg-red-500/20 hover:text-red-400"
              aria-label="Close preview"
            >
              <X size={15} />
            </button>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <div className="flex items-center gap-1 text-slate-500">
              <button
                type="button"
                className="flex size-7 items-center justify-center rounded-md hover:bg-white/5 hover:text-slate-300 transition"
                onClick={() => handleHistory("back")}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                className="flex size-7 items-center justify-center rounded-md hover:bg-white/5 hover:text-slate-300 transition"
                onClick={() => handleHistory("forward")}
              >
                <ChevronRight size={16} />
              </button>
              <button
                type="button"
                onClick={handleReload}
                className="flex size-7 items-center justify-center rounded-md hover:bg-white/5 hover:text-slate-300 transition"
              >
                <RotateCw size={14} />
              </button>
            </div>

            <div className="flex flex-1 items-center gap-2.5 rounded-xl border border-white/5 bg-slate-950/80 px-4 py-2 text-xs shadow-inner">
              <Lock size={12} className="text-emerald-400 shrink-0" />
              <input
                type="text"
                value={displayUrl}
                onChange={(e) => {
                  setEditValue(e.target.value);
                  setIsEditing(true);
                }}
                onFocus={() => {
                  setIsEditing(true);
                  setEditValue(`${previewOrigin(previewUrl ?? gatewayUrl ?? globalThis.location.origin)}${displaySuffix}`);
                }}
                onBlur={handleAddressSubmit}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddressSubmit();
                  if (e.key === "Escape") {
                    setIsEditing(false);
                    setEditValue(displaySuffix);
                  }
                }}
                className="flex-1 min-w-0 bg-transparent text-white font-medium outline-none border-none truncate"
                aria-label="Preview address bar"
              />
            </div>

            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/5 bg-white/5 text-slate-300 text-xs transition hover:bg-white/10 hover:text-white shrink-0"
            >
              {copied ? (
                <>
                  <Check size={13} className="text-emerald-400" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span>Copy Link</span>
                </>
              )}
            </button>

            {available && previewUrl && (
              <button
                type="button"
                onClick={handleOpenExternal}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/5 bg-white/5 text-slate-300 text-xs transition hover:bg-white/10 hover:text-white shrink-0"
              >
                <ExternalLink size={13} />
                <span>Open in New Tab</span>
              </button>
            )}
          </div>
        </div>

        <div className="min-h-0 flex-1 bg-slate-950 p-4">
          {available && previewUrl && routeClass === "preview" ? (
            <iframe
              ref={iframeRef}
              title={`${projectName} preview`}
              src={previewUrl}
              onLoad={() => {
                const suffix = syncPreviewRoute();
                if (suffix !== undefined && !isEditing) {
                  setDisplaySuffix(suffix);
                  setEditValue(suffix);
                }
              }}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              className="h-full w-full rounded-2xl border border-white/10 bg-white"
            />
          ) : (
            <div className="flex h-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.02] text-xs font-medium text-[var(--muted)]">
              {isFetching ? "Waiting for preview..." : message ?? "Resume sandbox to view preview."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
