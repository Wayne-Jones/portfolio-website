import { useEffect, useRef } from "react";

function OutlineFilter() {
  return (
    <svg aria-hidden="true" className="absolute size-0 overflow-hidden">
      <defs>
        <filter
          id="clean-outline"
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
          colorInterpolationFilters="sRGB"
        >
          <feMorphology in="SourceAlpha" operator="dilate" radius="2" result="dilated" />
          <feFlood floodColor="currentColor" floodOpacity="1" result="outlineColor" />
          <feComposite in="outlineColor" in2="dilated" operator="in" result="coloredOutline" />
          <feComposite in="coloredOutline" in2="SourceAlpha" operator="out" result="cleanOutline" />
        </filter>
      </defs>
    </svg>
  );
}

function useParallaxScroll() {
  const rafRef = useRef<number>(0);
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mqlReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const parallaxEl = parallaxRef.current;
    let dispose: (() => void) | undefined;

    if (!mqlReducedMotion.matches && parallaxEl) {
      const mqlDesktop = window.matchMedia("(min-width: 64rem)");

      if (mqlDesktop.matches) {
        const hero = document.querySelector("[data-slot='hero']");

        if (hero) {
          const update = () => {
            const rect = hero.getBoundingClientRect();
            const progress = Math.max(0, Math.min(1, -rect.top / rect.height));
            parallaxEl.style.setProperty("--parallax-y", `${progress * 60}px`);
          };

          const onScroll = () => {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = requestAnimationFrame(update);
          };

          window.addEventListener("scroll", onScroll, { passive: true });
          dispose = () => {
            window.removeEventListener("scroll", onScroll);
            cancelAnimationFrame(rafRef.current);
          };
        }
      }
    }

    return () => {
      dispose?.();
    };
  }, []);

  return parallaxRef;
}

export function Hero() {
  const parallaxRef = useParallaxScroll();

  return (
    <section
      data-slot="hero"
      className="relative isolate flex flex-col items-center pt-4 pb-16 sm:px-4 sm:pt-8 sm:pb-24"
    >
      <OutlineFilter />
      <div className="w-full max-w-150">
        <p className="hero-entrance mb-6 text-center text-[clamp(20px,2.5vw,32px)] text-muted sm:mb-4">
          👋 My Name is Wayne Jones and I am a...
        </p>

        <h1 className="hero-entrance text-center font-display text-[40px] leading-[0.95] font-black tracking-[-0.06em] sm:text-[56px] md:text-[80px] lg:text-[clamp(120px,12vw,175px)]">
          <span className="block whitespace-nowrap">Web Developer</span>
          <span className="text-outline block whitespace-nowrap">& Photographer</span>
        </h1>

        <p className="hero-entrance mt-6 text-center text-[clamp(20px,2.5vw,32px)] text-muted sm:mt-10 lg:text-left">
          based in New York, NY.
        </p>

        <div
          ref={parallaxRef}
          data-parallax
          className="hero-entrance translate-y-(--parallax-y) lg:pointer-events-none lg:absolute lg:top-1/2 lg:left-1/2 lg:z-10 lg:-translate-x-1/2 lg:translate-y-[3%] xl:translate-y-[8%]"
        >
          <img
            src="/portrait-placeholder.svg"
            alt="Portrait of Wayne Jones, web developer and photographer based in New York"
            width={200}
            height={250}
            className="mx-auto mt-10 w-32 sm:w-44 lg:mx-0 lg:mt-0 lg:w-40"
            style={{ aspectRatio: "4 / 5" }}
          />
        </div>
      </div>
    </section>
  );
}
