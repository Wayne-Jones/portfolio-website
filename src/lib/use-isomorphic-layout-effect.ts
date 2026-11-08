import { useEffect, useLayoutEffect } from "react";

/**
 * `useLayoutEffect` on the client, `useEffect` during server rendering.
 *
 * The reveal hook needs to measure before paint on the client, but React warns
 * when `useLayoutEffect` runs during SSR/prerender.
 */
export const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;
