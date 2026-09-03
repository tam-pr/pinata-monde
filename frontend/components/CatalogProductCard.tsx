import Link from "next/link";
import { cn } from "@/lib/cn";
import type { CatalogCategory, CatalogProduct } from "@/lib/catalog";

const ACCENTS = ["bg-paper", "bg-magenta-20", "bg-navy-20"] as const;

export function CatalogProductCard({ category, product, index }: { category: CatalogCategory; product: CatalogProduct; index: number }) {
  return (
    <Link href={`/catalogo/${category.slug}/${product.slug}`} className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-navy-20 bg-white transition-colors hover:border-magenta focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-magenta focus-visible:ring-offset-4">
      <div className={cn("flex aspect-[4/3] items-center justify-center p-6", !product.image && ACCENTS[index % ACCENTS.length])} aria-hidden>
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.image} alt="" className="h-full w-full object-contain" />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-[var(--radius-md)] border border-dashed border-navy-70/60 bg-white/70 px-4 text-center text-xs font-semibold uppercase tracking-[0.14em] text-navy-70">Imagen de referencia</div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-magenta">{product.image ? "Diseño real" : "Marcador de posición"}</p>
        <h2 className="mt-3 text-xl group-hover:text-magenta">{product.title}</h2>
        <p className="mt-3 flex-1 text-sm leading-6 text-ink-soft">{product.description}</p>
        <span className="mt-5 text-sm font-semibold text-magenta">Ver detalles <span aria-hidden>→</span></span>
      </div>
    </Link>
  );
}
