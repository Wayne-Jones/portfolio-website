import { Link, type ErrorComponentProps } from "@tanstack/react-router";
import { useEffect } from "react";

/** Shared router error page; keeps the site shell around a recoverable error. */
export function RouteError({ error, reset }: ErrorComponentProps) {
  useEffect(() => {
    console.error("Route render failed", error);
  }, [error]);

  const message = error instanceof Error ? error.message : "An unexpected error occurred.";

  return (
    <section aria-labelledby="route-error-title" className="mx-auto w-full max-w-3xl py-16">
      <p className="mb-2 text-xs tracking-widest text-muted uppercase">Error</p>
      <h1
        id="route-error-title"
        className="font-display text-3xl font-semibold tracking-tight text-fg md:text-4xl"
      >
        Something went wrong
      </h1>
      <p className="mt-3 max-w-[55ch] text-muted">{message}</p>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={() => {
            reset();
          }}
          className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-accent px-4 py-2 font-semibold text-bg"
        >
          Try again
        </button>
        <Link to="/" className="inline-flex min-h-[44px] items-center justify-center no-underline">
          Back to home
        </Link>
      </div>
    </section>
  );
}
