import type { Metadata } from "next";
import { AccordionGallery, type AccordionGalleryItem } from "@/components/AccordionGallery";
import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";

export const metadata: Metadata = {
  title: "Nosotros",
  description: "Conoce el taller y los valores de Piñata Monde.",
};

const VALUES = [
  { title: "Creatividad", text: "Escuchamos cada referencia para abrir posibilidades y convertir una idea personal en una pieza con carácter." },
  { title: "Oficio", text: "Valoramos el trabajo paciente de armar, decorar y resolver los detalles que hacen única a cada piñata." },
  { title: "Comunidad", text: "Buscamos que el taller y las celebraciones sean espacios de encuentro, cercanía y colaboración." },
  { title: "Sostenibilidad", text: "Queremos revisar nuestros materiales y procesos con responsabilidad, paso a paso y con transparencia." },
  { title: "Personalización", text: "Partimos de lo que imaginas: una referencia, un color, un personaje o una historia que quieres celebrar." },
];

const RECOGNITION_GALLERY_ITEMS: AccordionGalleryItem[] = [
  { image: "/aboutus/aboutus1.webp", label: "Fundadores" },
  { image: "/aboutus/aboutus2.webp", label: "Taller creativo" },
  { image: "/aboutus/aboutus3.webp", label: "Piñatas a mano" },
  { image: "/aboutus/aboutus4.png", label: "Equipo finalista" },
  { image: "/aboutus/aboutus5.png", label: "Premio COPARMEX" },
];

const PILLARS = [
  { title: "Visión", text: "Ser la empresa líder en la creación de piñatas innovadoras y personalizadas, destacándonos por ofrecer experiencias únicas que transformen cada celebración en momentos memorables, combinando tradición y creatividad." },
  { title: "Misión", text: "Brindar a nuestros clientes piñatas de alta calidad y diseños exclusivos que reflejen su estilo y emociones, con un compromiso firme hacia la satisfacción, el trabajo artesanal y la mejora continua. Buscamos ser parte fundamental de cada fiesta, haciendo de cada golpe una razón para sonreír." },
  { title: "Objetivo", text: "Ofrecer piñatas personalizadas de la más alta calidad, innovadoras y atractivas, que contribuyan a hacer de cada evento una experiencia única, fomentando la alegría y la unión en cada celebración." },
];

export default function NosotrosPage() {
  return (
    <main>
      <section className="border-b border-navy-20 bg-white py-14 sm:py-20 lg:py-24">
        <Container className="max-w-3xl">
          <SectionHeading as="h1" eyebrow="Nosotros" title="Un taller para las ideas que se celebran" description="Piñata Monde crea piezas personalizadas a partir de una conversación: la idea, los detalles y el día que quieres hacer especial." />
        </Container>
      </section>

      <section className="py-14 sm:py-20 lg:py-24">
        <Container className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch lg:gap-16">
          <div>
            <SectionHeading eyebrow="Nuestra historia" title="Una historia por contar" />
            <div className="mt-6 space-y-4 text-ink-soft">
              <p>Somos una empresa fundada por un papá y su hija dedicada a la creación y diseño de piñatas personalizadas con el fin de mantener las tradiciones mexicanas.</p>
              <p>Siendo las piñatas un símbolo de nuestro país y cultura, soñamos con seguir creando ilusiones para todos los niños.</p>
              <p> </p>
              <p>Somos una empresa fundada por un papá y su hija dedicada a la creación y diseño de piñatas personalizadas con el fin de mantener las tradiciones mexicanas.</p>
              <p>Siendo las piñatas un símbolo de nuestro país y cultura, soñamos con seguir creando ilusiones para todos los niños.</p>
            </div>
          </div>
          <div className="flex flex-col rounded-[var(--radius-lg)] border border-navy-20 bg-paper p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-magenta">Reconocimiento</p>
            <p className="mt-3 text-sm leading-6 text-ink-soft">Piñata Monde fue finalista del Premio Emprendedor COPARMEX 2024.</p>
            <div className="mt-6 min-h-[320px] flex-1">
              <AccordionGallery
                items={RECOGNITION_GALLERY_ITEMS}
                defaultIndex={3}
                trigger="hover"
                grayscale={true}
                showLabels={true}
                radius={16}
                gap={10}
                height={320}
                className="accordion-gallery--fill"
              />
            </div>
          </div>
        </Container>
      </section>

      <section className="border-y border-navy-20 bg-white py-14 sm:py-20 lg:py-24">
        <Container>
          <SectionHeading eyebrow="Visión, misión y objetivo" title="Lo que nos mueve" />
          <ul className="mt-9 grid gap-5 sm:mt-10 sm:grid-cols-3 sm:gap-6">
            {PILLARS.map((pillar) => (
              <li key={pillar.title} className="rounded-[var(--radius-md)] bg-paper p-6 ring-1 ring-navy-20">
                <h2 className="text-lg">{pillar.title}</h2>
                <p className="mt-3 text-sm leading-6 text-ink-soft">{pillar.text}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="border-b border-navy-20 bg-white py-14 sm:py-20 lg:py-24">
        <Container className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHeading eyebrow="Sostenibilidad" title="Mejorar el proceso con intención" />
            <p className="mt-6 text-ink-soft">Queremos que las decisiones del taller consideren los materiales, el uso responsable de recursos y lo que ocurre después de la celebración. Esta es una dirección de trabajo, no una promesa de certificaciones, metas numéricas ni resultados que aún no podamos comprobar.</p>
          </div>
          <div>
            <SectionHeading eyebrow="Empleo y oportunidades para mujeres" title="Hacer espacio para crecer juntas" />
            <p className="mt-6 text-ink-soft">Piñata Monde reconoce el valor de abrir oportunidades de trabajo y aprendizaje para mujeres dentro del oficio. Esta sección se ampliará cuando haya información oficial sobre las formas concretas en que el taller acompaña esa intención.</p>
          </div>
        </Container>
      </section>

      <section className="py-14 sm:py-20 lg:py-24">
        <Container>
          <SectionHeading eyebrow="Valores" title="Lo que guía cada pieza" description="Estos valores describen la forma en que queremos trabajar y relacionarnos con cada celebración." />
          <ul className="mt-9 grid gap-5 sm:grid-cols-2 sm:mt-10 sm:gap-6 lg:grid-cols-5">
            {VALUES.map((value) => (
              <li key={value.title} className="rounded-[var(--radius-md)] bg-white p-6 ring-1 ring-navy-20">
                <h2 className="text-lg">{value.title}</h2>
                <p className="mt-3 text-sm leading-6 text-ink-soft">{value.text}</p>
              </li>
            ))}
          </ul>
          <div className="mt-10"><Button href="/cotizar">Cotizar una idea</Button></div>
        </Container>
      </section>
    </main>
  );
}
