import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { OwnerReviewDashboard } from "@/components/OwnerReviewDashboard";

export const metadata: Metadata = { title: "Revisión de cotizaciones", description: "Revisión interna de estimaciones." };

export default function AdminPage() {
  return <main className="py-12 sm:py-16"><Container><p className="text-xs font-semibold uppercase tracking-[0.16em] text-magenta">Administración</p><h1 className="mt-3 text-3xl sm:text-4xl">Revisión de cotizaciones</h1><p className="mt-3 max-w-2xl text-ink-soft">La estimación automática es una ayuda para decidir; el propietario aprueba el precio final.</p><div className="mt-10"><OwnerReviewDashboard /></div></Container></main>;
}
