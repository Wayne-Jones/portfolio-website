import { createFileRoute } from "@tanstack/react-router";

import { PortfolioListing } from "@/components/article/PortfolioListing";
import { contentService } from "@/content";
import { paginate, resolvePage } from "@/content/pagination";

/**
 * Portfolio page 1 — the canonical `/portfolio` listing.
 */
export const Route = createFileRoute("/portfolio/")({
  loader: async () => {
    const projects = await contentService.getProjects();
    return {
      projects: resolvePage(projects, 1),
      page: 1,
      pageCount: paginate(projects.length).pageCount,
    };
  },
  head: () => ({
    meta: [
      { title: "Portfolio — Portfolio" },
      {
        name: "description",
        content: "Selected case studies across product design and engineering.",
      },
    ],
  }),
  component: PortfolioIndex,
});

function PortfolioIndex() {
  const { projects, page, pageCount } = Route.useLoaderData();
  return <PortfolioListing projects={projects} page={page} pageCount={pageCount} />;
}
