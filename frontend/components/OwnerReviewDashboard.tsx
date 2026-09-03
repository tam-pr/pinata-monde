"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/Button";
import {
  archiveQuote, deleteQuote, getPriceBreakdown, getReviewQuotes, purgeQuote, restoreQuote, reviewQuote, uploadUrl,
  type PriceBreakdown, type ReviewQuote,
} from "@/lib/api";

const money = (cents: number, currency = "MXN") => new Intl.NumberFormat("es-MX", { style: "currency", currency }).format(cents / 100);
const dateTime = (iso: string) => new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));

export type QuoteDashboardView = "pending_review" | "approved" | "archived" | "trash";

const EMPTY_MESSAGE: Record<QuoteDashboardView, string> = {
  pending_review: "No hay cotizaciones por aprobar.",
  approved: "No hay cotizaciones aprobadas todavía.",
  archived: "No hay cotizaciones archivadas.",
  trash: "La papelera está vacía.",
};

function quoteStatusLabel(quote: ReviewQuote): string {
  if (quote.deleted_at) return "En papelera";
  if (quote.archived_at) return "Archivada";
  return quote.status === "approved" ? "Aprobada" : "Pendiente de revisión";
}

export function OwnerReviewDashboard({ view }: { view: QuoteDashboardView }) {
  const [quotes, setQuotes] = useState<ReviewQuote[]>([]);
  const [selected, setSelected] = useState<ReviewQuote | null>(null);
  const [breakdown, setBreakdown] = useState<PriceBreakdown | null>(null);
  const [score, setScore] = useState("3");
  const [price, setPrice] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [actionPending, setActionPending] = useState(false);

  const isActiveView = view === "pending_review" || view === "approved";
  const readOnly = !isActiveView || selected?.status === "approved";

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const apiView = isActiveView ? "active" : view;
    getReviewQuotes({ view: apiView, q: debouncedSearch || undefined }).then((items) => {
      setQuotes(items);
      const filtered = isActiveView ? items.filter((item) => item.status === view) : items;
      setSelected((prev) => (prev && filtered.some((item) => item.id === prev.id) ? prev : filtered[0] ?? null));
    }).catch((e: Error) => setError(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, debouncedSearch]);

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

  async function runAction(action: (id: string) => Promise<ReviewQuote>) {
    if (!selected) return;
    setActionPending(true); setError(null);
    try {
      const updated = await action(selected.id);
      // The quote no longer belongs in this view (e.g. archived, restored) —
      // drop it and select whatever is next, rather than showing "no quotes"
      // when others remain.
      setQuotes((items) => {
        const remaining = items.filter((item) => item.id !== updated.id);
        setSelected(remaining[0] ?? null);
        return remaining;
      });
    } catch (e) { setError(e instanceof Error ? e.message : "No pudimos completar la acción."); }
    finally { setActionPending(false); }
  }

  function confirmDelete() {
    if (!selected) return;
    const ok = window.confirm(
      "¿Eliminar cotización?\n\nLa cotización se moverá a la papelera y podrá restaurarse durante 3 días. Después de ese plazo se eliminará permanentemente.",
    );
    if (ok) runAction(deleteQuote);
  }

  async function confirmPurge() {
    if (!selected) return;
    const ok = window.confirm(
      "¿Eliminar cotización permanentemente?\n\nEsta acción no se puede deshacer: la información del cliente y de la cotización se perderá para siempre.",
    );
    if (!ok) return;
    setActionPending(true); setError(null);
    try {
      await purgeQuote(selected.id);
      setQuotes((items) => {
        const remaining = items.filter((item) => item.id !== selected.id);
        setSelected(remaining[0] ?? null);
        return remaining;
      });
    } catch (e) { setError(e instanceof Error ? e.message : "No pudimos eliminar la cotización."); }
    finally { setActionPending(false); }
  }

  const fieldClass = "w-full rounded-[var(--radius-sm)] border border-navy-20 p-3 text-sm";

  const searchBox = (
    <input
      type="search"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Buscar por nombre, correo, teléfono, folio o diseño…"
      className={`${fieldClass} bg-white`}
      aria-label="Buscar cotizaciones"
    />
  );

  if (error && !selected && quotes.length === 0) {
    return <div className="space-y-4">{searchBox}<p className="text-magenta">{error}</p></div>;
  }
  if (!selected) {
    return <div className="space-y-4">{searchBox}<p className="text-ink-soft">{EMPTY_MESSAGE[view]}</p></div>;
  }
  const effectiveSuggested = breakdown?.suggested_price_cents ?? selected.estimated_price_cents;
  // Keep the just-acted-on quote visible in its own sidebar even if it no
  // longer matches this tab's filter (e.g. right after approving it) — it
  // will drop out on the next visit to this tab.
  const sidebarQuotes = quotes.some((quote) => quote.id === selected.id) ? quotes : [selected, ...quotes];

  return <div className="space-y-4">
    {searchBox}
    <div className="grid gap-8 lg:grid-cols-[18rem_1fr]">
    <aside className="rounded-[var(--radius-lg)] border border-navy-20 bg-white p-4">
      <p className="px-2 text-sm font-semibold text-navy">Cotizaciones</p>
      <ul className="mt-3 max-h-[65vh] space-y-1 overflow-y-auto">{sidebarQuotes.map((quote) => <li key={quote.id}><button onClick={() => setSelected(quote)} className={`w-full rounded-[var(--radius-sm)] px-3 py-3 text-left text-sm ${selected.id === quote.id ? "bg-magenta-20 text-navy" : "hover:bg-paper"}`}><span className="block font-medium">{quote.customer_name}</span><span className="text-xs text-ink-soft">{quoteStatusLabel(quote)}</span></button></li>)}</ul>
    </aside>
    <section className="space-y-6">
      <div className="rounded-[var(--radius-lg)] border border-magenta bg-magenta-20 p-5"><p className="font-semibold text-navy">Estimación automática — requiere revisión.</p><p className="mt-1 text-sm text-ink-soft">La IA sugiere complejidad y el sistema calcula un precio; tú decides el resultado final.</p></div>
      <div className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-[var(--radius-lg)] border border-navy-20 bg-white p-6"><h2 className="text-xl">Cliente y solicitud</h2><dl className="mt-5 space-y-3 text-sm"><div><dt className="text-ink-soft">Cliente</dt><dd>{selected.customer_name}</dd></div><div><dt className="text-ink-soft">Contacto</dt><dd>{selected.phone} · {selected.email}</dd></div><div><dt className="text-ink-soft">Pedido</dt><dd>{selected.theme || "Sin tema"} · {selected.size} · {selected.quantity} pieza(s) · {selected.needs_stick ? "con palo" : "sin palo"}</dd></div><div><dt className="text-ink-soft">Entrega</dt><dd>{selected.deadline} · {selected.delivery_method === "shipping" ? "Envío" : "Recoger"}</dd></div><div><dt className="text-ink-soft">Descripción</dt><dd>{selected.description}</dd></div>{selected.deleted_at ? <><div><dt className="text-ink-soft">Fecha de eliminación</dt><dd>{dateTime(selected.deleted_at)}</dd></div><div><dt className="text-ink-soft">Recuperable hasta</dt><dd>{selected.deleted_until ? dateTime(selected.deleted_until) : "—"}</dd></div></> : null}{selected.archived_at && !selected.deleted_at ? <div><dt className="text-ink-soft">Archivada el</dt><dd>{dateTime(selected.archived_at)}</dd></div> : null}</dl></article>
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
      <article className="rounded-[var(--radius-lg)] border border-navy-20 bg-white p-6">
        <h2 className="text-xl">Decisión del propietario</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-medium">Complejidad final<select value={score} disabled={readOnly} onChange={(e) => setScore(e.target.value)} className="mt-2 w-full rounded-[var(--radius-sm)] border border-navy-20 p-3">{[1,2,3,4,5].map((value) => <option key={value} value={value}>{value} / 5</option>)}</select></label>
          <label className="text-sm font-medium">Precio final (MXN)<input type="number" min="0" step="0.01" value={price} disabled={readOnly} onChange={(e) => setPrice(e.target.value)} className="mt-2 w-full rounded-[var(--radius-sm)] border border-navy-20 p-3" /></label>
        </div>
        {error ? <p className="mt-4 text-sm text-magenta">{error}</p> : null}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          {isActiveView ? (
            selected.status === "approved"
              ? <p className="text-sm font-medium text-navy">Aprobada · Odoo: {selected.odoo_lead_id ?? "pendiente"}</p>
              : <Button onClick={save} disabled={saving || actionPending}>{saving ? "Guardando…" : "Aprobar y enviar a Odoo"}</Button>
          ) : null}
          {view === "trash" ? (
            <>
              <Button type="button" variant="secondary" onClick={() => runAction(restoreQuote)} disabled={actionPending}>Restaurar</Button>
              <Button type="button" variant="secondary" onClick={confirmPurge} disabled={actionPending}>Eliminar permanentemente</Button>
            </>
          ) : view === "archived" ? (
            <>
              <Button type="button" variant="secondary" onClick={() => runAction(restoreQuote)} disabled={actionPending}>Restaurar</Button>
              <Button type="button" variant="secondary" onClick={confirmDelete} disabled={actionPending}>Eliminar</Button>
            </>
          ) : (
            <>
              <Button type="button" variant="secondary" onClick={() => runAction(archiveQuote)} disabled={actionPending}>Archivar</Button>
              <Button type="button" variant="secondary" onClick={confirmDelete} disabled={actionPending}>Eliminar</Button>
            </>
          )}
        </div>
      </article>
    </section>
    </div>
  </div>;
}
