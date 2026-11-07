import type { ReactNode } from "react";

export function Paragraph({ children }: { children: ReactNode }) {
  return <p className="my-5 leading-relaxed text-fg">{children}</p>;
}
