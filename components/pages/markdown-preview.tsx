"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MarkdownPreview({ content }: { content?: string | null }) {
  if (!content) {
    return (
      <p className="text-sm text-muted-foreground">No content available yet.</p>
    );
  }

  return (
    <article className="prose prose-slate max-w-none dark:prose-invert prose-headings:font-semibold prose-a:text-primary">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </article>
  );
}
