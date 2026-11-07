import type { ReactNode } from "react";

import type { CalloutVariant } from "@/content/types";

const VARIANT_CLASSES: Record<CalloutVariant, string> = {
  info: "border-accent bg-accent/5",
  warning: "border-amber-500 bg-amber-500/5",
  success: "border-green-600 bg-green-600/5",
};

/** Callout card with variant-specific accent and background. */
export function Callout({
  variant = "info",
  children,
}: {
  variant?: CalloutVariant;
  children: ReactNode;
}) {
  return (
    <aside className={`my-8 border-l-2 px-5 py-4 text-fg ${VARIANT_CLASSES[variant]}`}>
      {children}
    </aside>
  );
}
