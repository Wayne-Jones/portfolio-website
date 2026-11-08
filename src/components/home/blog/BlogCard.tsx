import { Link } from "@tanstack/react-router";

import type { Post } from "@/content/types";
import { formatMonthYear } from "@/lib/dates";

interface BlogCardProps {
  post: Post;
  /** Heading level for the card title; listing pages use 2, homepage sections use 3. */
  headingLevel?: 2 | 3;
}

export function BlogCard({ post, headingLevel = 3 }: BlogCardProps) {
  const transitionName = `blog-${post.slug}`;
  const Heading = headingLevel === 2 ? "h2" : "h3";

  return (
    <Link
      to="/blog/$slug"
      params={{ slug: post.slug }}
      viewTransition
      style={{ viewTransitionName: transitionName }}
      className="group flex flex-col rounded-md bg-muted/5 p-6 no-underline transition-colors duration-200 hover:bg-muted/10"
    >
      <Heading className="font-display text-lg font-semibold text-fg transition-colors duration-200 group-hover:text-accent">
        {post.title}
      </Heading>
      <div className="mt-auto flex items-center gap-3 pt-4 text-sm text-muted">
        <time dateTime={post.publishedAt}>{formatMonthYear(post.publishedAt)}</time>
        {post.readingTime != null && (
          <>
            <span aria-hidden="true">·</span>
            <span>{post.readingTime} min read</span>
          </>
        )}
      </div>
    </Link>
  );
}
