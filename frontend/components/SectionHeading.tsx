import { cn } from "@/lib/cn";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  as: Heading = "h2",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  as?: "h1" | "h2";
}) {
  return (
    <div className={cn(align === "center" && "mx-auto max-w-2xl text-center")}>
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-magenta">
          {eyebrow}
        </p>
      ) : null}
      <Heading className={cn("text-3xl sm:text-4xl", eyebrow && "mt-3")}>{title}</Heading>
      {description ? (
        <p className="mt-4 max-w-2xl text-base text-ink-soft sm:text-lg">{description}</p>
      ) : null}
    </div>
  );
}
