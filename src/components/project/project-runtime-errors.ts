"use client";

const SAFE_PROJECT_RUNTIME_MESSAGES = new Set([
  "Connect Figma before importing a Figma link.",
  "No partial Figma import is available to retry.",
]);

export function projectRuntimeErrorMessage(error: unknown, fallback: string) {
  if (!(error instanceof Error)) return fallback;
  const message = error.message.trim();
  if (!message) return fallback;
  if (SAFE_PROJECT_RUNTIME_MESSAGES.has(message)) return message;
  return fallback;
}

export function projectRuntimeFailureStatus(fallback = "Internal Error") {
  return fallback;
}
