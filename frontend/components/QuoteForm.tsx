"use client";

import { useEffect, useState } from "react";
import {
  ACCEPTED_IMAGE_ACCEPT,
  isAllowedImageFile,
  MAX_IMAGE_BYTES,
  MAX_IMAGES_PER_QUOTE,
} from "@/lib/quoteImages";

const SIZES = [
  { value: "chica", label: "Chica" },
  { value: "mediana", label: "Mediana" },
  { value: "grande", label: "Grande" },
] as const;

type FormState = {
  name: string;
  phone: string;
  email: string;
  size: string;
  quantity: string;
  deadline: string;
  shipping: "pickup" | "shipping";
  description: string;
};

const EMPTY: FormState = {
  name: "",
  phone: "",
  email: "",
  size: "mediana",
  quantity: "1",
  deadline: "",
  shipping: "pickup",
  description: "",
};

export function QuoteForm() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => {
      for (const url of urls) URL.revokeObjectURL(url);
    };
  }, [files]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function onFilesChange(list: FileList | null) {
    if (!list) return;
    const next = [...files];
    setFileError(null);
    for (const file of Array.from(list)) {
      if (!isAllowedImageFile(file)) {
        setFileError("Solo se aceptan JPEG, PNG o WebP. HEIC no está soportado aún.");
        continue;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        setFileError(`Cada imagen debe pesar máximo ${MAX_IMAGE_BYTES / (1024 * 1024)} MB.`);
        continue;
      }
      if (next.length >= MAX_IMAGES_PER_QUOTE) {
        setFileError(`Máximo ${MAX_IMAGES_PER_QUOTE} imágenes.`);
        break;
      }
      next.push(file);
    }
    setFiles(next);
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8">
        <h2 className="text-xl font-semibold">Recibimos tus datos (demo)</h2>
        <p className="mt-2 text-sm text-muted">
          Aún no se guarda la cotización ni se calcula el precio. El siguiente
          paso conectará este formulario con el motor de precios y el API.
        </p>
        <p className="mt-4 text-sm">
          {form.name} · {form.size} · {form.quantity} pza(s) ·{" "}
          {form.shipping === "shipping" ? "Envío" : "Recoger"}
        </p>
        <button
          type="button"
          className="mt-6 text-sm font-medium text-accent hover:underline"
          onClick={() => {
            setSubmitted(false);
            setForm(EMPTY);
            setFiles([]);
          }}
        >
          Enviar otra solicitud
        </button>
      </div>
    );
  }

  const fieldClass =
    "mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/30";

  return (
    <form onSubmit={onSubmit} className="space-y-5 rounded-2xl border border-border bg-card p-6 sm:p-8">
      <p className="text-sm text-muted">
        Los archivos no se suben a un servidor todavía. Validamos tipo, tamaño y
        cantidad en el navegador.
      </p>

      <label className="block text-sm font-medium">
        Nombre
        <input
          required
          className={fieldClass}
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
        />
      </label>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-medium">
          Teléfono
          <input
            required
            type="tel"
            className={fieldClass}
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
          />
        </label>
        <label className="block text-sm font-medium">
          Correo
          <input
            required
            type="email"
            className={fieldClass}
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-medium">
          Tamaño
          <select
            className={fieldClass}
            value={form.size}
            onChange={(e) => update("size", e.target.value)}
          >
            {SIZES.map((size) => (
              <option key={size.value} value={size.value}>
                {size.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium">
          Cantidad
          <input
            required
            type="number"
            min={1}
            className={fieldClass}
            value={form.quantity}
            onChange={(e) => update("quantity", e.target.value)}
          />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-medium">
          Fecha límite
          <input
            required
            type="date"
            className={fieldClass}
            value={form.deadline}
            onChange={(e) => update("deadline", e.target.value)}
          />
        </label>
        <fieldset className="text-sm">
          <legend className="font-medium">Entrega</legend>
          <div className="mt-2 flex gap-4">
            <label className="flex items-center gap-2 font-normal">
              <input
                type="radio"
                name="shipping"
                checked={form.shipping === "pickup"}
                onChange={() => update("shipping", "pickup")}
              />
              Recoger
            </label>
            <label className="flex items-center gap-2 font-normal">
              <input
                type="radio"
                name="shipping"
                checked={form.shipping === "shipping"}
                onChange={() => update("shipping", "shipping")}
              />
              Envío
            </label>
          </div>
        </fieldset>
      </div>

      <label className="block text-sm font-medium">
        Descripción de la idea
        <textarea
          required
          rows={4}
          className={fieldClass}
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
        />
      </label>

      <label className="block text-sm font-medium">
        Imágenes de referencia (JPEG, PNG o WebP · máx. {MAX_IMAGES_PER_QUOTE} ·{" "}
        {MAX_IMAGE_BYTES / (1024 * 1024)} MB c/u)
        <input
          type="file"
          accept={ACCEPTED_IMAGE_ACCEPT}
          multiple
          className={`${fieldClass} file:mr-3 file:rounded-md file:border-0 file:bg-accent file:px-3 file:py-1 file:text-white`}
          onChange={(e) => onFilesChange(e.target.files)}
        />
      </label>
      {fileError ? <p className="text-sm text-accent">{fileError}</p> : null}
      {previews.length > 0 ? (
        <ul className="flex flex-wrap gap-3">
          {previews.map((src, index) => (
            <li key={src} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`Referencia ${index + 1}`}
                className="h-20 w-20 rounded-lg object-cover"
              />
              <button
                type="button"
                className="absolute -right-2 -top-2 rounded-full bg-foreground px-1.5 text-xs text-white"
                onClick={() => setFiles((prev) => prev.filter((_, i) => i !== index))}
                aria-label="Quitar imagen"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <button
        type="submit"
        className="w-full rounded-full bg-accent py-3 text-sm font-medium text-white hover:bg-accent-dark sm:w-auto sm:px-8"
      >
        Enviar solicitud
      </button>
    </form>
  );
}
