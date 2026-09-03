import type { Metadata } from "next";
import { AdminAuthGate } from "@/components/AdminAuthGate";
import { AdminDashboard } from "@/components/AdminDashboard";
import { AdminLogoutButton } from "@/components/AdminLogoutButton";
import { Container } from "@/components/Container";

export const metadata: Metadata = { title: "Revisión de cotizaciones", description: "Revisión interna de estimaciones." };

export default function AdminPage() {
  return <main className="py-12 sm:py-16"><Container><AdminAuthGate><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-magenta">Administración</p><h1 className="mt-3 text-3xl sm:text-4xl">Revisión de cotizaciones</h1><p className="mt-3 max-w-2xl text-ink-soft">La estimación automática es una ayuda para decidir; el propietario aprueba el precio final.</p></div><AdminLogoutButton /></div><div className="mt-10"><AdminDashboard /></div></AdminAuthGate></Container></main>;
}
