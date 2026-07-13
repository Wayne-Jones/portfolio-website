import { createFileRoute } from "@tanstack/react-router";

/**
 * Portfolio project route — placeholder.
 *
 * The `$slug` param will be used to fetch a single project from the
 * content adapter in a subsequent change.
 */
export const Route = createFileRoute("/portfolio/$slug")({
  component: PortfolioProject,
});

function PortfolioProject() {
  const { slug } = Route.useParams();

  return (
    <article>
      <div
        style={{ viewTransitionName: `work-tile-${slug}` }}
        className="mb-6 aspect-4/3 w-full rounded-md bg-muted/10"
      />
      <h1 className="mb-2 text-3xl">Project</h1>
      <p className="max-w-[40ch] text-muted">This project's content will load here.</p>
    </article>
  );
}
