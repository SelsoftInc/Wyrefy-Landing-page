"use client";

import { code } from "@streamdown/code";
import { Streamdown } from "streamdown";

type ProjectStreamMarkdownProps = Readonly<{
  content: string;
  isStreaming?: boolean;
  className?: string;
}>;

export function ProjectStreamMarkdown({
  content,
  isStreaming = false,
  className,
}: ProjectStreamMarkdownProps) {
  return (
    <Streamdown
      className={className}
      mode={isStreaming ? "streaming" : "static"}
      isAnimating={isStreaming}
      animated={isStreaming ? { animation: "fadeIn", duration: 120, stagger: 0.003 } : false}
      plugins={{ code }}
      shikiTheme={["github-light", "github-dark"]}
    >
      {content}
    </Streamdown>
  );
}
