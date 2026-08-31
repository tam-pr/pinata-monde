"use client";

import { useState } from "react";
import { Button } from "@/components/Button";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (name.trim().length < 2 || !email.includes("@") || message.trim().length < 10) {
      setError("Completa nombre, correo y un mensaje con un poco más de detalle.");
      return;
    }
    setError(null);
    setSent(true);
  }

  const fieldClass =
    "mt-2 w-full rounded-[var(--radius-sm)] border border-navy-20 bg-white px-3 py-2.5 text-sm outline-none focus:border-magenta";

  if (sent) {
    return (
      <div className="rounded-[var(--radius-md)] border border-navy-20 bg-paper p-6">
        <h2 className="text-xl">Mensaje registrado (demo)</h2>
        <p className="mt-2 text-sm text-ink-soft">
          Aún no enviamos correos desde el sitio. Si necesitas respuesta ahora,
          usa el teléfono o el correo de esta misma página.
        </p>
        <Button
          type="button"
          variant="secondary"
          className="mt-5"
          onClick={() => {
            setSent(false);
            setName("");
            setEmail("");
            setMessage("");
          }}
        >
          Escribir otro mensaje
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <label className="block text-sm font-medium">
        Nombre
        <input className={fieldClass} value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label className="block text-sm font-medium">
        Correo
        <input
          type="email"
          className={fieldClass}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <label className="block text-sm font-medium">
        Mensaje
        <textarea
          rows={5}
          className={fieldClass}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </label>
      {error ? <p className="text-sm text-magenta">{error}</p> : null}
      <Button type="submit">Enviar mensaje</Button>
    </form>
  );
}
