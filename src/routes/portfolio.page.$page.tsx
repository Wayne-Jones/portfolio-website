import { createFileRoute, notFound, redirect } from "@tanstack/react-router";

import { NotFound } from "@/components/article/NotFound";
import { PortfolioListing } from "@/components/article/PortfolioListing";
import { contentService } from "@/content";
import { paginate, parsePageNumber, resolvePage } from "@/content/pagination";

/**
 * Portfolio page N — `/portfolio/page/2`, `/portfolio/page/3`, ...
 *
 * Invalid and out-of-range page numbers resolve to `null` so the route renders
 * the editorial 404 affordance.
 */
export const Route = createFileRoute("/portfolio/page/$page")({
  loader: async ({ params }) => {
    const page = parsePageNumber(params.page);
    if (page === null) throw notFound();
    if (page === 1) throw redirect({ to: "/portfolio" });

    const projects = await contentService.getProjects();
    const { pageCount } = paginate(projects.length);
    if (page > pageCount) throw notFound();

    return { projects: resolvePage(projects, page), page, pageCount };
  },
  head: ({ loaderData }) => {
    const page = loaderData?.page;
    return {
      meta: [
        { title: page === undefined ? "Page not found — Portfolio" : `Portfolio — Page ${page}` },
        {
          name: "description",
          content: "Selected case studies across product design and engineering.",
        },
      ],
    };
  },
  notFoundComponent: PortfolioPageNotFound,
  component: PortfolioPage,
});

function PortfolioPageNotFound() {
  return (
    <NotFound
      title="Page not found"
      message="This portfolio page doesn't exist. Try starting from the first page."
    />
  );
}

function PortfolioPage() {
  const data = Route.useLoaderData();

  return <PortfolioListing projects={data.projects} page={data.page} pageCount={data.pageCount} />;
}
