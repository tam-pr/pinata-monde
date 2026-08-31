import { Button } from "@/components/Button";
import { cn } from "@/lib/cn";
import type { PINATA_THEMES } from "@/lib/themes";

type Theme = (typeof PINATA_THEMES)[number];

const ACCENTS = [
  "bg-magenta-20",
  "bg-navy-20",
  "bg-[#f9c8d3]",
  "bg-[#e8e5f2]",
] as const;

export function ProductCard({
  theme,
  index = 0,
}: {
  theme: Theme;
  index?: number;
}) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-navy-20 bg-white">
      <div
        className={cn(
          "relative flex h-40 items-center justify-center sm:h-44",
          ACCENTS[index % ACCENTS.length],
        )}
        aria-hidden
      >
        <span className="h-16 w-16 rounded-full border-4 border-navy/20 bg-white/70" />
        <span className="absolute bottom-6 right-8 h-10 w-10 rotate-12 rounded-sm border-4 border-magenta/30 bg-white/80" />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
        <h3 className="text-xl font-semibold">{theme.title}</h3>
        <p className="flex-1 text-sm text-ink-soft">{theme.description}</p>
        <Button href={`/cotizar?tema=${encodeURIComponent(theme.title)}`} variant="secondary" className="w-full">
          Pedir esta idea
        </Button>
      </div>
    </article>
  );
}
