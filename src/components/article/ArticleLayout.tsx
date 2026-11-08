import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { hasSlot } from "./lib";

/** Static route targets available for breadcrumbs on detail pages. */
export type BreadcrumbItem = {
  label: string;
  to: "/" | "/blog" | "/portfolio" | "/photography";
};

interface ArticleLayoutProps {
  /** Trail shown above the article header. */
  breadcrumbs?: readonly BreadcrumbItem[];
  /** Header slot (`<ArticleHeader />`). */
  header: ReactNode;
  /** Body slot (usually `<PostBody />`). */
  children: ReactNode;
  /** Optional footer slot below the body. */
  footer?: ReactNode;
  /**
   * Render the footer outside the article measure, edge-to-edge within the
   * page container (used by the photo set grid).
   */
  footerFullBleed?: boolean;
}

/**
 * Shared shell for blog posts and case studies.
 *
 * Owns the article measure, breadcrumbs, and the header/body/footer rhythm so
 * each detail route only has to describe its own content.
 */
export function ArticleLayout({
  breadcrumbs,
  header,
  children,
  footer,
  footerFullBleed = false,
}: ArticleLayoutProps) {
  return (
    <article className="w-full pb-16">
      <div className="mx-auto w-full max-w-3xl">
        {breadcrumbs !== undefined && breadcrumbs.length > 0 ? (
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="m-0 flex list-none flex-wrap items-center gap-2 p-0 text-sm text-muted">
              <li>
                <Link to="/" className="no-underline hover:text-fg">
                  Home
                </Link>
              </li>
              {breadcrumbs.map((crumb) => (
                <li key={crumb.to} className="flex items-center gap-2">
                  <span aria-hidden="true">/</span>
                  <Link to={crumb.to} className="no-underline hover:text-fg">
                    {crumb.label}
                  </Link>
                </li>
              ))}
            </ol>
          </nav>
        ) : null}

        {header}

        <div className="mt-10">{children}</div>
      </div>

      {hasSlot(footer) ? (
        <div
          className={cn(
            "mt-12 border-t border-t-[color-mix(in_oklch,var(--color-fg)_10%,transparent)] pt-8",
            footerFullBleed ? "-mx-(--page-gutter,0.75rem)" : "mx-auto w-full max-w-3xl",
          )}
        >
          {footer}
        </div>
      ) : null}
    </article>
  );
}
