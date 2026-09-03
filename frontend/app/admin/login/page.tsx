import type { Metadata } from "next";
import { AdminLoginForm } from "@/components/AdminLoginForm";
import { Container } from "@/components/Container";

export const metadata: Metadata = { title: "Ingreso administrador", description: "Acceso interno de Piñata Monde." };

export default function AdminLoginPage() {
  return (
    <main className="py-12 sm:py-16">
      <Container className="max-w-md">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-magenta">Administración</p>
        <h1 className="mt-3 text-3xl sm:text-4xl">Ingreso</h1>
        <p className="mt-3 text-ink-soft">Acceso exclusivo para el equipo de Piñata Monde.</p>
        <div className="mt-8">
          <AdminLoginForm />
        </div>
      </Container>
    </main>
  );
}
