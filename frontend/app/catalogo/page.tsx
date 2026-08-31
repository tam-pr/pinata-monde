import type { Metadata } from "next";
import { Button } from "@/components/Button";
import { CatalogCategoryCard } from "@/components/CatalogCategoryCard";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { CATALOG_CATEGORIES } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Catálogo",
  description: "Explora temas e ideas de piñatas personalizadas de Piñata Monde.",
};

export default function CatalogoPage() {
  return (
    <main className="py-12 sm:py-16 lg:py-20">
      <Container>
        <SectionHeading as="h1" eyebrow="Catálogo" title="Explora nuestras piñatas por tema" description="Elige una categoría para ver referencias de producto. Las imágenes y diseños marcados como referencia son contenido de muestra hasta contar con el catálogo oficial." />
        <ul className="mt-9 grid gap-5 sm:mt-10 sm:grid-cols-2 sm:gap-6 lg:grid-cols-5">
          {CATALOG_CATEGORIES.map((category, index) => <li key={category.slug}><CatalogCategoryCard category={category} index={index} /></li>)}
        </ul>
        <div className="mt-12 rounded-[var(--radius-lg)] border border-navy-20 bg-white p-6 text-center sm:p-10">
          <h2 className="text-2xl">¿Tienes otra idea?</h2>
          <p className="mx-auto mt-3 max-w-lg text-ink-soft">El catálogo también es inspiración. Puedes traer una referencia distinta y la afinamos contigo.</p>
          <div className="mt-6 flex justify-center"><Button href="/cotizar">Cotizar un diseño propio</Button></div>
        </div>
      </Container>
    </main>
  );
}
