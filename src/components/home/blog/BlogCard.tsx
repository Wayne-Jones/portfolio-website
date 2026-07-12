import { Link } from "@tanstack/react-router";

import type { Post } from "@/content/types";

interface BlogCardProps {
  post: Post;
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

export function BlogCard({ post }: BlogCardProps) {
  const transitionName = `blog-${post.slug}`;

  return (
    <Link
      to="/blog/$slug"
      params={{ slug: post.slug }}
      viewTransition
      style={{ viewTransitionName: transitionName }}
      className="group flex flex-col rounded-md bg-muted/5 p-6 no-underline transition-colors duration-200 hover:bg-muted/10"
    >
      <h3 className="font-display text-lg font-semibold text-fg transition-colors duration-200 group-hover:text-accent">
        {post.title}
      </h3>
      <div className="mt-auto flex items-center gap-3 pt-4 text-sm text-muted">
        <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
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
