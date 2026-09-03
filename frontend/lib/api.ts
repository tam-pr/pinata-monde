export type CreatedQuote = {
  id: string;
  estimated_price_cents: number;
  currency: string;
  complexity_score: number;
  complexity_label: string;
};

export type QuoteImage = { id: string; filename: string; content_type: string; path: string };
export type ReviewQuote = CreatedQuote & {
  customer_name: string; phone: string; email: string; theme: string | null;
  size: string; quantity: number; deadline: string; delivery_method: string; needs_stick: boolean; description: string;
  ai_confidence: number; ai_reason: string; ai_model_version: string;
  owner_complexity_score: number | null; final_price_cents: number | null;
  status: "pending_review" | "approved"; source: string; odoo_lead_id: string | null;
  odoo_status: string | null; archived_at: string | null; deleted_at: string | null; deleted_until: string | null;
  images: QuoteImage[];
};

export type PriceBreakdown = {
  base_price_cents: number; complexity_score: number; complexity_multiplier: number;
  quantity: number; stick_cents: number; shipping_cents: number;
  is_express: boolean; express_fee_cents: number;
  suggested_price_cents: number; currency: string;
};

function apiUrl(path: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (!baseUrl) throw new Error("La API no está configurada.");
  return `${baseUrl}${path}`;
}

/**
 * Sent on every request. When NEXT_PUBLIC_API_URL points at an ngrok tunnel,
 * this skips ngrok's browser-warning interstitial — without it, fetch()
 * would receive that HTML page instead of JSON. Harmless against a
 * non-ngrok backend, which simply ignores the unrecognized header.
 */
const NGROK_SKIP_HEADER = { "ngrok-skip-browser-warning": "true" } as const;

export async function createQuote(formData: FormData): Promise<CreatedQuote> {
  let response: Response;
  try { response = await fetch(apiUrl("/quotes"), { method: "POST", body: formData, headers: NGROK_SKIP_HEADER }); }
  catch { throw new Error("La cotización no está configurada todavía. Intenta de nuevo más tarde."); }
  if (!response.ok) {
    const payload: unknown = await response.json().catch(() => null);
    const detailValue = typeof payload === "object" && payload !== null && "detail" in payload
      ? payload.detail
      : null;
    const detail = Array.isArray(detailValue)
      ? String(detailValue[0]?.msg ?? "No pudimos enviar tu solicitud. Intenta de nuevo.")
      : detailValue ? String(detailValue) : "No pudimos enviar tu solicitud. Intenta de nuevo.";
    throw new Error(detail);
  }

  return response.json() as Promise<CreatedQuote>;
}

/**
 * Fire-and-forget: records the "Ordenar por WhatsApp" click and creates the
 * matching Odoo lead. Never throws — the WhatsApp chat already opened via a
 * plain wa.me link regardless of this call's outcome.
 */
export async function recordWhatsAppOrderClick(id: string): Promise<void> {
  try {
    await fetch(apiUrl(`/quotes/${id}/whatsapp-click`), { method: "POST", headers: NGROK_SKIP_HEADER });
  } catch {
    // Best-effort only; see docstring above.
  }
}

export async function getReviewQuotes(options?: { view?: "active" | "archived" | "trash"; q?: string }): Promise<ReviewQuote[]> {
  const params = new URLSearchParams();
  if (options?.view) params.set("view", options.view);
  if (options?.q) params.set("q", options.q);
  const query = params.toString() ? `?${params.toString()}` : "";
  const response = await fetch(apiUrl(`/admin/quotes${query}`), { cache: "no-store", credentials: "include", headers: NGROK_SKIP_HEADER });
  if (response.status === 401) throw new AdminAuthError();
  if (!response.ok) throw new Error("No pudimos cargar las cotizaciones.");
  return response.json() as Promise<ReviewQuote[]>;
}

