import { QuoteForm } from "@/components/QuoteForm";

export default function CotizarPage() {
  return (
    <main className="mx-auto max-w-xl px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Cotizar</h1>
      <p className="mt-2 text-muted">
        Comparte los datos de tu piñata. El estimado de complejidad y precio se
        conectará en una fase posterior.
      </p>
      <div className="mt-8">
        <QuoteForm />
      </div>
    </main>
  );
}
