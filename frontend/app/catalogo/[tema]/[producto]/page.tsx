import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { getCatalogProduct } from "@/lib/catalog";

type Props = { params: Promise<{ tema: string; producto: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tema, producto } = await params;
  const result = getCatalogProduct(tema, producto);
  return result ? { title: result.product.title, description: result.product.description } : {};
}

export default async function ProductoPage({ params }: Props) {
  const { tema, producto } = await params;
  const result = getCatalogProduct(tema, producto);
  if (!result) notFound();

  const { category, product } = result;
  const quoteHref = `/cotizar?tema=${encodeURIComponent(category.title)}&producto=${encodeURIComponent(product.title)}`;

  return (
    <main className="py-12 sm:py-16 lg:py-20">
      <Container className="max-w-5xl">
        <Link href={`/catalogo/${category.slug}`} className="text-sm font-medium text-magenta hover:underline">← Volver a {category.title}</Link>
        <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-14">
          <div className="flex aspect-square items-center justify-center rounded-[var(--radius-lg)] bg-paper p-8 sm:p-10">
            {product.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.image} alt={product.title} className="h-full w-full object-contain" />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-[var(--radius-md)] border border-dashed border-navy-70/60 bg-white px-6 text-center text-sm font-semibold uppercase tracking-[0.14em] text-navy-70">Imagen de producto pendiente</div>
            )}
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-magenta">{category.title} · {product.image ? "diseño real" : "referencia de catálogo"}</p>
            <h1 className="mt-3 text-3xl sm:text-4xl">{product.title}</h1>
            <p className="mt-5 text-ink-soft">{product.description}</p>
            <dl className="mt-8 divide-y divide-navy-20 rounded-[var(--radius-md)] border border-navy-20 bg-white px-5 text-sm">
              <div className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-4 py-4"><dt className="font-semibold text-navy">Tema</dt><dd className="text-ink-soft">{category.title}</dd></div>
              <div className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-4 py-4"><dt className="font-semibold text-navy">Tamaño</dt><dd className="text-ink-soft">Por confirmar al cotizar</dd></div>
              <div className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-4 py-4"><dt className="font-semibold text-navy">Detalles</dt><dd className="text-ink-soft">Información oficial pendiente</dd></div>
            </dl>
            <div className="mt-8"><Button href={quoteHref} size="lg">Cotizar esta piñata</Button></div>
          </div>
        </div>
      </Container>
    </main>
  );
}
