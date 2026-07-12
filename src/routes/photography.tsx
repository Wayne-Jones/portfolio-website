import { createFileRoute } from "@tanstack/react-router";

/**
 * Photography route — placeholder.
 * Will list photo sets pulled from the content adapter.
 */
export const Route = createFileRoute("/photography")({
  component: Photography,
});

function Photography() {
  return (
    <section>
      <h1 className="mb-2 text-4xl">Photography</h1>
      <p className="max-w-[40ch] text-muted">Photo sets coming soon.</p>
    </section>
  );
}
