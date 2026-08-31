import type { Metadata } from "next";
import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";

export const metadata: Metadata = {
  title: "Colaboraciones",
  description: "Espacio para futuras colaboraciones de Piñata Monde.",
};

const PLACEHOLDER_COLLABORATIONS = [
  {
    title: "Kido: Kids Company",
    description: 
      "[Contenido pendiente] Espacio para presentar una colaboración futura, su idea y la pieza desarrollada en conjunto.",
  },
  {
    title: "Calaverandia",
    description:
      "[Contenido pendiente] Aquí podrá mostrarse una activación, fiesta o experiencia especial realizada con Piñata Monde.",
  },
  {
    title: "Navidalia",
    description:
      "[Contenido pendiente] Lugar reservado para proyectos que conecten creatividad, oficio y comunidad.",
  },
  {
    title: "RCD Hotels",
    description:
      "[Contenido pendiente] Espacio reservado para una colaboración con una marca aliada y la pieza resultante.",
  },
  {
    title: "Rosewood Hotels & Resorts",
    description:
      "[Contenido pendiente] Lugar para mostrar una pieza o colección desarrollada para una ocasión particular.",
  },
  {
    title: "Just Jump",
    description:
      "[Contenido pendiente] Espacio para una colaboración enfocada en exploración creativa y diseño.",
  },
  {
    title: "de la Rosa",
    description:
      "[Contenido pendiente] Lugar reservado para una experiencia o activación ligada a un momento cultural.",
  },
  {
    title: "Kiddie latte joy",
    description:
      "[Contenido pendiente] Espacio para mostrar una colaboración con medios, publicaciones o creadores de contenido.",
  },
  {
    title: "Horneando Sonrisas A.C.",
    description:
      "[Contenido pendiente] Lugar reservado para una iniciativa realizada junto a una organización o comunidad local.",
  },
];

export default function ColaboracionesPage() {
  return (
    <main>
      <section className="border-b border-navy-20 bg-white py-14 sm:py-20 lg:py-24">
        <Container className="max-w-3xl">
          <SectionHeading
            as="h1"
            eyebrow="Colaboraciones"
            title="Ideas que se hacen en conjunto"
            description="Este espacio está reservado para compartir futuras colaboraciones de Piñata Monde. Las historias, imágenes y nombres se añadirán cuando haya información oficial para publicar."
          />
          <div className="mt-8">
            <Button href="/cotizar" size="lg">Proponer una colaboración</Button>
          </div>
        </Container>
      </section>

      <section className="py-14 sm:py-20 lg:py-24">
        <Container>
          <SectionHeading
            eyebrow="Próximamente"
            title="Un espacio para proyectos compartidos"
            description="Las siguientes fichas son marcadores de posición; no representan alianzas, clientes ni proyectos actuales."
          />
          <ul className="mt-9 grid gap-5 md:grid-cols-3 sm:mt-10 sm:gap-6">
            {PLACEHOLDER_COLLABORATIONS.map((collaboration, index) => (
              <li key={collaboration.title} className="overflow-hidden rounded-[var(--radius-lg)] border border-navy-20 bg-white">
                <div className="flex aspect-[16/9] items-center justify-center bg-paper p-6">
                  <div className="flex h-full w-full items-center justify-center rounded-[var(--radius-md)] border border-dashed border-navy-70/60 bg-white px-4 text-center">
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-navy-70">Logo o imagen {index + 1}</span>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-magenta">holi</p>
                  <h2 className="mt-3 text-xl">{collaboration.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-ink-soft">{collaboration.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="border-t border-navy-20 bg-navy py-14 sm:py-20">
        <Container className="max-w-2xl text-center">
          <h2 className="text-3xl text-white sm:text-4xl">¿Tienes una idea para colaborar?</h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-navy-20">Cuéntanos el proyecto, la fecha y el tipo de pieza que imaginas. Podemos empezar la conversación desde una cotización.</p>
          <div className="mt-8 flex justify-center"><Button href="/cotizar" size="lg">Iniciar una cotización</Button></div>
        </Container>
      </section>
    </main>
  );
}