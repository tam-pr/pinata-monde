export type CreatedQuote = {
  id: string;
  estimated_price_cents: number;
  currency: string;
  complexity_score: number;
  complexity_label: string;
};

export async function createQuote(formData: FormData): Promise<CreatedQuote> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (!baseUrl) {
    throw new Error("La cotización no está configurada todavía. Intenta de nuevo más tarde.");
  }

  const response = await fetch(`${baseUrl}/quotes`, { method: "POST", body: formData });
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
