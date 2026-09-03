import { CONTACT } from "@/lib/nav";

/** Digits-only WhatsApp number derived from the existing contact config. */
const WHATSAPP_NUMBER = CONTACT.phoneHref.replace(/\D/g, "");

export type WhatsAppOrderDetails = {
  name: string;
  theme: string;
  sizeLabel: string;
  quantity: string;
  shipping: "pickup" | "shipping";
  deadline: string;
  isExpress: boolean;
  needsStick: boolean;
  priceCents: number;
  currency: string;
  folio: string;
};

function formatPrice(cents: number, currency: string): string {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency }).format(cents / 100);
}

export function buildWhatsAppOrderMessage(details: WhatsAppOrderDetails): string {
  return [
    "Hola, quiero confirmar mi pedido de piñata 🎉",
    "",
    `Nombre: ${details.name}`,
    `Diseño: ${details.theme || "Sin tema"}`,
    `Tamaño: ${details.sizeLabel}`,
    `Cantidad: ${details.quantity}`,
    `Entrega: ${details.shipping === "shipping" ? "Envío" : "Recoger"}`,
    `Fecha solicitada: ${details.deadline}`,
    `Exprés (≤5 días): ${details.isExpress ? "Sí" : "No"}`,
    `Palo de piñata: ${details.needsStick ? "Sí" : "No"}`,
    `Precio estimado: ${formatPrice(details.priceCents, details.currency)}`,
    `Folio: ${details.folio}`,
  ].join("\n");
}

/** wa.me click-to-chat link, pre-filled — no WhatsApp Business API involved. */
export function buildWhatsAppOrderLink(details: WhatsAppOrderDetails): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildWhatsAppOrderMessage(details))}`;
}
