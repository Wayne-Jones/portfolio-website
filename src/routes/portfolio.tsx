import { createFileRoute } from "@tanstack/react-router";

/**
 * Portfolio route — placeholder.
 * Will list case studies pulled from the content adapter.
 */
export const Route = createFileRoute("/portfolio")({
  component: Portfolio,
});

function Portfolio() {
  return (
    <section>
      <h1 className="mb-2 text-4xl">Portfolio</h1>
      <p className="max-w-[40ch] text-muted">Case studies coming soon.</p>
    </section>
  );
}
