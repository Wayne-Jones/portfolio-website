import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";

/** Render a React node to static HTML for assertions. */
export function render(node: ReactNode): string {
  return renderToStaticMarkup(node);
}
