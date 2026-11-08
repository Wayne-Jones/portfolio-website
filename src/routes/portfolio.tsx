import { createFileRoute, Outlet } from "@tanstack/react-router";

/**
 * Portfolio layout — groups the listing pages and the case-study detail route.
 */
export const Route = createFileRoute("/portfolio")({
  component: PortfolioLayout,
});

function PortfolioLayout() {
  return <Outlet />;
}
