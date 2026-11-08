import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

type ListingBasePath = "/blog" | "/portfolio";

interface PaginationControlsProps {
  /** Listing root, used to build page links. */
  basePath: ListingBasePath;
  /** Current 1-based page. */
  page: number;
  /** Total number of pages. */
  pageCount: number;
}

const linkClassName =
  "inline-flex min-w-9 items-center justify-center rounded-md border border-[color-mix(in_oklch,var(--color-fg)_12%,transparent)] px-3 py-1.5 text-sm text-fg no-underline transition-colors hover:bg-muted/10";

const currentClassName =
  "inline-flex min-w-9 items-center justify-center rounded-md bg-accent px-3 py-1.5 text-sm font-semibold text-bg";

/**
 * Previous / numeric / next pagination controls for listing pages.
 *
 * Page 1 uses the listing root (`/blog`), later pages use `/blog/page/N`.
 * Controls are omitted entirely when the listing only has one page.
 */
export function PaginationControls({ basePath, page, pageCount }: PaginationControlsProps) {
  if (pageCount <= 1) {
    return null;
  }

  const pages = Array.from({ length: pageCount }, (_, index) => index + 1);

  return (
    <nav aria-label="Pagination" className="mt-12 flex flex-wrap items-center justify-center gap-2">
      {page > 1 ? (
        <PageLink basePath={basePath} target={page - 1} rel="prev">
          Previous
        </PageLink>
      ) : null}

      {pages.map((target) =>
        target === page ? (
          <span key={target} aria-current="page" className={currentClassName}>
            {target}
          </span>
        ) : (
          <PageLink key={target} basePath={basePath} target={target}>
            {target}
          </PageLink>
        ),
      )}

      {page < pageCount ? (
        <PageLink basePath={basePath} target={page + 1} rel="next">
          Next
        </PageLink>
      ) : null}
    </nav>
  );
}

interface PageLinkProps {
  basePath: ListingBasePath;
  target: number;
  rel?: "prev" | "next";
  children: ReactNode;
}

function PageLink({ basePath, target, rel, children }: PageLinkProps) {
  if (basePath === "/blog") {
    return target === 1 ? (
      <Link to="/blog" rel={rel} className={linkClassName}>
        {children}
      </Link>
    ) : (
      <Link
        to="/blog/page/$page"
        params={{ page: String(target) }}
        rel={rel}
        className={linkClassName}
      >
        {children}
      </Link>
    );
  }

  return target === 1 ? (
    <Link to="/portfolio" rel={rel} className={linkClassName}>
      {children}
    </Link>
  ) : (
    <Link
      to="/portfolio/page/$page"
      params={{ page: String(target) }}
      rel={rel}
      className={linkClassName}
    >
      {children}
    </Link>
  );
}
