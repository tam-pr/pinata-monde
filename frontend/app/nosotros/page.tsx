import type { Metadata } from "next";
import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";

export const metadata: Metadata = {
  title: "Nosotros",
  description: "Taller de piñatas personalizadas en la Zona Metropolitana de Guadalajara.",
};

export default function NosotrosPage() {
  return (
    <main className="py-12 sm:py-16">
      <Container className="max-w-3xl">
        <SectionHeading
          as="h1"
          eyebrow="Nosotros"
          title="Un taller para el día que más importa"
        />
        <div className="mt-8 space-y-5 text-ink-soft">
          <p>
            Piñata Monde nace para que las familias no tengan que conformarse con
            lo que hay en anaquel. Recibimos la idea —un personaje, un color, un
            recuerdo— y la pasamos a una piñata hecha a mano.
          </p>
          <p>
            Trabajamos desde la Zona Metropolitana de Guadalajara, con un taller
            donde se arma, se decora y se cuida cada pedido. El diálogo con
            quien celebra es parte del oficio: tamaño, fecha y detalles se
            acuerdan antes de producir.
          </p>
          <p>
            Esta página es la cara digital de ese proceso: un lugar claro para
            cotizar y para que tu referencia llegue ordenada al equipo.
          </p>
        </div>
        <div className="mt-10 overflow-hidden rounded-[var(--radius-lg)] border border-navy-20 bg-white p-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/logo-normal.svg"
            alt="Imagotipo vertical de Piñata Monde"
            className="mx-auto h-auto w-full max-w-[220px]"
          />
        </div>
        <div className="mt-10">
          <Button href="/cotizar">Cotizar con nosotros</Button>
        </div>
      </Container>
    </main>
  );
}
