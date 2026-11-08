import { BlogCard } from "@/components/home/blog/BlogCard";
import type { Post } from "@/content/types";

import { PaginationControls } from "./PaginationControls";

interface BlogListingProps {
  posts: Post[];
  page: number;
  pageCount: number;
}

/** Paginated blog listing shared by `/blog` and `/blog/page/N`. */
export function BlogListing({ posts, page, pageCount }: BlogListingProps) {
  return (
    <section className="mx-auto w-full max-w-5xl pb-16">
      <header className="mb-8">
        <p className="mb-2 text-xs tracking-widest text-muted uppercase">Writing</p>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-fg md:text-4xl">
          Blog
        </h1>
        <p className="mt-3 max-w-[55ch] text-muted">
          Essays on design, engineering, and the quiet web.
        </p>
      </header>

      {posts.length === 0 ? (
        <p className="text-muted">No posts yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      )}

      <PaginationControls basePath="/blog" page={page} pageCount={pageCount} />
    </section>
  );
}
