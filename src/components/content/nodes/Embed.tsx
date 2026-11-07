import DOMPurify from "isomorphic-dompurify";

import type { ContentBlock } from "@/content/types";

import { safeHttpUrl } from "../lib/url";

type EmbedNode = Extract<ContentBlock, { type: "embed" }>;

const IFRAME_SRC_PATTERN = /<iframe[^>]*\bsrc="([^"]+)"/iu;
const YOUTUBE_ID_PATTERN =
  /(?:youtube\.com\/embed\/|youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{6,})/iu;

const EMBED_SANDBOX = "allow-scripts allow-same-origin allow-presentation allow-popups";

function extractIframeSrc(html: string): string | undefined {
  return IFRAME_SRC_PATTERN.exec(html)?.[1];
}

function youtubeEmbedUrl(node: EmbedNode): string | undefined {
  const source = node.url ?? extractIframeSrc(node.html);
  if (source === undefined) return undefined;

  const id = YOUTUBE_ID_PATTERN.exec(source)?.[1];
  const candidate = id === undefined ? source : `https://www.youtube.com/embed/${id}`;
  return safeHttpUrl(candidate);
}

/** Provider dispatcher for embed cards. */
export function Embed({ node }: { node: EmbedNode }) {
  switch (node.provider) {
    case "youtube": {
      return <YouTubeEmbed node={node} />;
    }
    case "twitter": {
      return <TwitterEmbed node={node} />;
    }
    case "codepen": {
      return <CodePenEmbed node={node} />;
    }
    case "generic":
    case "unknown": {
      return <GenericEmbed node={node} />;
    }
    default: {
      // Defensive: snapshots are validated, but keep the fallback for safety.
      return <GenericEmbed node={node} />;
    }
  }
}

function YouTubeEmbed({ node }: { node: EmbedNode }) {
  const src = youtubeEmbedUrl(node);
  if (src === undefined) return <GenericEmbed node={node} />;

  return (
    <div className="my-8 aspect-video w-full">
      <iframe
        src={src}
        title="YouTube video player"
        loading="lazy"
        sandbox={EMBED_SANDBOX}
        allow="accelerometer; encrypted-media; picture-in-picture"
        allowFullScreen
        className="size-full rounded-md border-0"
      />
    </div>
  );
}

function TwitterEmbed({ node }: { node: EmbedNode }) {
  const url = safeHttpUrl(node.url);
  return (
    <blockquote className="my-8 rounded-md border border-fg/10 bg-muted/5 p-5">
      <p className="text-sm text-muted">Embedded post</p>
      {typeof url === "string" ? (
        <cite className="mt-2 block text-sm not-italic">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline-offset-4 hover:underline"
          >
            View on X
          </a>
        </cite>
      ) : null}
    </blockquote>
  );
}

function CodePenEmbed({ node }: { node: EmbedNode }) {
  const src = safeHttpUrl(node.url ?? extractIframeSrc(node.html));
  if (src === undefined) return <GenericEmbed node={node} />;

  return (
    <iframe
      src={src}
      title="CodePen embed"
      loading="lazy"
      sandbox={EMBED_SANDBOX}
      allowFullScreen
      className="my-8 h-[360px] w-full rounded-md border-0"
    />
  );
}

function GenericEmbed({ node }: { node: EmbedNode }) {
  const src = safeHttpUrl(node.url ?? extractIframeSrc(node.html));
  if (src !== undefined) {
    return (
      <iframe
        src={src}
        title="Embedded content"
        loading="lazy"
        sandbox={EMBED_SANDBOX}
        allowFullScreen
        className="my-8 h-[360px] w-full rounded-md border-0"
      />
    );
  }

  const safeHtml = DOMPurify.sanitize(node.html, {
    ADD_TAGS: ["iframe"],
    ADD_ATTR: ["allowfullscreen"],
  });
  // Sanitized above to strip scripts, event handlers, and javascript: URLs.
  return (
    <div
      className="my-8 overflow-hidden rounded-md"
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}
