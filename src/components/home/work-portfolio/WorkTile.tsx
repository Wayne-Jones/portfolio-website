import { Link } from "@tanstack/react-router";

import type { Project } from "@/content/types";

interface WorkTileProps {
  project: Project;
}

export function WorkTile({ project }: WorkTileProps) {
  return (
    <Link
      to="/portfolio/$slug"
      params={{ slug: project.slug }}
      viewTransition
      style={{ viewTransitionName: `work-tile-${project.slug}` }}
      className="group relative block aspect-4/3 overflow-hidden rounded-md bg-muted/20 no-underline"
    >
      <div className="absolute inset-0 bg-linear-to-t from-fg/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="absolute inset-0 flex translate-y-2 flex-col justify-end p-5 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
        <h3 className="font-display text-lg font-semibold text-bg">{project.title}</h3>
        {project.role != null && project.role !== "" && (
          <span className="mt-1 text-xs tracking-widest text-bg/80 uppercase">{project.role}</span>
        )}
        {project.client != null && project.client !== "" && (
          <span className="mt-0.5 text-sm text-bg/70">{project.client}</span>
        )}
      </div>
    </Link>
  );
}
