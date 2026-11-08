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
  /** Title of the current page, rendered as the final, non-link crumb. */
  current?: string;
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

interface BreadcrumbsProps {
  breadcrumbs: readonly BreadcrumbItem[];
  current?: string;
}

function Breadcrumbs({ breadcrumbs, current }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-8">
      <ol className="m-0 flex list-none flex-wrap items-center gap-2 p-0 text-sm text-muted">
        <li>
          <Link to="/" activeOptions={{ exact: true }} className="no-underline hover:text-fg">
            Home
          </Link>
        </li>
        {breadcrumbs.map((crumb, index) => (
          <li key={index} className="flex items-center gap-2">
            <span aria-hidden="true">/</span>
            <Link
              to={crumb.to}
              activeOptions={{ exact: true }}
              className="no-underline hover:text-fg"
            >
              {crumb.label}
            </Link>
          </li>
        ))}
        {current === undefined || current === "" ? null : (
          <li className="flex items-center gap-2">
            <span aria-hidden="true">/</span>
            <span aria-current="page">{current}</span>
          </li>
        )}
      </ol>
    </nav>
  );
}

/**
 * Shared shell for blog posts and case studies.
 *
 * Owns the article measure, breadcrumbs, and the header/body/footer rhythm so
 * each detail route only has to describe its own content.
 */
export function ArticleLayout({
  breadcrumbs,
  current,
  header,
  children,
  footer,
  footerFullBleed = false,
}: ArticleLayoutProps) {
  return (
    <article className="w-full pb-16">
      <div className="mx-auto w-full max-w-3xl">
        {breadcrumbs !== undefined && breadcrumbs.length > 0 ? (
          <Breadcrumbs breadcrumbs={breadcrumbs} current={current} />
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
