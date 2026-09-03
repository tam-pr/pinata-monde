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
  odoo_status: string | null; images: QuoteImage[];
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

export async function createQuote(formData: FormData): Promise<CreatedQuote> {
  let response: Response;
  try { response = await fetch(apiUrl("/quotes"), { method: "POST", body: formData }); }
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

export async function getReviewQuotes(): Promise<ReviewQuote[]> {
  const response = await fetch(apiUrl("/admin/quotes"), { cache: "no-store" });
  if (!response.ok) throw new Error("No pudimos cargar las cotizaciones.");
  return response.json() as Promise<ReviewQuote[]>;
}

export async function getPriceBreakdown(id: string, complexityScore?: number): Promise<PriceBreakdown> {
  const query = complexityScore ? `?complexity_score=${complexityScore}` : "";
  const response = await fetch(apiUrl(`/quotes/${id}/price-breakdown${query}`));
  if (!response.ok) throw new Error("No pudimos calcular el desglose.");
  return response.json() as Promise<PriceBreakdown>;
}

export async function reviewQuote(id: string, payload: { owner_complexity_score?: number; final_price_cents?: number }): Promise<ReviewQuote> {
  const response = await fetch(apiUrl(`/admin/quotes/${id}/review`), {
    method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok) throw new Error(typeof result?.detail === "string" ? result.detail : "No pudimos guardar la revisión.");
  return result as ReviewQuote;
}

export function uploadUrl(path: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  const filename = path.split("/").pop();
  return baseUrl && filename ? `${baseUrl}/uploads/${filename}` : "";
}
