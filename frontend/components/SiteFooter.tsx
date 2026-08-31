import Link from "next/link";
import { Container } from "@/components/Container";
import { CONTACT, NAV_LINKS } from "@/lib/nav";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-navy-20 bg-white">
      <Container className="grid gap-10 py-12 sm:grid-cols-2 sm:gap-x-12 sm:gap-y-12 lg:grid-cols-[1.35fr_0.8fr_1fr] lg:py-14">
        <div>
          <Link href="/" className="inline-block">
            <span className="sr-only">Piñata Monde, ir al inicio</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/logo-horizontal.svg"
              alt=""
              className="h-11 w-auto"
            />
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-6 text-ink-soft">
            Piñatas personalizadas hechas a mano. Convertimos tu idea en la pieza
            de la fiesta.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-navy">Navegación</p>
          <ul className="mt-4 space-y-2.5">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-ink-soft hover:text-magenta">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-navy">Contacto</p>
          <ul className="mt-4 space-y-2.5 text-sm text-ink-soft">
            <li>
              <a className="hover:text-magenta" href={`mailto:${CONTACT.email}`}>
                {CONTACT.email}
              </a>
            </li>
            <li>
              <a className="hover:text-magenta" href={CONTACT.phoneHref}>
                WhatsApp {CONTACT.phoneDisplay}
              </a>
            </li>
            <li>
              <Link href="/cotizar" className="font-medium text-magenta hover:underline">
                Solicitar cotización
              </Link>
            </li>
          </ul>
        </div>
      </Container>
      <div className="border-t border-navy-20">
        <Container className="py-5 text-center text-xs text-ink-soft sm:text-left">
          Piñata Monde · Zona Metropolitana de Guadalajara
        </Container>
      </div>
    </footer>
  );
}
