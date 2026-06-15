import type { WorkspaceFileEntry } from "@/src/features/runtime/types";

export type WorkspaceTreeNode = WorkspaceFileEntry & {
  children: WorkspaceTreeNode[];
};

export function formatSize(sizeBytes: number | null): string {
  if (sizeBytes == null) return "";
  if (sizeBytes < 1024) return `${sizeBytes} B`;
  if (sizeBytes < 1024 * 1024) return `${Math.round(sizeBytes / 102.4) / 10} KB`;
  return `${Math.round((sizeBytes / 1024 / 1024) * 10) / 10} MB`;
}

export function detectLanguage(path: string | null): string {
  if (!path) return "plaintext";
  switch (path.split(".").pop()?.toLowerCase()) {
    case "ts":
    case "tsx":
      return "typescript";
    case "js":
    case "jsx":
      return "javascript";
    case "json":
      return "json";
    case "md":
      return "markdown";
    case "css":
      return "css";
    case "html":
      return "html";
    case "yml":
    case "yaml":
      return "yaml";
    case "py":
      return "python";
    case "go":
      return "go";
    case "sh":
      return "shell";
    case "toml":
      return "toml";
    case "xml":
      return "xml";
    case "sql":
      return "sql";
    default:
      return "plaintext";
  }
}

export function buildWorkspaceTree(entries: WorkspaceFileEntry[]): WorkspaceTreeNode[] {
  const roots: WorkspaceTreeNode[] = [];
  const nodes = new Map<string, WorkspaceTreeNode>();

  for (const entry of entries) {
    nodes.set(entry.path, { ...entry, children: [] });
  }

  for (const entry of entries) {
    const node = nodes.get(entry.path);
    if (!node) continue;
    const parentPath = entry.path.includes("/") ? entry.path.slice(0, entry.path.lastIndexOf("/")) : "";
    const parent = nodes.get(parentPath);
    if (parent) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const sortNodes = (items: WorkspaceTreeNode[]) => {
    items.sort((left, right) => {
      if (left.kind !== right.kind) return left.kind === "directory" ? -1 : 1;
      return left.name.localeCompare(right.name);
    });
    for (const item of items) {
      sortNodes(item.children);
    }
  };

  sortNodes(roots);
  return roots;
}
