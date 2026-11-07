import type { ReactNode } from "react";

/** Ordered or unordered list. Items are rendered by the dispatcher. */
export function List({ ordered, children }: { ordered: boolean; children: ReactNode }) {
  if (ordered) {
    return <ol className="my-5 list-decimal space-y-2 pl-6 text-fg">{children}</ol>;
  }
  return <ul className="my-5 list-disc space-y-2 pl-6 text-fg">{children}</ul>;
}
