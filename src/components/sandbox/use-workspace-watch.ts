"use client";

import { useEffect } from "react";
import type { QueryClient } from "@tanstack/react-query";

const CONTENT_REFRESH_DEBOUNCE_MS = 750;

export function useWorkspaceWatch({
  enabled,
  projectId,
  selectedPath,
  queryClient,
  watchUrl,
}: {
  enabled: boolean;
  projectId: string;
  selectedPath: string | null;
  queryClient: QueryClient;
  watchUrl?: string | null;
}) {
  useEffect(() => {
    if (!enabled || !watchUrl) return;
    const stream = new EventSource(watchUrl, { withCredentials: true });
    let contentRefreshTimer: ReturnType<typeof globalThis.setTimeout> | null = null;

    const refreshTree = () => {
      void queryClient.invalidateQueries({ queryKey: ["workspace-files", projectId] });
    };

    const refreshSelectedFile = () => {
      if (!selectedPath) return;
      if (contentRefreshTimer) {
        globalThis.clearTimeout(contentRefreshTimer);
      }
      contentRefreshTimer = globalThis.setTimeout(() => {
        void queryClient.invalidateQueries({ queryKey: ["workspace-file-content", projectId, selectedPath] });
        contentRefreshTimer = null;
      }, CONTENT_REFRESH_DEBOUNCE_MS);
    };

    const handleWorkspaceChange = () => {
      refreshTree();
      refreshSelectedFile();
    };

    const handleWatchError = () => {
      refreshTree();
    };

    stream.addEventListener("workspace_changed", handleWorkspaceChange);
    stream.addEventListener("workspace_watch_error", handleWatchError);
    stream.onerror = handleWatchError;
    return () => {
      if (contentRefreshTimer) {
        globalThis.clearTimeout(contentRefreshTimer);
      }
      stream.removeEventListener("workspace_changed", handleWorkspaceChange);
      stream.removeEventListener("workspace_watch_error", handleWatchError);
      stream.close();
    };
  }, [enabled, projectId, queryClient, selectedPath, watchUrl]);
}
