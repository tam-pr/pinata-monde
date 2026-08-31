"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { cn } from "@/lib/cn";
import { NAV_LINKS } from "@/lib/nav";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-navy-20 bg-white/95 backdrop-blur">
      <Container className="flex h-[var(--header-h)] items-center justify-between gap-4">
        <Link href="/" className="flex shrink-0 items-center" onClick={() => setOpen(false)}>
          <span className="sr-only">Piñata Monde, ir al inicio</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/logo-horizontal.svg"
            alt=""
            className="hidden h-10 w-auto sm:block"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/logo-isotipo.svg"
            alt=""
            className="h-11 w-11 sm:hidden"
          />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Principal">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium text-ink-soft transition-colors hover:text-magenta",
                isActive(link.href) && "text-navy",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:block">
          <Button href="/cotizar">Solicitar cotización</Button>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] border border-navy-20 text-navy lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((value) => !value)}
        >
          <span className="sr-only">{open ? "Cerrar menú" : "Abrir menú"}</span>
          <span className="flex flex-col gap-1.5" aria-hidden>
            <span className={cn("h-0.5 w-5 bg-navy transition", open && "translate-y-2 rotate-45")} />
            <span className={cn("h-0.5 w-5 bg-navy transition", open && "opacity-0")} />
            <span className={cn("h-0.5 w-5 bg-navy transition", open && "-translate-y-2 -rotate-45")} />
          </span>
        </button>
      </Container>

      {open ? (
        <div id="mobile-nav" className="border-t border-navy-20 bg-white lg:hidden">
          <Container className="flex flex-col gap-1 py-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-[var(--radius-sm)] px-3 py-3 text-base font-medium text-navy hover:bg-magenta-20",
                  isActive(link.href) && "bg-navy-20",
                )}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Button href="/cotizar" className="mt-3 w-full" onClick={() => setOpen(false)}>
              Solicitar cotización
            </Button>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
