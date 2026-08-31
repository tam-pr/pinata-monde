import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { CONTACT } from "@/lib/nav";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Habla con Piñata Monde para cotizar o resolver dudas.",
};

export default function ContactoPage() {
  return (
    <main className="py-12 sm:py-16">
      <Container className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <SectionHeading
            as="h1"
            eyebrow="Contacto"
            title="Estamos para tu fiesta"
            description="Usa el formulario, el correo o el teléfono. Para un pedido, la vía más directa es la cotización."
          />
          <ul className="mt-8 space-y-3 text-ink-soft">
            <li>
              Correo:{" "}
              <a className="font-medium text-magenta hover:underline" href={`mailto:${CONTACT.email}`}>
                {CONTACT.email}
              </a>
            </li>
            <li>
              Teléfono / WhatsApp:{" "}
              <a className="font-medium text-magenta hover:underline" href={CONTACT.phoneHref}>
                {CONTACT.phoneDisplay}
              </a>
            </li>
          </ul>
          <div className="mt-8">
            <Button href="/cotizar">Ir a cotizar</Button>
          </div>
        </div>
        <div className="rounded-[var(--radius-lg)] border border-navy-20 bg-white p-6 sm:p-8">
          <h2 className="text-xl">Escríbenos</h2>
          <p className="mt-2 text-sm text-ink-soft">
            El envío es local por ahora; no se dispara un correo automático.
          </p>
          <div className="mt-6">
            <ContactForm />
          </div>
        </div>
      </Container>
    </main>
  );
}
