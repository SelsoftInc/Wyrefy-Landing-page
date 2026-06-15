"use client";

export type ProjectChatAttachment = {
  filename: string;
  path: string;
  status?: string;
  kind?: string;
  mimeType?: string | null;
  sizeBytes?: number | null;
};
