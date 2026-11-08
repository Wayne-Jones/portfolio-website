import { WorkTile } from "@/components/home/work-portfolio/WorkTile";
import type { Project } from "@/content/types";

import { PaginationControls } from "./PaginationControls";

interface PortfolioListingProps {
  projects: Project[];
  page: number;
  pageCount: number;
}

/** Paginated portfolio listing shared by `/portfolio` and `/portfolio/page/N`. */
export function PortfolioListing({ projects, page, pageCount }: PortfolioListingProps) {
  return (
    <section className="mx-auto w-full max-w-5xl pb-16">
      <header className="mb-8">
        <p className="mb-2 text-xs tracking-widest text-muted uppercase">Work</p>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-fg md:text-4xl">
          Portfolio
        </h1>
        <p className="mt-3 max-w-[55ch] text-muted">
          Selected case studies across product design and engineering.
        </p>
      </header>

      {projects.length === 0 ? (
        <p className="text-muted">No projects yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => (
            <div key={project.id} className={index === 0 ? "sm:col-span-2 lg:col-span-2" : ""}>
              <WorkTile project={project} headingLevel={2} />
            </div>
          ))}
        </div>
      )}

      <PaginationControls basePath="/portfolio" page={page} pageCount={pageCount} />
    </section>
  );
}
