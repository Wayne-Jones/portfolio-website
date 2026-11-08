import { Section } from "@/components/home/shared/Section";
import { WorkTile } from "@/components/home/work-portfolio/WorkTile";
import type { Project } from "@/content/types";

interface WorkPortfolioProps {
  projects: Project[];
  /** True while the section's deferred content is pending. */
  loading?: boolean;
}

const skeletonItems = [0, 1, 2, 3];

export function WorkPortfolio({ projects, loading = false }: WorkPortfolioProps) {
  if (loading) {
    return (
      <Section
        eyebrow="WORK"
        title="Selected projects"
        loading
        loadingMessage="Loading selected projects…"
      >
        <div aria-hidden="true" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {skeletonItems.map((i) => (
            <div
              key={i}
              className={`animate-shimmer aspect-4/3 rounded-md ${i === 0 ? "sm:col-span-2 lg:col-span-2" : ""}`}
            />
          ))}
        </div>
      </Section>
    );
  }

  if (projects.length === 0) {
    return (
      <Section eyebrow="WORK" title="Selected projects">
        <p className="text-muted">No projects yet.</p>
      </Section>
    );
  }

  return (
    <Section eyebrow="WORK" title="Selected projects">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project, i) => (
          <div key={project.id} className={i === 0 ? "sm:col-span-2 lg:col-span-2" : ""}>
            <WorkTile project={project} />
          </div>
        ))}
      </div>
    </Section>
  );
}
