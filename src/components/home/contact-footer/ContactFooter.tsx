const mailtoHref =
  "mailto:hello@wayne.me?subject=Let's%20work%20together&body=Hi%20Wayne%2C%0A%0AI%20came%20across%20your%20portfolio%20and%20would%20love%20to%20chat%20about%20a%20potential%20project.";

export function ContactFooter() {
  return (
    <section data-slot="contact-footer" className="flex flex-col items-center py-16 md:py-24">
      <p className="mb-6 font-display text-[clamp(40px,8vw,96px)] leading-[0.95] font-black tracking-[-0.04em] text-fg">
        Let's work together
      </p>
      <a
        href={mailtoHref}
        className="font-display text-[clamp(24px,4vw,48px)] font-semibold text-accent no-underline transition-opacity duration-200 hover:opacity-80"
      >
        hello@wayne.me <span aria-hidden="true">→</span>
      </a>
    </section>
  );
}
