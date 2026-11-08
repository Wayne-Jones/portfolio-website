import { createFileRoute, Outlet } from "@tanstack/react-router";

/**
 * Blog layout — groups the listing pages and the post detail route without
 * imposing shared chrome on either.
 */
export const Route = createFileRoute("/blog")({
  component: BlogLayout,
});

function BlogLayout() {
  return <Outlet />;
}
