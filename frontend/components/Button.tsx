import Link from "next/link";
import { cn } from "@/lib/cn";

const variants = {
  primary: "bg-magenta text-white hover:bg-navy active:bg-navy",
  secondary:
    "border border-navy bg-white text-navy hover:bg-navy-20",
  ghost: "text-navy hover:text-magenta",
} as const;

type Variant = keyof typeof variants;

const sizes = {
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3.5 text-base",
} as const;

type Common = {
  children: React.ReactNode;
  className?: string;
  variant?: Variant;
  size?: keyof typeof sizes;
};

type ButtonAsButton = Common &
  React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type ButtonAsLink = Common &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    href: string;
  };

export function Button({
  children,
  className,
  variant = "primary",
  size = "md",
  ...rest
}: ButtonAsButton | ButtonAsLink) {
  const classes = cn(
    "inline-flex min-h-11 items-center justify-center rounded-[var(--radius-sm)] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60",
    variants[variant],
    sizes[size],
    className,
  );

  if ("href" in rest && rest.href) {
    const { href, ...linkRest } = rest;
    return (
      <Link href={href} className={classes} {...linkRest}>
        {children}
      </Link>
    );
  }

  const buttonRest = rest as ButtonAsButton;
  return (
    <button className={classes} {...buttonRest}>
      {children}
    </button>
  );
}
