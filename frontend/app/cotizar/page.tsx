import type { Metadata } from "next";
import Link from "next/link";
import { QuoteForm } from "@/components/QuoteForm";
import { Container } from "@/components/Container";

export const metadata: Metadata = {
  title: "Cotizar",
  description: "Solicita una cotización para tu piñata personalizada.",
};

export default async function CotizarPage({
  searchParams,
}: {
  searchParams: Promise<{ tema?: string; producto?: string }>;
}) {
  const params = await searchParams;
  const theme = params.tema?.trim() ?? "";
  const product = params.producto?.trim() ?? "";
  const selection = [theme, product].filter(Boolean).join(" · ");

  return (
    <main className="py-12 sm:py-16">
      <Container className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-magenta">
          Personaliza
        </p>
        <h1 className="mt-3 text-3xl sm:text-4xl">Cotiza tu piñata</h1>
        <p className="mt-4 max-w-2xl text-ink-soft">
          Completa los bloques a tu ritmo. Al enviarla, registraremos tu solicitud
          y calcularemos una estimación inicial para que el equipo afine los detalles.
        </p>
        <p className="mt-5 rounded-[var(--radius-md)] border border-navy-20 bg-white p-4 text-sm text-ink-soft">
          ¿Buscas inspiración? <Link href="/catalogo" className="font-semibold text-magenta hover:underline">Explora el catálogo</Link> antes de enviar tu solicitud.
        </p>
        <div className="mt-10">
          <QuoteForm key={selection} initialTheme={selection} />
        </div>
      </Container>
    </main>
  );
}
