import type { ReactNode } from "react";

/**
 * Editorial pull quote. The dispatcher renders nested blocks as children so
 * quotes can contain paragraphs, headings, and lists.
 */
export function PullQuote({ children }: { children: ReactNode }) {
  return (
    <blockquote className="my-10 border-l-2 border-accent pl-6 font-display text-xl leading-snug text-fg italic">
      <span aria-hidden="true" className="mb-2 block text-3xl text-accent not-italic">
        &ldquo;
      </span>
      {children}
    </blockquote>
  );
}
