import { useLayoutEffect, useRef } from "react";

export function useRevealRef() {
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    let dispose: (() => void) | undefined;

    if (el) {
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const rect = el.getBoundingClientRect();
      const isInViewport = rect.top < window.innerHeight;

      if (prefersReducedMotion || isInViewport) {
        el.dataset.revealVisible = "true";
      } else {
        el.dataset.reveal = "true";
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              el.dataset.revealVisible = "true";
              observer.disconnect();
            }
          },
          { threshold: 0.15 },
        );

        observer.observe(el);
        dispose = () => {
          observer.disconnect();
        };
      }
    }

    return () => {
      dispose?.();
    };
  }, []);

  return ref;
}
