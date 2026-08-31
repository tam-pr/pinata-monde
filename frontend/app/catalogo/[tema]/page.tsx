import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CatalogProductCard } from "@/components/CatalogProductCard";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { CATALOG_CATEGORIES, getCatalogCategory } from "@/lib/catalog";

type Props = { params: Promise<{ tema: string }> };

export function generateStaticParams() {
  return CATALOG_CATEGORIES.map(({ slug }) => ({ tema: slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tema } = await params;
  const category = getCatalogCategory(tema);
  return category ? { title: category.title, description: `Referencias de productos del tema ${category.title}.` } : {};
}

export default async function TemaPage({ params }: Props) {
  const { tema } = await params;
  const category = getCatalogCategory(tema);
  if (!category) notFound();

  return (
    <main className="py-12 sm:py-16 lg:py-20">
      <Container>
        <Link href="/catalogo" className="text-sm font-medium text-magenta hover:underline">← Volver al catálogo</Link>
        <div className="mt-6"><SectionHeading as="h1" eyebrow="Tema" title={category.title} description={`${category.description} Estas fichas son referencias de catálogo y no confirman disponibilidad, precio ni especificaciones.`} /></div>
        <ul className="mt-9 grid gap-5 sm:mt-10 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {category.products.map((product, index) => <li key={product.slug}><CatalogProductCard category={category} product={product} index={index} /></li>)}
        </ul>
      </Container>
    </main>
  );
}
