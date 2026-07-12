import { createRootRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
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
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      {/* Centered max-width container keeps layout consistent on large screens. */}
      <div className="mx-auto flex min-h-dvh w-full max-w-[1920px] flex-col">
        <SiteHeader />

        <main id="main" className="page-content flex-1 px-3 py-4" aria-label="Main content">
          <Outlet />
        </main>

        <footer className="border-t border-t-[color-mix(in_oklch,var(--color-fg)_10%,transparent)] p-3 text-sm text-muted">
          <p className="m-0">&copy; {currentYear} Portfolio. All rights reserved.</p>
        </footer>
      </div>
    </>
  );
}

function SiteHeader() {
  return (
    <header className="flex items-center justify-between border-b border-b-[color-mix(in_oklch,var(--color-fg)_10%,transparent)] px-3 py-2">
      <Link to="/" className="font-display text-[1.25rem] font-semibold text-fg no-underline">
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
