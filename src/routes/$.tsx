import { createFileRoute } from "@tanstack/react-router";

import { NotFound } from "@/components/article/NotFound";

export const Route = createFileRoute("/$")({
  notFoundComponent: () => <NotFound />,
  component: () => <NotFound />,
});
