"use client";

import { useEffect, useId, useState } from "react";
import { Button } from "@/components/Button";
import { createQuote, type CreatedQuote } from "@/lib/api";
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
  theme: string;
  deadline: string;
  shipping: "pickup" | "shipping";
  description: string;
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

function emptyForm(theme: string): FormState {
  return {
    name: "",
    phone: "",
    email: "",
    size: "mediana",
    quantity: "1",
    theme,
    deadline: "",
    shipping: "pickup",
    description: theme
      ? `Me gustaría una piñata de ${theme}.`
      : "",
  };
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function QuoteForm({ initialTheme = "" }: { initialTheme?: string }) {
  const fileInputId = useId();
  const [form, setForm] = useState<FormState>(() => emptyForm(initialTheme));
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [quote, setQuote] = useState<CreatedQuote | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function addFiles(list: FileList | File[]) {
    const next = [...files];
    setFileError(null);
    for (const file of Array.from(list)) {
      if (!isAllowedImageFile(file)) {
        setFileError("Solo se aceptan JPEG, PNG o WebP. HEIC no está disponible aún.");
        continue;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        setFileError(`Cada imagen debe pesar máximo ${MAX_IMAGE_BYTES / (1024 * 1024)} MB.`);
        continue;
      }
      if (next.length >= MAX_IMAGES_PER_QUOTE) {
        setFileError(`Puedes adjuntar hasta ${MAX_IMAGES_PER_QUOTE} imágenes.`);
        break;
      }
      next.push(file);
    }
    setFiles(next);
  }

  function validate(): FieldErrors {
    const errors: FieldErrors = {};
    if (form.name.trim().length < 2) errors.name = "Escribe tu nombre.";
    if (form.phone.trim().length < 8) errors.phone = "Escribe un teléfono de contacto.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errors.email = "Escribe un correo válido.";
    }
    if (Number(form.quantity) < 1) errors.quantity = "La cantidad mínima es 1.";
    if (!form.deadline) errors.deadline = "Elige la fecha de la fiesta o entrega.";
    else if (form.deadline < todayIso()) errors.deadline = "La fecha no puede ser anterior a hoy.";
    if (form.description.trim().length < 10) {
      errors.description = "Cuéntanos un poco más sobre la idea (al menos unas líneas).";
    }
    return errors;
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setSubmitError(null);
    setIsSubmitting(true);

    const payload = new FormData();
    payload.set("customer_name", form.name.trim());
    payload.set("phone", form.phone.trim());
    payload.set("email", form.email.trim());
    payload.set("theme", form.theme.trim());
    payload.set("size", form.size);
    payload.set("quantity", form.quantity);
    payload.set("deadline", form.deadline);
    payload.set("delivery_method", form.shipping);
    payload.set("description", form.description.trim());
    payload.set("source", "web");
    for (const file of files) payload.append("images", file);

    try {
      const createdQuote = await createQuote(payload);
      setQuote(createdQuote);
      setSubmitted(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "No pudimos enviar tu solicitud.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const fieldClass =
    "mt-2 min-h-11 w-full rounded-[var(--radius-sm)] border border-navy-20 bg-white px-3 py-2.5 text-base text-navy outline-none transition-colors focus:border-magenta sm:text-sm";
  const errorClass = "mt-1.5 text-sm text-magenta";

  if (submitted) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-navy-20 bg-white p-8 sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-magenta">
          Solicitud lista
        </p>
        <h2 className="mt-3 text-2xl">Recibimos tus datos</h2>
        <p className="mt-3 text-ink-soft">
          Tu solicitud quedó registrada. El monto es una estimación inicial con
          reglas de precio provisionales; el equipo confirmará los detalles.
        </p>
        <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-ink-soft">Folio</dt>
            <dd className="break-all font-medium">{quote?.id}</dd>
          </div>
          <div>
            <dt className="text-ink-soft">Nombre</dt>
            <dd className="font-medium">{form.name}</dd>
          </div>
          <div>
            <dt className="text-ink-soft">Tema / tamaño</dt>
            <dd className="font-medium">
              {form.theme || "Sin tema"} · {form.size} · {form.quantity} pza(s)
            </dd>
          </div>
          <div>
            <dt className="text-ink-soft">Entrega</dt>
            <dd className="font-medium">
              {form.shipping === "shipping" ? "Envío" : "Recoger"} · {form.deadline}
            </dd>
          </div>
          <div>
            <dt className="text-ink-soft">Estimación inicial</dt>
            <dd className="font-medium">
              {quote ? new Intl.NumberFormat("es-MX", { style: "currency", currency: quote.currency }).format(quote.estimated_price_cents / 100) : ""}
            </dd>
          </div>
          <div>
            <dt className="text-ink-soft">Referencias</dt>
            <dd className="font-medium">{files.length} imagen(es)</dd>
          </div>
        </dl>
        <Button
          type="button"
          variant="secondary"
          className="mt-8"
          onClick={() => {
            setSubmitted(false);
            setForm(emptyForm(""));
            setFiles([]);
            setFieldErrors({});
            setFileError(null);
            setQuote(null);
            setSubmitError(null);
          }}
        >
          Enviar otra solicitud
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8" noValidate>
      <fieldset className="rounded-[var(--radius-lg)] border border-navy-20 bg-white p-6 sm:p-8">
        <legend className="px-1 text-lg font-semibold text-navy">Información de contacto</legend>
        <p className="mt-1 text-sm text-ink-soft">
          Para devolverte la cotización con claridad.
        </p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="block text-sm font-medium sm:col-span-2">
            Nombre
            <input
              required
              autoComplete="name"
              className={fieldClass}
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
            />
            {fieldErrors.name ? <p className={errorClass}>{fieldErrors.name}</p> : null}
          </label>
          <label className="block text-sm font-medium">
            Teléfono
            <input
              required
              type="tel"
              autoComplete="tel"
              className={fieldClass}
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
            />
            {fieldErrors.phone ? <p className={errorClass}>{fieldErrors.phone}</p> : null}
          </label>
          <label className="block text-sm font-medium">
            Correo
            <input
              required
              type="email"
              autoComplete="email"
              className={fieldClass}
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
            />
            {fieldErrors.email ? <p className={errorClass}>{fieldErrors.email}</p> : null}
          </label>
        </div>
      </fieldset>

      <fieldset className="rounded-[var(--radius-lg)] border border-navy-20 bg-white p-6 sm:p-8">
        <legend className="px-1 text-lg font-semibold text-navy">Detalles de la piñata</legend>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="block text-sm font-medium sm:col-span-2">
            Tema o personaje
            <input
              className={fieldClass}
              placeholder="Por ejemplo: dinosaurio azul"
              value={form.theme}
              onChange={(e) => update("theme", e.target.value)}
            />
          </label>
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
            {fieldErrors.quantity ? <p className={errorClass}>{fieldErrors.quantity}</p> : null}
          </label>
        </div>
      </fieldset>

      <fieldset className="rounded-[var(--radius-lg)] border border-navy-20 bg-white p-6 sm:p-8">
        <legend className="px-1 text-lg font-semibold text-navy">Referencia visual</legend>
        <p className="mt-1 text-sm text-ink-soft">
          JPEG, PNG o WebP. Máximo {MAX_IMAGES_PER_QUOTE} archivos,{" "}
          {MAX_IMAGE_BYTES / (1024 * 1024)} MB cada uno. No se suben a un servidor
          todavía.
        </p>
        <label
          htmlFor={fileInputId}
          className="mt-6 flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-[var(--radius-md)] border border-dashed border-navy-70 bg-paper px-4 py-8 text-center transition-colors hover:border-magenta hover:bg-magenta-20 sm:py-10"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            if (event.dataTransfer.files.length) addFiles(event.dataTransfer.files);
          }}
        >
          <span className="text-sm font-medium text-navy">Arrastra las imágenes o elige archivos</span>
          <span className="mt-1 text-sm text-ink-soft">Hasta {MAX_IMAGES_PER_QUOTE} referencias</span>
        </label>
        <input
          id={fileInputId}
          type="file"
          accept={ACCEPTED_IMAGE_ACCEPT}
          multiple
          className="sr-only"
          onChange={(e) => {
            addFiles(e.target.files ?? []);
            e.target.value = "";
          }}
        />
        {fileError ? <p className={errorClass}>{fileError}</p> : null}
        {previews.length > 0 ? (
          <ul className="mt-5 flex flex-wrap gap-3">
            {previews.map((src, index) => (
              <li key={src} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`Referencia ${index + 1}`}
                  className="h-24 w-24 rounded-[var(--radius-sm)] object-cover"
                />
                <button
                  type="button"
                  className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-navy text-sm text-white hover:bg-magenta"
                  onClick={() => setFiles((prev) => prev.filter((_, i) => i !== index))}
                  aria-label={`Quitar imagen ${index + 1}`}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </fieldset>

      <fieldset className="rounded-[var(--radius-lg)] border border-navy-20 bg-white p-6 sm:p-8">
        <legend className="px-1 text-lg font-semibold text-navy">Entrega y envío</legend>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="block text-sm font-medium">
            Fecha de la fiesta o entrega
            <input
              required
              type="date"
              min={todayIso()}
              className={fieldClass}
              value={form.deadline}
              onChange={(e) => update("deadline", e.target.value)}
            />
            {fieldErrors.deadline ? <p className={errorClass}>{fieldErrors.deadline}</p> : null}
          </label>
          <fieldset className="text-sm">
            <legend className="font-medium">Cómo la recibes</legend>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:gap-6">
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
      </fieldset>

      <fieldset className="rounded-[var(--radius-lg)] border border-navy-20 bg-white p-6 sm:p-8">
        <legend className="px-1 text-lg font-semibold text-navy">Descripción adicional</legend>
        <label className="mt-6 block text-sm font-medium">
          Cuéntanos colores, personajes o detalles
          <textarea
            required
            rows={5}
            className={fieldClass}
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
          />
          {fieldErrors.description ? (
            <p className={errorClass}>{fieldErrors.description}</p>
          ) : null}
        </label>
      </fieldset>

      {submitError ? <p role="alert" className="text-sm text-magenta">{submitError}</p> : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? "Enviando solicitud…" : "Solicitar cotización"}
        </Button>
        <p className="text-sm text-ink-soft">Sin compromiso de pago en este paso.</p>
      </div>
    </form>
  );
}
