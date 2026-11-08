import { createRouter } from "@tanstack/react-router";
import { flushSync } from "react-dom";

import { RouteError } from "./components/article/RouteError";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  const router = createRouter({
    routeTree,
    defaultPreload: "intent",
    defaultViewTransition: true,
    trailingSlash: "never",
    defaultErrorComponent: RouteError,
  });

  router.startViewTransition = (fn: () => void) => {
    if (
      typeof document !== "undefined" &&
      "startViewTransition" in document &&
      typeof document.startViewTransition === "function"
    ) {
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (prefersReducedMotion) {
        fn();
        return;
      }

      document.startViewTransition(() => {
        flushSync(fn);
      });
    } else {
      fn();
    }
  };

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
