import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/$")({
  component: NotFound,
});

function NotFound() {
  return (
    <section>
      <h1 className="mb-2 text-3xl">Page not found</h1>
      <p className="max-w-[40ch] text-muted">The page you are looking for doesn't exist.</p>
    </section>
  );
}
