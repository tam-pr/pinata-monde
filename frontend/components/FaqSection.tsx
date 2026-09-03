"use client";

import { useState } from "react";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";

export type FaqItem = { question: string; answer: string };

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "¿Hacen envíos a toda la República?",
    answer:
      "Sí. Realizamos envíos a toda la República Mexicana. El costo de envío se calcula de acuerdo con la ubicación y se incluye en el precio final de tu cotización.",
  },
  {
    question: "¿Tienen productos listos para comprar?",
    answer:
      "No. Todas las piñatas de Piñata Monde se elaboran sobre pedido. Trabajamos cada pieza de manera artesanal para cuidar los detalles y crear un diseño especial para cada celebración.",
  },
  {
    question: "¿Hacen envíos fuera de México o venden por Amazon?",
    answer:
      "Actualmente no contamos con envíos internacionales ni venta a través de Amazon. Anteriormente ofrecíamos nuestros productos por este medio, pero hoy concentramos nuestros pedidos directamente a través de Piñata Monde para brindarte una atención más personalizada.",
  },
  {
    question: "¿Cuánto le cabe a mi piñata?",
    answer:
      "La capacidad depende del tamaño de la piñata. Como referencia, una piñata grande puede contener aproximadamente 2 kg de dulces. Las capacidades de los tamaños mediano y pequeño son menores y pueden variar según el diseño y la forma de la pieza.",
  },
  {
    question: "¿Puedo cancelar mi pedido?",
    answer:
      "Sí, puedes solicitar la cancelación de tu pedido con al menos 24 horas de anticipación. Las cancelaciones realizadas con menos tiempo no son elegibles para reembolso, debido a que cada pieza se elabora especialmente sobre pedido.",
  },
  {
    question: "¿Cómo se calcula el precio de mi piñata?",
    answer:
      "El precio estimado se calcula considerando factores como el tamaño, la complejidad del diseño, la cantidad de piezas y el tipo de entrega. La cantidad que muestra nuestra cotización es únicamente un precio estimado y no representa el precio final. Una vez que recibamos tu solicitud, nuestro equipo revisará los detalles y confirmará o ajustará el precio final contigo a través de WhatsApp antes de realizar tu pedido.",
  },
  {
    question: "¿Puedo personalizar mi piñata?",
    answer:
      "Sí. Podemos trabajar diseños personalizados de acuerdo con la temática, personaje o idea que tengas en mente. Compártenos tu referencia y te ayudaremos a convertirla en una piñata.",
  },
  {
    question: "¿Con cuánto tiempo de anticipación debo hacer mi pedido?",
    answer:
      "Te recomendamos solicitar tu piñata con anticipación para contar con el tiempo necesario para elaborarla y entregarla. Si necesitas tu pedido con mayor urgencia, puedes consultar la disponibilidad de servicio express al momento de cotizar.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-16 sm:py-20">
      <Container className="max-w-3xl">
        <SectionHeading eyebrow="Preguntas frecuentes" title="¿Tienes dudas?" />
        <div className="mt-10 space-y-4">
          {FAQ_ITEMS.map((item, index) => (
            <details
              key={item.question}
              open={openIndex === index}
              className="group rounded-[var(--radius-md)] border border-navy-20 bg-paper p-6 open:bg-white"
            >
              <summary
                className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg text-navy marker:content-none [&::-webkit-details-marker]:hidden"
                onClick={(event) => {
                  event.preventDefault();
                  setOpenIndex((current) => (current === index ? null : index));
                }}
              >
                {item.question}
                <span
                  className="shrink-0 text-xl leading-none text-magenta transition-transform duration-200 group-open:rotate-45"
                  aria-hidden="true"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm text-ink-soft">{item.answer}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}
