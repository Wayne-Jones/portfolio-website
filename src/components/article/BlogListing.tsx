import { BlogCard } from "@/components/home/blog/BlogCard";
import type { Post } from "@/content/types";

import { ListingPage } from "./ListingPage";

interface BlogListingProps {
  posts: Post[];
  page: number;
  pageCount: number;
}

/** Paginated blog listing shared by `/blog` and `/blog/page/N`. */
export function BlogListing({ posts, page, pageCount }: BlogListingProps) {
  return (
    <ListingPage
      basePath="/blog"
      eyebrow="Writing"
      title="Blog"
      description="Essays on design, engineering, and the quiet web."
      emptyMessage="No posts yet."
      items={posts}
      getKey={(post) => post.id}
      renderItem={(post) => <BlogCard post={post} headingLevel={2} />}
      gridClassName="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
      page={page}
      pageCount={pageCount}
    />
  );
}
