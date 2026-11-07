import type { ReactNode } from "react";

import { inlineToText, slugify } from "@/content/text";
import type { ContentBlock } from "@/content/types";

type HeadingNode = Extract<ContentBlock, { type: "heading" }>;

const HEADING_CLASSES: Record<HeadingNode["level"], string> = {
  2: "mt-12 mb-4 text-2xl",
  3: "mt-10 mb-3 text-xl",
  4: "mt-8 mb-3 text-lg",
  5: "mt-6 mb-2 text-base",
  6: "mt-6 mb-2 text-sm uppercase tracking-wide",
};

/**
 * Renders a heading with a stable anchor id. The id comes from the tree when
 * present, otherwise it is generated from the heading's text.
 */
export function Heading({ node, children }: { node: HeadingNode; children: ReactNode }) {
  const text = inlineToText(node.children);
  const generatedId = node.id ?? slugify(text);
  const id = generatedId === "" ? undefined : generatedId;
  const Tag: "h2" | "h3" | "h4" | "h5" | "h6" = `h${node.level}`;

  return (
    <Tag
      id={id}
      className={`group scroll-mt-24 font-display text-fg ${HEADING_CLASSES[node.level]}`}
    >
      {children}
      {id === undefined ? null : (
        <a
          href={`#${id}`}
          aria-label={`Link to ${text === "" ? "section" : text}`}
          className="ml-2 text-muted opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
        >
          <span aria-hidden="true">#</span>
        </a>
      )}
    </Tag>
  );
}
