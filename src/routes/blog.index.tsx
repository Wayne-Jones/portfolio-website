import { createFileRoute } from "@tanstack/react-router";

import { BlogListing } from "@/components/article/BlogListing";
import { contentService } from "@/content";
import { paginate, resolvePage } from "@/content/pagination";

/**
 * Blog page 1 — the canonical `/blog` listing.
 */
export const Route = createFileRoute("/blog/")({
  loader: async () => {
    const posts = await contentService.getPosts();
    return {
      posts: resolvePage(posts, 1),
      page: 1,
      pageCount: paginate(posts.length).pageCount,
    };
  },
  head: () => ({
    meta: [
      { title: "Blog — Portfolio" },
      { name: "description", content: "Essays on design, engineering, and the quiet web." },
    ],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  const { posts, page, pageCount } = Route.useLoaderData();
  return <BlogListing posts={posts} page={page} pageCount={pageCount} />;
}
