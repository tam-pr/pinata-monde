"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { getPriceBreakdown, getReviewQuotes, reviewQuote, uploadUrl, type PriceBreakdown, type ReviewQuote } from "@/lib/api";

const money = (cents: number, currency = "MXN") => new Intl.NumberFormat("es-MX", { style: "currency", currency }).format(cents / 100);

export function OwnerReviewDashboard({ statusFilter }: { statusFilter: "pending_review" | "approved" }) {
  const [quotes, setQuotes] = useState<ReviewQuote[]>([]);
  const [selected, setSelected] = useState<ReviewQuote | null>(null);
  const [breakdown, setBreakdown] = useState<PriceBreakdown | null>(null);
  const [score, setScore] = useState("3");
  const [price, setPrice] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const filteredQuotes = quotes.filter((quote) => quote.status === statusFilter);

  useEffect(() => {
    getReviewQuotes().then((items) => {
      setQuotes(items);
      const filtered = items.filter((item) => item.status === statusFilter);
      setSelected((prev) => prev ?? filtered[0] ?? null);
    }).catch((e: Error) => setError(e.message));
  }, [statusFilter]);
  useEffect(() => {
    if (!selected) return;
    setScore(String(selected.owner_complexity_score ?? selected.complexity_score));
    setPrice(String((selected.final_price_cents ?? selected.estimated_price_cents) / 100));
  }, [selected]);

  useEffect(() => {
    if (!selected || !score) return;
    getPriceBreakdown(selected.id, Number(score)).then((data) => {
      setBreakdown(data);
      // Owner-selected complexity has priority over the AI suggestion, so the
      // final price recalculates automatically as soon as it changes — until
      // approval, after which the saved final price is authoritative.
      if (selected.status !== "approved") setPrice(String(data.suggested_price_cents / 100));
    }).catch((e: Error) => setError(e.message));
  }, [selected, score]);

  async function save() {
    if (!selected) return;
    setSaving(true); setError(null);
    try {
      const reviewed = await reviewQuote(selected.id, {
        owner_complexity_score: Number(score), final_price_cents: Math.round(Number(price) * 100),
      });
      setQuotes((items) => items.map((item) => item.id === reviewed.id ? reviewed : item));
      setSelected(reviewed);
    } catch (e) { setError(e instanceof Error ? e.message : "No pudimos guardar la revisión."); }
    finally { setSaving(false); }
  }

  if (error && !selected) return <p className="text-magenta">{error}</p>;
  if (!selected) {
    return (
      <p className="text-ink-soft">
        {statusFilter === "approved"
          ? "No hay cotizaciones aprobadas todavía."
          : "No hay cotizaciones por aprobar."}
      </p>
    );
  }
  const effectiveSuggested = breakdown?.suggested_price_cents ?? selected.estimated_price_cents;
  // Keep the just-acted-on quote visible in its own sidebar even if it no
  // longer matches this tab's filter (e.g. right after approving it) — it
  // will drop out on the next visit to this tab.
  const sidebarQuotes = filteredQuotes.some((quote) => quote.id === selected.id) ? filteredQuotes : [selected, ...filteredQuotes];

  return <div className="grid gap-8 lg:grid-cols-[18rem_1fr]">
    <aside className="rounded-[var(--radius-lg)] border border-navy-20 bg-white p-4">
      <p className="px-2 text-sm font-semibold text-navy">Cotizaciones</p>
      <ul className="mt-3 max-h-[65vh] space-y-1 overflow-y-auto">{sidebarQuotes.map((quote) => <li key={quote.id}><button onClick={() => setSelected(quote)} className={`w-full rounded-[var(--radius-sm)] px-3 py-3 text-left text-sm ${selected.id === quote.id ? "bg-magenta-20 text-navy" : "hover:bg-paper"}`}><span className="block font-medium">{quote.customer_name}</span><span className="text-xs text-ink-soft">{quote.status === "approved" ? "Aprobada" : "Pendiente de revisión"}</span></button></li>)}</ul>
    </aside>
    <section className="space-y-6">
      <div className="rounded-[var(--radius-lg)] border border-magenta bg-magenta-20 p-5"><p className="font-semibold text-navy">Estimación automática — requiere revisión.</p><p className="mt-1 text-sm text-ink-soft">La IA sugiere complejidad y el sistema calcula un precio; tú decides el resultado final.</p></div>
      <div className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-[var(--radius-lg)] border border-navy-20 bg-white p-6"><h2 className="text-xl">Cliente y solicitud</h2><dl className="mt-5 space-y-3 text-sm"><div><dt className="text-ink-soft">Cliente</dt><dd>{selected.customer_name}</dd></div><div><dt className="text-ink-soft">Contacto</dt><dd>{selected.phone} · {selected.email}</dd></div><div><dt className="text-ink-soft">Pedido</dt><dd>{selected.theme || "Sin tema"} · {selected.size} · {selected.quantity} pieza(s) · {selected.needs_stick ? "con palo" : "sin palo"}</dd></div><div><dt className="text-ink-soft">Entrega</dt><dd>{selected.deadline} · {selected.delivery_method === "shipping" ? "Envío" : "Recoger"}</dd></div><div><dt className="text-ink-soft">Descripción</dt><dd>{selected.description}</dd></div></dl></article>
        <article className="rounded-[var(--radius-lg)] border border-navy-20 bg-white p-6"><h2 className="text-xl">Referencia</h2>{selected.images.length ? <div className="mt-5 grid grid-cols-3 gap-3">{selected.images.map((image) => (
          // External API upload URLs are dynamic; a plain image avoids requiring a remote-image allowlist.
          // eslint-disable-next-line @next/next/no-img-element
          <img key={image.id} src={uploadUrl(image.path)} alt={image.filename} className="aspect-square rounded-[var(--radius-sm)] object-cover" />
        ))}</div> : <p className="mt-5 text-sm text-ink-soft">No se adjuntó imagen; se usó el respaldo de complejidad media.</p>}</article>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-[var(--radius-lg)] border border-navy-20 bg-white p-6"><h2 className="text-xl">Sugerencia de IA</h2><p className="mt-5 text-2xl font-semibold">Complejidad estimada: {selected.complexity_score}/5</p><p className="mt-2 text-sm text-ink-soft">Confianza: {Math.round(selected.ai_confidence * 100)}% · {selected.ai_model_version}</p><p className="mt-4 text-sm text-ink-soft">Razón: {selected.ai_reason}</p></article>
        <article className="rounded-[var(--radius-lg)] border border-navy-20 bg-white p-6"><h2 className="text-xl">Cálculo sugerido</h2><dl className="mt-5 space-y-2 text-sm"><div className="flex justify-between"><dt>Precio base</dt><dd>{breakdown ? money(breakdown.base_price_cents) : "—"}</dd></div><div className="flex justify-between"><dt>Complejidad final</dt><dd>× {breakdown?.complexity_multiplier ?? "—"}</dd></div><div className="flex justify-between"><dt>Cantidad</dt><dd>× {breakdown?.quantity ?? selected.quantity}</dd></div><div className="flex justify-between"><dt>Palo de piñata</dt><dd>{breakdown ? money(breakdown.stick_cents) : "—"}</dd></div><div className="flex justify-between"><dt>Envío</dt><dd>{breakdown ? money(breakdown.shipping_cents) : "—"}</dd></div><div className="flex justify-between"><dt>Exprés (≤5 días){breakdown?.is_express ? " · detectado" : ""}</dt><dd>{breakdown ? money(breakdown.express_fee_cents) : "—"}</dd></div><div className="mt-3 flex justify-between border-t border-navy-20 pt-3 font-semibold"><dt>Precio sugerido con complejidad final</dt><dd>{money(effectiveSuggested)}</dd></div></dl></article>
      </div>
      <article className="rounded-[var(--radius-lg)] border border-navy-20 bg-white p-6"><h2 className="text-xl">Decisión del propietario</h2><div className="mt-5 grid gap-5 sm:grid-cols-2"><label className="text-sm font-medium">Complejidad final<select value={score} disabled={selected.status === "approved"} onChange={(e) => setScore(e.target.value)} className="mt-2 w-full rounded-[var(--radius-sm)] border border-navy-20 p-3">{[1,2,3,4,5].map((value) => <option key={value} value={value}>{value} / 5</option>)}</select></label><label className="text-sm font-medium">Precio final (MXN)<input type="number" min="0" step="0.01" value={price} disabled={selected.status === "approved"} onChange={(e) => setPrice(e.target.value)} className="mt-2 w-full rounded-[var(--radius-sm)] border border-navy-20 p-3" /></label></div>{error ? <p className="mt-4 text-sm text-magenta">{error}</p> : null}<div className="mt-6">{selected.status === "approved" ? <p className="text-sm font-medium text-navy">Aprobada · Odoo: {selected.odoo_lead_id ?? "pendiente"}</p> : <Button onClick={save} disabled={saving}>{saving ? "Guardando…" : "Aprobar y enviar a Odoo"}</Button>}</div></article>
    </section>
  </div>;
}
