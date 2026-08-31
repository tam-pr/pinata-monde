import type { Metadata } from "next";
import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { ProductCard } from "@/components/ProductCard";
import { SectionHeading } from "@/components/SectionHeading";
import { PINATA_THEMES } from "@/lib/themes";

export const metadata: Metadata = {
  title: "Catálogo",
  description: "Temas de piñatas personalizadas para cotizar con Piñata Monde.",
};

export default function CatalogoPage() {
  return (
    <main className="py-12 sm:py-16">
      <Container>
        <SectionHeading
          as="h1"
          eyebrow="Catálogo"
          title="Elige un punto de partida"
          description="Estas categorías ayudan a imaginar la pieza. Al pedir una idea, abrimos la cotización con ese tema listo para afinar."
        />
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PINATA_THEMES.map((theme, index) => (
            <li key={theme.slug}>
              <ProductCard theme={theme} index={index} />
            </li>
          ))}
        </ul>
        <div className="mt-12 rounded-[var(--radius-lg)] border border-navy-20 bg-white p-8 text-center sm:p-10">
          <h2 className="text-2xl">¿No ves tu personaje?</h2>
          <p className="mx-auto mt-3 max-w-lg text-ink-soft">
            Trae otra referencia. Cotizamos diseños que no están en esta lista.
          </p>
          <div className="mt-6 flex justify-center">
            <Button href="/cotizar">Cotizar un diseño propio</Button>
          </div>
        </div>
      </Container>
    </main>
  );
}
