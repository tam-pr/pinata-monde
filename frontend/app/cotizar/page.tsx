import type { Metadata } from "next";
import { QuoteForm } from "@/components/QuoteForm";
import { Container } from "@/components/Container";

export const metadata: Metadata = {
  title: "Cotizar",
  description: "Solicita una cotización para tu piñata personalizada.",
};

export default async function CotizarPage({
  searchParams,
}: {
  searchParams: Promise<{ tema?: string }>;
}) {
  const params = await searchParams;
  const theme = params.tema?.trim() ?? "";

  return (
    <main className="py-12 sm:py-16">
      <Container className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-magenta">
          Personaliza
        </p>
        <h1 className="mt-3 text-3xl sm:text-4xl">Cotiza tu piñata</h1>
        <p className="mt-4 max-w-2xl text-ink-soft">
          Completa los bloques a tu ritmo. El precio y la complejidad se
          conectarán más adelante; por ahora guardamos la experiencia en tu
          navegador.
        </p>
        <div className="mt-10">
          <QuoteForm key={theme} initialTheme={theme} />
        </div>
      </Container>
    </main>
  );
}
