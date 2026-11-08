import { Link } from "@tanstack/react-router";

import type { Author } from "@/content/types";
import { formatMonthYear } from "@/lib/dates";
import { cn } from "@/lib/utils";

import { hasText } from "./lib";

interface ArticleMetaProps {
  publishedAt?: string;
  /** Reading time in minutes. */
  readingTime?: number;
  author?: Author;
  className?: string;
}

/** Publish date, reading time, and author byline for a detail page. */
export function ArticleMeta({ publishedAt, readingTime, author, className }: ArticleMetaProps) {
  const hasReadingTime = readingTime !== undefined && readingTime > 0;

  return (
    <div className={cn("flex flex-wrap items-center gap-x-3 gap-y-2", className)}>
      {hasText(publishedAt) ? (
        <time dateTime={publishedAt}>{formatMonthYear(publishedAt)}</time>
      ) : null}

      {hasReadingTime ? (
        <>
          {hasText(publishedAt) ? <span aria-hidden="true">·</span> : null}
          <span>{readingTime} min read</span>
        </>
      ) : null}

      {author === undefined ? null : (
        <>
          {hasText(publishedAt) || hasReadingTime ? <span aria-hidden="true">·</span> : null}
          <span className="inline-flex items-center gap-2">
            {hasText(author.avatar) ? (
              <img
                src={author.avatar}
                alt=""
                aria-hidden="true"
                width={24}
                height={24}
                loading="lazy"
                decoding="async"
                className="size-6 rounded-full bg-muted/10 object-cover"
              />
            ) : null}
            <Link
              to="/blog"
              title={`Posts by ${author.name}`}
              className="text-muted no-underline hover:text-fg"
            >
              {author.name}
            </Link>
          </span>
        </>
      )}
    </div>
  );
}
