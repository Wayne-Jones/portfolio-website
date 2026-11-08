import { Fragment, type ReactNode } from "react";

import { PaginationControls, type ListingBasePath } from "./PaginationControls";

interface ListingPageProps<T> {
  /** Listing root, used to build pagination links. */
  basePath: ListingBasePath;
  /** Small label above the title. */
  eyebrow: string;
  /** Page title, rendered as the only `h1`. */
  title: string;
  /** Short description below the title. */
  description: string;
  /** Message shown when there are no items. */
  emptyMessage: string;
  /** Items for the current page. */
  items: readonly T[];
  /** Stable React key for an item. */
  getKey: (item: T) => string;
  /** Renders one item; the grid controls the layout, not the item. */
  renderItem: (item: T, index: number) => ReactNode;
  /** Grid classes for the current content type. */
  gridClassName: string;
  /** Current 1-based page. */
  page: number;
  /** Total number of pages. */
  pageCount: number;
}

/**
 * Shared shell for paginated listing routes.
 *
 * Owns the header, grid wrapper, empty state, and pagination so `/blog` and
 * `/portfolio` only describe their copy and cards.
 */
export function ListingPage<T>({
  basePath,
  eyebrow,
  title,
  description,
  emptyMessage,
  items,
  getKey,
  renderItem,
  gridClassName,
  page,
  pageCount,
}: ListingPageProps<T>) {
  return (
    <section className="mx-auto w-full max-w-5xl pb-16">
      <header className="mb-8">
        <p className="mb-2 text-xs tracking-widest text-muted uppercase">{eyebrow}</p>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-fg md:text-4xl">
          {title}
        </h1>
        <p className="mt-3 max-w-[55ch] text-muted">{description}</p>
      </header>

      {items.length === 0 ? (
        <p className="text-muted">{emptyMessage}</p>
      ) : (
        <div className={gridClassName}>
          {items.map((item, index) => (
            <Fragment key={getKey(item)}>{renderItem(item, index)}</Fragment>
          ))}
        </div>
      )}

      <PaginationControls basePath={basePath} page={page} pageCount={pageCount} />
    </section>
  );
}
