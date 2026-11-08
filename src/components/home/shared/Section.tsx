import { useRevealRef } from "@/components/home/shared/useReveal";
import { cn } from "@/lib/utils";

interface SectionProps {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  className?: string;
  /** Marks the section busy and announces a pending state. */
  loading?: boolean;
  /** Visually hidden status message announced while loading. */
  loadingMessage?: string;
}

export function Section({
  eyebrow,
  title,
  children,
  className,
  loading = false,
  loadingMessage = "Loading content…",
}: SectionProps) {
  const ref = useRevealRef();

  return (
    <section
      ref={ref}
      data-slot="section"
      aria-busy={loading ? "true" : undefined}
      className={cn("py-16 md:py-24", className)}
    >
      <div className="mb-8">
        <p className="mb-0 text-xs tracking-widest text-muted uppercase">{eyebrow}</p>
        <hr aria-hidden="true" className="my-3 h-px border-0 bg-fg/10" />
        <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">{title}</h2>
      </div>
      {loading ? <output className="sr-only">{loadingMessage}</output> : null}
      {children}
    </section>
  );
}
