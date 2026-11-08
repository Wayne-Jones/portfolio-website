import {
  createRootRoute,
  HeadContent,
  Link,
  Outlet,
  Scripts,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect, useRef, type RefObject } from "react";

// Import global styles — base resets + Tailwind v4 design tokens
import "@/styles/globals.css";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "UTF-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1.0" },
      {
        name: "description",
        content:
          "Personal portfolio showcasing software engineering projects, photography, and technical blog posts.",
      },
      { title: "portfolio-website" },
    ],
    links: [{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
  }),
  component: RootLayout,
});

const currentYear = new Date().getFullYear();

const navLinks = [
  { to: "/" as const, label: "Home" },
  { to: "/portfolio" as const, label: "Portfolio" },
  { to: "/photography" as const, label: "Photography" },
  { to: "/blog" as const, label: "Blog" },
] as const;

/**
 * Writes the current document title into the live region.
 *
 * The router commits the new `<head>` after the route effect runs, so wait for
 * the title to change. When it is already up to date, announce immediately.
 * Returns a cleanup function that cancels any pending observation.
 */
function announceRouteTitle(announcedTitle: RefObject<string>): () => void {
  const announce = () => {
    const region = document.getElementById("route-announcer");
    if (region !== null) {
      region.textContent = document.title;
    }
    announcedTitle.current = document.title;
  };

  if (document.title !== announcedTitle.current) {
    announce();
    return () => {};
  }

  const observer = new MutationObserver(() => {
    if (document.title !== announcedTitle.current) {
      observer.disconnect();
      announce();
    }
  });
  observer.observe(document.head, { subtree: true, childList: true, characterData: true });

  // Some routes may keep the same title; announce them anyway.
  const fallback = setTimeout(() => {
    observer.disconnect();
    announce();
  }, 1000);

  return () => {
    observer.disconnect();
    clearTimeout(fallback);
  };
}

/**
 * Announces client-side route changes and moves focus to the main landmark.
 * The first render is skipped so the initial page load does not steal focus.
 */
function RouteAnnouncer() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  // Tracks the last pathname that has been announced. Initialising with the
  // first pathname skips the initial load, and comparing values (rather than a
  // one-shot boolean) also skips React StrictMode's double effect in dev.
  const announcedPathname = useRef(pathname);
  const announcedTitle = useRef("");

  useEffect(() => {
    if (announcedPathname.current === pathname) {
      announcedTitle.current = document.title;
      return undefined;
    }
    announcedPathname.current = pathname;

    document.getElementById("main")?.focus({ preventScroll: true });
    return announceRouteTitle(announcedTitle);
    // The effect intentionally re-runs whenever the pathname changes.
    // eslint-disable-next-line react/exhaustive-effect-dependencies
  }, [pathname]);

  return <output id="route-announcer" aria-live="polite" className="sr-only" />;
}

function RootLayout() {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>

        <RouteAnnouncer />

        {/* Centered max-width container keeps layout consistent on large screens.
            --page-gutter is the single page inset; full-bleed regions derive
            their negative margin from it. */}
        <div className="mx-auto flex min-h-dvh w-full max-w-[1920px] flex-col [--page-gutter:0.75rem] sm:[--page-gutter:1rem]">
          <SiteHeader />

          <main
            id="main"
            tabIndex={-1}
            className="page-content flex-1 px-(--page-gutter) py-4"
            aria-label="Main content"
          >
            <Outlet />
          </main>

          <footer className="border-t border-t-[color-mix(in_oklch,var(--color-fg)_10%,transparent)] px-(--page-gutter) py-3 text-sm text-muted">
            <p className="m-0">&copy; {currentYear} Portfolio. All rights reserved.</p>
          </footer>
        </div>

        <Scripts />
      </body>
    </html>
  );
}

function SiteHeader() {
  return (
    <header className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b border-b-[color-mix(in_oklch,var(--color-fg)_10%,transparent)] px-(--page-gutter) py-2">
      <Link
        to="/"
        className="min-w-0 font-display text-[1.25rem] font-semibold text-fg no-underline"
      >
        Portfolio
      </Link>
      <nav aria-label="Primary" className="min-w-0">
        <ul className="m-0 flex list-none flex-wrap gap-x-3 gap-y-1 p-0">
          {navLinks.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                activeProps={{ "aria-current": "page" }}
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center no-underline"
                viewTransition
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