async function postQuoteAction(id: string, action: string): Promise<ReviewQuote> {
  const response = await fetch(apiUrl(`/admin/quotes/${id}/${action}`), {
    method: "POST", credentials: "include", headers: NGROK_SKIP_HEADER,
  });
  if (response.status === 401) throw new AdminAuthError();
  const result = await response.json().catch(() => null);
  if (!response.ok) throw new Error(typeof result?.detail === "string" ? result.detail : "No pudimos completar la acción.");
  return result as ReviewQuote;
}

export const archiveQuote = (id: string) => postQuoteAction(id, "archive");
/** Restores from either the archive or the trash — whichever applies. */
export const restoreQuote = (id: string) => postQuoteAction(id, "restore");
/** Soft delete: moves the quote to the trash for the 3-day recovery window. */
export const deleteQuote = (id: string) => postQuoteAction(id, "delete");

/** Permanent, irreversible — only allowed on a quote already in the trash. */
export async function purgeQuote(id: string): Promise<void> {
  const response = await fetch(apiUrl(`/admin/quotes/${id}/purge`), {
    method: "POST", credentials: "include", headers: NGROK_SKIP_HEADER,
  });
  if (response.status === 401) throw new AdminAuthError();
  if (!response.ok) {
    const result = await response.json().catch(() => null);
    throw new Error(typeof result?.detail === "string" ? result.detail : "No pudimos eliminar la cotización.");
  }
}

export async function getPriceBreakdown(id: string, complexityScore?: number): Promise<PriceBreakdown> {
  const query = complexityScore ? `?complexity_score=${complexityScore}` : "";
  const response = await fetch(apiUrl(`/quotes/${id}/price-breakdown${query}`), { credentials: "include", headers: NGROK_SKIP_HEADER });
  if (response.status === 401) throw new AdminAuthError();
  if (!response.ok) throw new Error("No pudimos calcular el desglose.");
  return response.json() as Promise<PriceBreakdown>;
}

export async function reviewQuote(id: string, payload: { owner_complexity_score?: number; final_price_cents?: number }): Promise<ReviewQuote> {
  const response = await fetch(apiUrl(`/admin/quotes/${id}/review`), {
    method: "PATCH", headers: { "Content-Type": "application/json", ...NGROK_SKIP_HEADER }, body: JSON.stringify(payload),
    credentials: "include",
  });
  if (response.status === 401) throw new AdminAuthError();
  const result = await response.json().catch(() => null);
  if (!response.ok) throw new Error(typeof result?.detail === "string" ? result.detail : "No pudimos guardar la revisión.");
  return result as ReviewQuote;
}

/** Thrown when an admin API call gets a 401; callers can redirect to /admin/login. */
export class AdminAuthError extends Error {
  constructor() {
    super("No autenticado.");
    this.name = "AdminAuthError";
  }
}

export async function adminLogin(username: string, password: string): Promise<{ username: string }> {
  const response = await fetch(apiUrl("/admin/login"), {
    method: "POST", headers: { "Content-Type": "application/json", ...NGROK_SKIP_HEADER },
    body: JSON.stringify({ username, password }), credentials: "include",
  });
  const result = await response.json().catch(() => null);
  if (!response.ok) throw new Error(typeof result?.detail === "string" ? result.detail : "Usuario o contraseña incorrectos.");
  return result as { username: string };
}

export async function adminLogout(): Promise<void> {
  await fetch(apiUrl("/admin/logout"), { method: "POST", credentials: "include", headers: NGROK_SKIP_HEADER });
}

export async function getAdminMe(): Promise<{ username: string } | null> {
  const response = await fetch(apiUrl("/admin/me"), { credentials: "include", cache: "no-store", headers: NGROK_SKIP_HEADER });
  if (!response.ok) return null;
  return response.json() as Promise<{ username: string }>;
}

export function uploadUrl(path: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  const filename = path.split("/").pop();
  return baseUrl && filename ? `${baseUrl}/uploads/${filename}` : "";
}
