import {
  createRootRoute,
  HeadContent,
  Link,
  Outlet,
  Scripts,
} from "@tanstack/react-router";

// Import global styles — base resets + Tailwind v4 design tokens
import "@/index.css";
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

        {/* Centered max-width container keeps layout consistent on large screens. */}
        <div className="mx-auto flex min-h-dvh w-full max-w-[1920px] flex-col">
          <SiteHeader />

          <main
            id="main"
            className="page-content flex-1 px-3 py-4"
            aria-label="Main content"
          >
            <Outlet />
          </main>

          <footer className="border-t border-t-[color-mix(in_oklch,var(--color-fg)_10%,transparent)] p-3 text-sm text-muted">
            <p className="m-0">
              &copy; {currentYear} Portfolio. All rights reserved.
            </p>
          </footer>
        </div>

        <Scripts />
      </body>
    </html>
  );
}

function SiteHeader() {
  return (
    <header className="flex items-center justify-between border-b border-b-[color-mix(in_oklch,var(--color-fg)_10%,transparent)] px-3 py-2">
      <Link
        to="/"
        className="font-display text-[1.25rem] font-semibold text-fg no-underline"
      >
        Portfolio
      </Link>
      <nav aria-label="Primary">
        <ul className="m-0 flex list-none gap-3 p-0">
          {navLinks.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                activeProps={{ "aria-current": "page" }}
                className="no-underline"
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
