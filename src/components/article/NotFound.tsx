import { Link } from "@tanstack/react-router";

interface NotFoundProps {
  title?: string;
  message?: string;
}

/**
 * Editorial 404 affordance used by detail routes and the top-level catch-all.
 */
export function NotFound({
  title = "Page not found",
  message = "The page you are looking for doesn't exist, or it may have moved.",
}: NotFoundProps) {
  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col items-start py-16">
      <p className="mb-3 text-xs tracking-widest text-muted uppercase">404 — Not found</p>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-fg md:text-4xl">
        {title}
      </h1>
      <p className="mt-4 max-w-[45ch] text-muted">{message}</p>
      <Link
        to="/"
        className="mt-8 inline-flex items-center gap-2 text-accent no-underline hover:underline"
      >
        Back to homepage
        <span aria-hidden="true">→</span>
      </Link>
    </section>
  );
}
