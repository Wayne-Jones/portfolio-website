import { WorkTile } from "@/components/home/work-portfolio/WorkTile";
import type { Project } from "@/content/types";

import { ListingPage } from "./ListingPage";

interface PortfolioListingProps {
  projects: Project[];
  page: number;
  pageCount: number;
}

/** Paginated portfolio listing shared by `/portfolio` and `/portfolio/page/N`. */
export function PortfolioListing({ projects, page, pageCount }: PortfolioListingProps) {
  return (
    <ListingPage
      basePath="/portfolio"
      eyebrow="Work"
      title="Portfolio"
      description="Selected case studies across product design and engineering."
      emptyMessage="No projects yet."
      items={projects}
      getKey={(project) => project.id}
      renderItem={(project, index) => (
        <div className={index === 0 ? "sm:col-span-2 lg:col-span-2" : ""}>
          <WorkTile project={project} headingLevel={2} />
        </div>
      )}
      gridClassName="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      page={page}
      pageCount={pageCount}
    />
  );
}
