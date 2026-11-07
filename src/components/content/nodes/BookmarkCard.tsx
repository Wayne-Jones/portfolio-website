import type { ContentBlock } from "@/content/types";

import { safeHttpUrl } from "../lib/url";

type BookmarkNode = Extract<ContentBlock, { type: "bookmark" }>;

const CARD_CLASSES =
  "my-8 flex flex-col gap-4 rounded-md border border-fg/10 p-4 no-underline transition-colors hover:bg-muted/5 sm:flex-row";

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./u, "");
  } catch {
    return url;
  }
}

/** Bookmark card rendered as a desktop-friendly link card. */
export function BookmarkCard({ node }: { node: BookmarkNode }) {
  const href = safeHttpUrl(node.url);

  if (href === undefined) {
    return (
      <div className={CARD_CLASSES}>
        <CardContents node={node} />
      </div>
    );
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={CARD_CLASSES}>
      <CardContents node={node} />
    </a>
  );
}

function CardContents({ node }: { node: BookmarkNode }) {
  return (
    <>
      {node.image !== undefined && node.image !== "" ? (
        <img
          src={node.image}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-32 w-full rounded object-cover sm:w-48"
        />
      ) : null}
      <div className="flex min-w-0 flex-col justify-center">
        <p className="text-xs tracking-wide text-muted uppercase">{hostnameOf(node.url)}</p>
        <h3 className="mt-1 font-display text-lg text-fg">{node.title}</h3>
        {node.description !== undefined && node.description !== "" ? (
          <p className="mt-1 text-sm text-muted">{node.description}</p>
        ) : null}
      </div>
    </>
  );
}
