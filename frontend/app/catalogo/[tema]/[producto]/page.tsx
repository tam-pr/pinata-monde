import type { Metadata } from "next";

import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { getCatalogProduct } from "@/lib/catalog";

type Props = {
  params: Promise<{
    tema: string;
    producto: string;
  }>;
};

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { tema, producto } = await params;
  const result = getCatalogProduct(tema, producto);

  if (!result) {
    return {};
  }

  return {
    title: result.product.title,
    description: result.product.description,
  };
}

export default async function ProductoPage({ params }: Props) {
  const { tema, producto } = await params;
  const result = getCatalogProduct(tema, producto);

  if (!result) {
    notFound();
  }

  const { category, product } = result;

  const quoteHref = `/cotizar?tema=${encodeURIComponent(
    category.title
  )}&producto=${encodeURIComponent(product.title)}`;

  return (
    <main className="w-full max-w-full overflow-x-hidden py-12 sm:py-16 lg:py-20">
      <Container className="w-full min-w-0 max-w-5xl">
        <Link
          href={`/catalogo/${category.slug}`}
          className="inline-block max-w-full break-words text-sm font-medium text-magenta hover:underline"
        >
          ← Volver a {category.title}
        </Link>

        <div className="mt-6 grid w-full min-w-0 gap-8 lg:grid-cols-2 lg:gap-14">
          {/* Product image */}
          <div className="flex aspect-square min-w-0 w-full max-w-full items-center justify-center overflow-hidden rounded-[var(--radius-lg)] bg-paper p-5 sm:p-10">
            {product.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.image}
                alt={product.title}
                className="block h-full w-full max-w-full object-contain"
              />
            ) : (
              <div className="flex h-full w-full min-w-0 items-center justify-center overflow-hidden rounded-[var(--radius-md)] border border-dashed border-navy-70/60 bg-white px-4 text-center text-sm font-semibold uppercase tracking-[0.14em] text-navy-70">
                Imagen de producto pendiente
              </div>
            )}
          </div>

          {/* Product information */}
          <div className="flex min-w-0 w-full max-w-full flex-col justify-center">
            <p className="max-w-full break-words text-xs font-semibold uppercase tracking-[0.16em] text-magenta">
              {category.title} ·{" "}
              {product.image ? "diseño real" : "referencia de catálogo"}
            </p>

            <h1 className="mt-3 max-w-full break-words text-3xl sm:text-4xl">
              {product.title}
            </h1>

            <p className="mt-5 max-w-full break-words text-ink-soft">
              {product.description}
            </p>

            <dl className="mt-8 w-full min-w-0 max-w-full divide-y divide-navy-20 overflow-hidden rounded-[var(--radius-md)] border border-navy-20 bg-white px-5 text-sm">
              <div className="grid min-w-0 grid-cols-1 gap-1 py-4 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] sm:gap-4">
                <dt className="font-semibold text-navy">Tema</dt>
                <dd className="min-w-0 break-words text-ink-soft">
                  {category.title}
                </dd>
              </div>

              <div className="grid min-w-0 grid-cols-1 gap-1 py-4 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] sm:gap-4">
                <dt className="font-semibold text-navy">Tamaño</dt>
                <dd className="min-w-0 break-words text-ink-soft">
                  Por confirmar al cotizar
                </dd>
              </div>

              <div className="grid min-w-0 grid-cols-1 gap-1 py-4 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] sm:gap-4">
                <dt className="font-semibold text-navy">Detalles</dt>
                <dd className="min-w-0 break-words text-ink-soft">
                  Información oficial pendiente
                </dd>
              </div>
            </dl>

            <div className="mt-8 w-full max-w-full">
              <Button href={quoteHref} size="lg">
                Cotizar esta piñata
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}