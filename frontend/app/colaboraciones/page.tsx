import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
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
    url: "https://kidokids.com/", // ← replace with the real sponsor URL
    image: "/collabs/kido.webp",       // ← put the logo/image file here
  },
  {
    title: "Calaverandia",
    description:
      "[Contenido pendiente] Aquí podrá mostrarse una activación, fiesta o experiencia especial realizada con Piñata Monde.",
    url: "https://www.alteaemotions.com/calaverandia.php",
    image: "/collabs/Logotipo_Calaverandia-2.webp",
  },
  {
    title: "Navidalia",
    description:
      "[Contenido pendiente] Lugar reservado para proyectos que conecten creatividad, oficio y comunidad.",
    url: "https://navidalia.mx/guadalajara/informacion/",
    image: "/collabs/Logo-Navidalia.webp",
  },
  {
    title: "RCD Hotels",
    description:
      "[Contenido pendiente] Espacio reservado para una colaboración con una marca aliada y la pieza resultante.",
    url: "https://www.pamhotels.com/",
    image: "/collabs/logo-rcd-hotels.webp",
  },
  {
    title: "Rosewood Hotels & Resorts",
    description:
      "[Contenido pendiente] Lugar para mostrar una pieza o colección desarrollada para una ocasión particular.",
    url: "https://www.rosewoodhotels.com/en/default",
    image: "/collabs/rosewood-hotel-resorts-removebg-preview.png",
  },
  {
    title: "Just Jump",
    description:
      "[Contenido pendiente] Espacio para una colaboración enfocada en exploración creativa y diseño.",
    url: "https://www.justjump.com.mx/",
    image: "/collabs/just-jump-removebg-preview.png",
  },
  {
    title: "de la Rosa",
    description:
      "[Contenido pendiente] Lugar reservado para una experiencia o activación ligada a un momento cultural.",
    url: "https://dulcesdelarosa.com.mx/",
    image: "/collabs/dulces-de-la-rosa_marca-2.webp",
  },
  {
    title: "Kiddie latte joy",
    description:
      "[Contenido pendiente] Espacio para mostrar una colaboración con medios, publicaciones o creadores de contenido.",
    url: "https://www.kiddielattejoy.com/",
    image: "/collabs/kiddielattejoy.png",
  },
  {
    title: "Horneando Sonrisas A.C.",
    description:
      "[Contenido pendiente] Lugar reservado para una iniciativa realizada junto a una organización o comunidad local.",
    url: "https://horneandosonrisas.org/",
    image: "/collabs/horneandosonrisas}.png",
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
            <Button href="/colaboraciones/proponer" size="lg">Proponer una colaboración</Button>
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
              <li
                key={collaboration.title}
                className="overflow-hidden rounded-[var(--radius-lg)] border border-navy-20 bg-white transition-shadow hover:shadow-md"
              >
                <Link
                  href={collaboration.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-magenta"
                >
                  <div className="flex aspect-[16/9] items-center justify-center bg-paper p-6">
                    {collaboration.image ? (
                      <Image
                        src={collaboration.image}
                        alt={collaboration.title}
                        width={300}
                        height={169}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center rounded-[var(--radius-md)] border border-dashed border-navy-70/60 bg-white px-4 text-center">
                        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-navy-70">
                          Logo o imagen {index + 1}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-magenta">Piñata Partner</p>
                    <h2 className="mt-3 text-xl">{collaboration.title}</h2>
                    <p className="mt-3 text-sm leading-6 text-ink-soft">{collaboration.description}</p>
                  </div>
                </Link>
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