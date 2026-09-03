"use client";

import { useEffect, useId, useState } from "react";
import { Button } from "@/components/Button";
import { saveCollaborationProposal } from "@/lib/collaborations";
import {
  ACCEPTED_IMAGE_ACCEPT,
  isAllowedImageFile,
  MAX_IMAGE_BYTES,
} from "@/lib/quoteImages";

const COLLABORATION_TYPES = [
  { value: "marca", label: "Marca o producto" },
  { value: "hotel-espacio", label: "Hotel o espacio" },
  { value: "evento", label: "Evento o activación" },
  { value: "medios", label: "Medios o creadores de contenido" },
  { value: "causa-social", label: "Organización o causa social" },
  { value: "otro", label: "Otro" },
] as const;

type FormState = {
  name: string;
  company: string;
  email: string;
  phone: string;
  collaborationType: string;
  proposal: string;
  website: string;
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

function emptyForm(): FormState {
  return {
    name: "",
    company: "",
    email: "",
    phone: "",
    collaborationType: COLLABORATION_TYPES[0].value,
    proposal: "",
    website: "",
  };
}

export function CollaborationProposalForm() {
  const fileInputId = useId();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function addFile(list: FileList | File[]) {
    const candidate = Array.from(list)[0];
    if (!candidate) return;
    setFileError(null);
    if (!isAllowedImageFile(candidate)) {
      setFileError("Solo se aceptan JPEG, PNG o WebP.");
      return;
    }
    if (candidate.size > MAX_IMAGE_BYTES) {
      setFileError(`El archivo debe pesar máximo ${MAX_IMAGE_BYTES / (1024 * 1024)} MB.`);
      return;
    }
    setFile(candidate);
  }

  function validate(): FieldErrors {
    const errors: FieldErrors = {};
    if (form.name.trim().length < 2) errors.name = "Escribe tu nombre.";
    if (form.company.trim().length < 2) errors.company = "Escribe el nombre de la empresa o marca.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errors.email = "Escribe un correo válido.";
    }
    if (form.phone.trim().length < 8) errors.phone = "Escribe un teléfono o WhatsApp de contacto.";
    if (form.proposal.trim().length < 10) {
      errors.proposal = "Cuéntanos un poco más sobre la propuesta (al menos unas líneas).";
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

    try {
      // TODO: no backend endpoint for collaboration proposals yet — this
      // persists to a local mock store (see lib/collaborations.ts) so /admin
      // can review it; replace with a real API once one exists.
      saveCollaborationProposal({ ...form, fileName: file?.name ?? null });
      await new Promise((resolve) => setTimeout(resolve, 400));
      setSubmitted(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "No pudimos enviar tu propuesta.");
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
          Propuesta lista
        </p>
        <h2 className="mt-3 text-2xl">Recibimos tu propuesta</h2>
        <p className="mt-3 text-ink-soft">
          Gracias por escribirnos, {form.name}. El equipo de Piñata Monde revisará tu
          propuesta de colaboración y te contactará a {form.email}.
        </p>
        <Button
          type="button"
          variant="secondary"
          className="mt-8"
          onClick={() => {
            setSubmitted(false);
            setForm(emptyForm());
            setFile(null);
            setFieldErrors({});
            setFileError(null);
            setSubmitError(null);
          }}
        >
          Enviar otra propuesta
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8" noValidate>
      <fieldset className="rounded-[var(--radius-lg)] border border-navy-20 bg-white p-6 sm:p-8">
        <legend className="px-1 text-lg font-semibold text-navy">Datos de contacto</legend>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="block text-sm font-medium">
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
            Empresa/marca
            <input
              required
              autoComplete="organization"
              className={fieldClass}
              value={form.company}
              onChange={(e) => update("company", e.target.value)}
            />
            {fieldErrors.company ? <p className={errorClass}>{fieldErrors.company}</p> : null}
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
          <label className="block text-sm font-medium">
            Teléfono/WhatsApp
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
        </div>
      </fieldset>

      <fieldset className="rounded-[var(--radius-lg)] border border-navy-20 bg-white p-6 sm:p-8">
        <legend className="px-1 text-lg font-semibold text-navy">La propuesta</legend>
        <div className="mt-6 grid gap-5">
          <label className="block text-sm font-medium">
            Tipo de colaboración
            <select
              className={fieldClass}
              value={form.collaborationType}
              onChange={(e) => update("collaborationType", e.target.value)}
            >
              {COLLABORATION_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium">
            Propuesta
            <textarea
              required
              rows={5}
              className={fieldClass}
              placeholder="Cuéntanos la idea, el momento o la pieza que imaginas para esta colaboración."
              value={form.proposal}
              onChange={(e) => update("proposal", e.target.value)}
            />
            {fieldErrors.proposal ? <p className={errorClass}>{fieldErrors.proposal}</p> : null}
          </label>
          <label className="block text-sm font-medium">
            Redes/sitio web <span className="font-normal text-ink-soft">(opcional)</span>
            <input
              className={fieldClass}
              placeholder="Instagram, sitio web, etc."
              value={form.website}
              onChange={(e) => update("website", e.target.value)}
            />
          </label>
        </div>
      </fieldset>

      <fieldset className="rounded-[var(--radius-lg)] border border-navy-20 bg-white p-6 sm:p-8">
        <legend className="px-1 text-lg font-semibold text-navy">
          Archivo/referencia <span className="font-normal text-ink-soft">(opcional)</span>
        </legend>
        <p className="mt-1 text-sm text-ink-soft">
          JPEG, PNG o WebP. Máximo {MAX_IMAGE_BYTES / (1024 * 1024)} MB.
        </p>
        <label
          htmlFor={fileInputId}
          className="mt-6 flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-[var(--radius-md)] border border-dashed border-navy-70 bg-paper px-4 py-8 text-center transition-colors hover:border-magenta hover:bg-magenta-20 sm:py-10"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            if (event.dataTransfer.files.length) addFile(event.dataTransfer.files);
          }}
        >
          <span className="text-sm font-medium text-navy">Arrastra un archivo o elige uno</span>
          <span className="mt-1 text-sm text-ink-soft">Logo, brief o referencia visual</span>
        </label>
        <input
          id={fileInputId}
          type="file"
          accept={ACCEPTED_IMAGE_ACCEPT}
          className="sr-only"
          onChange={(e) => {
            if (e.target.files) addFile(e.target.files);
            e.target.value = "";
          }}
        />
        {fileError ? <p className={errorClass}>{fileError}</p> : null}
        {preview ? (
          <div className="relative mt-5 inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Referencia adjunta"
              className="h-24 w-24 rounded-[var(--radius-sm)] object-cover"
            />
            <button
              type="button"
              className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-navy text-sm text-white hover:bg-magenta"
              onClick={() => setFile(null)}
              aria-label="Quitar archivo"
            >
              ×
            </button>
          </div>
        ) : null}
      </fieldset>

      {submitError ? <p role="alert" className="text-sm text-magenta">{submitError}</p> : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? "Enviando propuesta…" : "Enviar propuesta"}
        </Button>
        <p className="text-sm text-ink-soft">Sin compromiso; solo el inicio de la conversación.</p>
      </div>
    </form>
  );
}
