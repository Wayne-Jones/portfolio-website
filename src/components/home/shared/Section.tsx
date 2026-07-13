import { useRevealRef } from "@/components/home/shared/useReveal";
import { cn } from "@/lib/utils";

interface SectionProps {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function Section({ eyebrow, title, children, className }: SectionProps) {
  const ref = useRevealRef();

  return (
    <section ref={ref} data-slot="section" className={cn("py-16 md:py-24", className)}>
      <div className="mb-8">
        <p className="mb-0 text-xs tracking-widest text-muted uppercase">{eyebrow}</p>
        <hr className="my-3 h-px border-0 bg-fg/10" />
        <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">{title}</h2>
      </div>
      {children}
    </section>
  );
}
