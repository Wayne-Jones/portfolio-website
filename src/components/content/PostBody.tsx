import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import type { ContentBlock, ContentInline, ContentTree } from "@/content/types";

import { safeHref } from "./lib/url";
import { BookmarkCard } from "./nodes/BookmarkCard";
import { Callout } from "./nodes/Callout";
import { CodeBlock } from "./nodes/CodeBlock";
import { Divider } from "./nodes/Divider";
import { Embed } from "./nodes/Embed";
import { FigureImage } from "./nodes/FigureImage";
import { Gallery } from "./nodes/Gallery";
import { Heading } from "./nodes/Heading";
import { HtmlFallback } from "./nodes/HtmlFallback";
import { List } from "./nodes/List";
import { Paragraph } from "./nodes/Paragraph";
import { PullQuote } from "./nodes/PullQuote";

/**
 * PostBody — the canonical `ContentTree` renderer.
 *
 * A single exhaustive dispatch over each block discriminator; every branch
 * hands off to a leaf component in `./nodes/`. Nested blocks (quotes, list
 * items) recurse through the same dispatcher.
 */
export function PostBody({ content }: { content: ContentTree }) {
  return <>{content.map((block, index) => renderBlock(block, index))}</>;
}

export default PostBody;

function renderBlock(block: ContentBlock, key: number): ReactNode {
  if (block.type === "blockquote") {
    return (
      <PullQuote key={key}>
        {block.children.map((child, index) => renderBlock(child, index))}
      </PullQuote>
    );
  }

  if (block.type === "list") {
    return (
      <List key={key} ordered={block.ordered}>
        {block.items.map((item, itemIndex) => (
          <li key={itemIndex}>{item.map((child, index) => renderBlock(child, index))}</li>
        ))}
      </List>
    );
  }

  return renderLeafBlock(block, key);
}

type LeafBlock = Exclude<ContentBlock, { type: "blockquote" } | { type: "list" }>;

function renderLeafBlock(block: LeafBlock, key: number): ReactNode {
  switch (block.type) {
    case "paragraph": {
      return (
        <Paragraph key={key}>
          <Inline nodes={block.children} />
        </Paragraph>
      );
    }
    case "heading": {
      return (
        <Heading key={key} node={block}>
          <Inline nodes={block.children} />
        </Heading>
      );
    }
    case "image": {
      return <FigureImage key={key} image={block} />;
    }
    case "codeBlock": {
      return <CodeBlock key={key} node={block} />;
    }
    case "divider": {
      return <Divider key={key} />;
    }
    case "embed": {
      return <Embed key={key} node={block} />;
    }
    case "gallery": {
      return <Gallery key={key} images={block.images} />;
    }
    case "callout": {
      return (
        <Callout key={key} variant={block.variant}>
          <Inline nodes={block.children} />
        </Callout>
      );
    }
    case "bookmark": {
      return <BookmarkCard key={key} node={block} />;
    }
    case "html": {
      return <HtmlFallback key={key} html={block.html} />;
    }
    default: {
      const exhaustive: never = block;
      return exhaustive;
    }
  }
}

/** Renders a `ContentInline[]` sequence, preserving nested marks. */
function Inline({ nodes }: { nodes: ContentInline[] }) {
  return <>{nodes.map((node, index) => renderInline(node, index))}</>;
}

function renderInline(node: ContentInline, key: number): ReactNode {
  switch (node.type) {
    case "text": {
      return node.value;
    }
    case "inlineCode": {
      return (
        <code key={key} className="rounded bg-muted/10 px-1.5 py-0.5 font-mono text-[0.9em]">
          {node.value}
        </code>
      );
    }
    case "strong": {
      return (
        <strong key={key}>
          <Inline nodes={node.children} />
        </strong>
      );
    }
    case "emphasis": {
      return (
        <em key={key}>
          <Inline nodes={node.children} />
        </em>
      );
    }
    case "hardBreak": {
      return <br key={key} />;
    }
    case "link": {
      return renderLink(node, key);
    }
    default: {
      const exhaustive: never = node;
      return exhaustive;
    }
  }
}

function renderLink(node: Extract<ContentInline, { type: "link" }>, key: number): ReactNode {
  const children = <Inline nodes={node.children} />;
  const href = safeHref(node.href);

  // Drop unsafe schemes (javascript:, data:, vbscript:, …) entirely.
  if (href === undefined) {
    return <span key={key}>{children}</span>;
  }

  if (href.startsWith("#")) {
    return (
      <a key={key} href={href} className="text-accent underline-offset-4 hover:underline">
        {children}
      </a>
    );
  }

  if (isExternalHref(href)) {
    return (
      <a
        key={key}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-accent underline-offset-4 hover:underline"
      >
        {children}
      </a>
    );
  }

  const to = href.startsWith("/") ? href : `/${href}`;
  return (
    <Link key={key} to={to} className="text-accent underline-offset-4 hover:underline">
      {children}
    </Link>
  );
}

function isExternalHref(href: string): boolean {
  return href.startsWith("//") || /^[a-z][a-z0-9+.-]*:/iu.test(href);
}
