"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { cn } from "@/lib/cn";
import { NAV_LINKS } from "@/lib/nav";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-navy-20 bg-white/95 backdrop-blur">
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
          className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-sm)] border border-navy-20 text-navy transition-colors hover:bg-magenta-20 lg:hidden"
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
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default bg-navy/50 lg:hidden"
            aria-label="Cerrar menú"
            onClick={() => setOpen(false)}
          />
          <div
            id="mobile-nav"
            className="relative z-50 border-t border-navy-20 bg-white shadow-[0_18px_40px_rgba(38,34,97,0.2)] lg:hidden"
          >
            <Container className="flex max-h-[calc(100vh-var(--header-h))] flex-col gap-1 overflow-y-auto py-4 sm:py-5">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-[var(--radius-sm)] px-3 py-3.5 text-base font-medium text-navy transition-colors hover:bg-magenta-20",
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
        </>
      ) : null}
    </header>
  );
}
