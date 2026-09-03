"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { adminLogin } from "@/lib/api";

const fieldClass =
  "mt-2 min-h-11 w-full rounded-[var(--radius-sm)] border border-navy-20 bg-white px-3 py-2.5 text-base text-navy outline-none transition-colors focus:border-magenta sm:text-sm";

export function AdminLoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await adminLogin(username, password);
      router.replace("/admin");
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "No pudimos iniciar sesión.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[var(--radius-lg)] border border-navy-20 bg-white p-6 sm:p-8">
      <div className="grid gap-5">
        <label className="block text-sm font-medium">
          Usuario
          <input
            required
            autoComplete="username"
            className={fieldClass}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </label>
        <label className="block text-sm font-medium">
          Contraseña
          <input
            required
            type="password"
            autoComplete="current-password"
            className={fieldClass}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error ? <p className="text-sm text-magenta">{error}</p> : null}
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Ingresando…" : "Ingresar"}
        </Button>
      </div>
    </form>
  );
}
