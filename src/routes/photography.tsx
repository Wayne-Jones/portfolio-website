import { createFileRoute, Outlet } from "@tanstack/react-router";

/**
 * Photography layout — groups the listing page and the photo set detail route.
 */
export const Route = createFileRoute("/photography")({
  component: PhotographyLayout,
});

function PhotographyLayout() {
  return <Outlet />;
}
