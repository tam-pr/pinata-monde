import Link from "next/link";
import { cn } from "@/lib/cn";
import type { CatalogCategory } from "@/lib/catalog";

const ACCENTS = ["bg-magenta-20", "bg-navy-20", "bg-[#f9c8d3]", "bg-[#e8e5f2]", "bg-paper"] as const;

export function CatalogCategoryCard({ category, index }: { category: CatalogCategory; index: number }) {
  return (
    <Link href={`/catalogo/${category.slug}`} className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-navy-20 bg-white transition-colors hover:border-magenta focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-magenta focus-visible:ring-offset-4">
      <div className={cn("relative flex h-40 items-center justify-center sm:h-44", ACCENTS[index % ACCENTS.length])} aria-hidden>
        <span className="h-16 w-16 rounded-full border-4 border-navy/20 bg-white/70" />
        <span className="absolute bottom-6 right-8 h-10 w-10 rotate-12 rounded-sm border-4 border-magenta/30 bg-white/80" />
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h2 className="text-xl group-hover:text-magenta">{category.title}</h2>
        <p className="mt-3 flex-1 text-sm leading-6 text-ink-soft">{category.description}</p>
        <span className="mt-5 text-sm font-semibold text-magenta">Explorar tema <span aria-hidden>→</span></span>
      </div>
    </Link>
  );
}
