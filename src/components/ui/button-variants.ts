import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  [
    "inline-flex items-center justify-center",
    "font-medium whitespace-nowrap",
    "transition-colors",
    "outline-none select-none",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        default: "bg-fg text-bg hover:opacity-90",
        accent: "bg-accent text-bg hover:opacity-90",
        outline: "border border-fg/20 bg-transparent text-fg hover:bg-fg/5",
        ghost: "bg-transparent text-fg hover:bg-fg/5",
        link: "bg-transparent text-accent underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 text-sm [&_svg:not([class*='size-'])]:size-4",
        sm: "h-8 px-3 text-xs [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-12 px-6 text-base [&_svg:not([class*='size-'])]:size-5",
        icon: "size-10 [&_svg:not([class*='size-'])]:size-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);
