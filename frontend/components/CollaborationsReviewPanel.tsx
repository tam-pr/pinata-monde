"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/Button";
import {
  approveCollaborationProposal,
  listCollaborationProposals,
  type CollaborationProposal,
  type CollaborationStatus,
} from "@/lib/collaborations";

const COLLABORATION_TYPE_LABELS: Record<string, string> = {
  marca: "Marca o producto",
  "hotel-espacio": "Hotel o espacio",
  evento: "Evento o activación",
  medios: "Medios o creadores de contenido",
  "causa-social": "Organización o causa social",
  otro: "Otro",
};

export function CollaborationsReviewPanel({ statusFilter }: { statusFilter: CollaborationStatus }) {
  const [all, setAll] = useState<CollaborationProposal[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    setAll(listCollaborationProposals());
  }, []);

  const items = all.filter((item) => item.status === statusFilter);
  const selected = items.find((item) => item.id === selectedId) ?? items[0] ?? null;

  function approve() {
    if (!selected) return;
    setApproving(true);
    approveCollaborationProposal(selected.id);
    setAll(listCollaborationProposals());
    setApproving(false);
  }

  if (!selected) {
    return (
      <p className="text-ink-soft">
        {statusFilter === "approved"
          ? "No hay colaboraciones aprobadas todavía."
          : "No hay propuestas de colaboración por aprobar."}
      </p>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[18rem_1fr]">
      <aside className="rounded-[var(--radius-lg)] border border-navy-20 bg-white p-4">
        <p className="px-2 text-sm font-semibold text-navy">Colaboraciones</p>
        <ul className="mt-3 max-h-[65vh] space-y-1 overflow-y-auto">
          {items.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setSelectedId(item.id)}
                className={`w-full rounded-[var(--radius-sm)] px-3 py-3 text-left text-sm ${selected.id === item.id ? "bg-magenta-20 text-navy" : "hover:bg-paper"}`}
              >
                <span className="block font-medium">{item.company}</span>
                <span className="text-xs text-ink-soft">{item.status === "approved" ? "Aprobada" : "Pendiente de revisión"}</span>
              </button>
            </li>
          ))}
        </ul>
      </aside>
      <section className="space-y-6">
        <article className="rounded-[var(--radius-lg)] border border-navy-20 bg-white p-6">
          <h2 className="text-xl">Contacto y propuesta</h2>
          <dl className="mt-5 space-y-3 text-sm">
            <div><dt className="text-ink-soft">Empresa/marca</dt><dd>{selected.company}</dd></div>
            <div><dt className="text-ink-soft">Contacto</dt><dd>{selected.name} · {selected.phone} · {selected.email}</dd></div>
            <div><dt className="text-ink-soft">Tipo de colaboración</dt><dd>{COLLABORATION_TYPE_LABELS[selected.collaborationType] ?? selected.collaborationType}</dd></div>
            <div><dt className="text-ink-soft">Propuesta</dt><dd>{selected.proposal}</dd></div>
            {selected.website ? <div><dt className="text-ink-soft">Redes/sitio web</dt><dd>{selected.website}</dd></div> : null}
            {selected.fileName ? <div><dt className="text-ink-soft">Archivo/referencia</dt><dd>{selected.fileName}</dd></div> : null}
          </dl>
        </article>
        <article className="rounded-[var(--radius-lg)] border border-navy-20 bg-white p-6">
          <h2 className="text-xl">Decisión</h2>
          <div className="mt-6">
            {selected.status === "approved" ? (
              <p className="text-sm font-medium text-navy">Aprobada</p>
            ) : (
              <Button onClick={approve} disabled={approving}>{approving ? "Guardando…" : "Aprobar colaboración"}</Button>
            )}
          </div>
        </article>
      </section>
    </div>
  );
}
