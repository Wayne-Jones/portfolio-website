import { createFileRoute } from "@tanstack/react-router";

/**
 * Blog index route — placeholder.
 * Will list posts pulled from the content adapter.
 */
export const Route = createFileRoute("/blog/")({
  component: BlogIndex,
});

function BlogIndex() {
  return (
    <section>
      <h1 className="mb-2 text-4xl">Blog</h1>
      <p className="max-w-[40ch] text-muted">Posts coming soon.</p>
    </section>
  );
}
