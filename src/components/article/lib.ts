import type { ReactNode } from "react";

/** True when a string slot has actual content (not `undefined` or empty). */
export function hasText(value: string | undefined | null): value is string {
  return typeof value === "string" && value !== "";
}

/** True when a `ReactNode` slot was supplied. */
export function hasSlot(value: ReactNode): boolean {
  return value !== undefined && value !== null;
}
