import { createFileRoute, notFound, redirect } from "@tanstack/react-router";

import { BlogListing } from "@/components/article/BlogListing";
import { NotFound } from "@/components/article/NotFound";
import { contentService } from "@/content";
import { paginate, parsePageNumber, resolvePage } from "@/content/pagination";

/**
 * Blog page N — `/blog/page/2`, `/blog/page/3`, ...
 *
 * Invalid and out-of-range page numbers resolve to `null` so the route renders
 * the editorial 404 affordance.
 */
export const Route = createFileRoute("/blog/page/$page")({
  loader: async ({ params }) => {
    const page = parsePageNumber(params.page);
    if (page === null) throw notFound();
    if (page === 1) throw redirect({ to: "/blog" });

    const posts = await contentService.getPosts();
    const { pageCount } = paginate(posts.length);
    if (page > pageCount) throw notFound();

    return { posts: resolvePage(posts, page), page, pageCount };
  },
  head: ({ loaderData }) => {
    const page = loaderData?.page;
    return {
      meta: [
        { title: page === undefined ? "Page not found — Blog" : `Blog — Page ${page}` },
        { name: "description", content: "Essays on design, engineering, and the quiet web." },
      ],
    };
  },
  notFoundComponent: BlogPageNotFound,
  component: BlogPage,
});

function BlogPageNotFound() {
  return (
    <NotFound
      title="Page not found"
      message="This blog page doesn't exist. Try starting from the first page."
    />
  );
}

function BlogPage() {
  const data = Route.useLoaderData();

  return <BlogListing posts={data.posts} page={data.page} pageCount={data.pageCount} />;
}
