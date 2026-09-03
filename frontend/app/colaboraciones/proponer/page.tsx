import type { Metadata } from "next";
import { CollaborationProposalForm } from "@/components/CollaborationProposalForm";
import { Container } from "@/components/Container";

export const metadata: Metadata = {
  title: "Proponer una colaboración",
  description: "Propón una colaboración de marca, evento o proyecto con Piñata Monde.",
};

export default function ProponerColaboracionPage() {
  return (
    <main className="py-12 sm:py-16">
      <Container className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-magenta">
          Colaboraciones
        </p>
        <h1 className="mt-3 text-3xl sm:text-4xl">Proponer una colaboración</h1>
        <p className="mt-4 max-w-2xl text-ink-soft">
          Cuéntanos sobre tu marca, evento o proyecto y cómo imaginas colaborar con
          Piñata Monde. Revisamos cada propuesta y te contactamos para afinar los
          detalles.
        </p>
        <div className="mt-10">
          <CollaborationProposalForm />
        </div>
      </Container>
    </main>
  );
}
