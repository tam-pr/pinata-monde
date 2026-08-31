import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { ProductCard } from "@/components/ProductCard";
import { SectionHeading } from "@/components/SectionHeading";
import { PINATA_THEMES } from "@/lib/themes";

const STEPS = [
  {
    n: "01",
    title: "Cuéntanos tu idea",
    text: "Elige un tema o describe el personaje. Puedes adjuntar una imagen de referencia.",
  },
  {
    n: "02",
    title: "Afinamos el diseño",
    text: "Revisamos tamaño, cantidad y fecha para que la pieza encaje con tu celebración.",
  },
  {
    n: "03",
    title: "La hacemos a mano",
    text: "En el taller armamos y decoramos cada piñata a partir de tu solicitud.",
  },
  {
    n: "04",
    title: "Listo para la fiesta",
    text: "Te avisamos cuando está lista para recoger o coordinar el envío.",
  },
];

const REASONS = [
  {
    title: "Hecha para tu evento",
    text: "No es un modelo de anaquel: partimos de tu idea, el personaje y el tamaño que necesitas.",
  },
  {
    title: "Oficio de taller",
    text: "Cada pieza se arma y se decora a mano, con el cuidado de un trabajo hecho para verse y usarse.",
  },
  {
    title: "De la idea a lo real",
    text: "Tú llegas con una referencia; nosotros la convertimos en una piñata que puedes sostener.",
  },
];

export default function Home() {
  return (
    <main>
      <section className="border-b border-navy-20 bg-white">
        <Container className="grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:py-24">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-magenta">
              Piñatas personalizadas
            </p>
            <h1 className="mt-4 text-4xl sm:text-5xl lg:text-[3.25rem]">
              Tu idea, hecha piñata
            </h1>
            <p className="mt-5 max-w-xl text-lg text-ink-soft">
              En Piñata Monde diseñamos y armamos piñatas a la medida. Trae el
              personaje, el color o el recuerdo: nosotros lo volvemos la pieza
              central de la fiesta.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button href="/cotizar" size="lg">
                Solicitar cotización
              </Button>
              <Button href="/catalogo" variant="secondary" size="lg">
                Ver catálogo
              </Button>
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-md rounded-[var(--radius-lg)] border border-navy-20 bg-white p-8 sm:p-10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/logo-centrado.svg"
                alt=""
                className="mx-auto h-auto w-full max-w-xs"
              />
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          <SectionHeading
            eyebrow="Catálogo"
            title="Temas que más nos piden"
            description="Partimos de estos mundos y los adaptamos a tu fiesta. Cada pieza se cotiza según tamaño, detalle y fecha."
          />
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PINATA_THEMES.map((theme, index) => (
              <li key={theme.slug}>
                <ProductCard theme={theme} index={index} />
              </li>
            ))}
          </ul>
          <div className="mt-10">
            <Button href="/catalogo" variant="secondary">
              Explorar el catálogo
            </Button>
          </div>
        </Container>
      </section>

      <section className="border-y border-navy-20 bg-white py-16 sm:py-20">
        <Container>
          <SectionHeading
            eyebrow="Proceso"
            title="Cómo llega tu piñata"
            description="Un camino claro, de la referencia al taller y de ahí a tu celebración."
          />
          <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step) => (
              <li
                key={step.n}
                className="rounded-[var(--radius-md)] border border-navy-20 bg-paper p-6"
              >
                <p className="text-sm font-semibold text-magenta">{step.n}</p>
                <h3 className="mt-3 text-lg">{step.title}</h3>
                <p className="mt-3 text-sm text-ink-soft">{step.text}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="rounded-[var(--radius-lg)] bg-magenta-20 p-6 sm:p-8">
            <div className="rounded-[var(--radius-md)] bg-white p-8 sm:p-10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/logo-isotipo.svg"
                alt=""
                className="mx-auto h-48 w-48 sm:h-56 sm:w-56"
              />
            </div>
          </div>
          <div>
            <SectionHeading
              eyebrow="Personalización"
              title="Si lo imaginas, lo podemos armar"
            />
            <p className="mt-5 text-ink-soft">
              Un dibujo, una foto o una descripción bastan para empezar. Ajustamos
              forma, tamaño y detalles para que la piñata se sienta tuya, no de
              catálogo genérico.
            </p>
            <p className="mt-4 text-ink-soft">
              Cuéntanos la fecha de la fiesta y cómo quieres recibirla: el equipo
              te orienta sobre tiempos y entrega.
            </p>
            <div className="mt-8">
              <Button href="/cotizar">Personaliza la tuya</Button>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-y border-navy-20 bg-white py-16 sm:py-20">
        <Container>
          <SectionHeading
            eyebrow="Por qué nos eligen"
            title="Oficio, carácter y una pieza que se nota"
          />
          <ul className="mt-10 grid gap-6 md:grid-cols-3">
            {REASONS.map((reason) => (
              <li key={reason.title} className="rounded-[var(--radius-md)] bg-paper p-6">
                <h3 className="text-lg">{reason.title}</h3>
                <p className="mt-3 text-sm text-ink-soft">{reason.text}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container className="max-w-3xl">
          <SectionHeading
            eyebrow="Taller"
            title="Papel, cartón y trabajo a mano"
            description="Cada piñata se construye con materiales de papelería y cartón, pieza por pieza. Cuidamos el proceso en el taller para que llegue lista al día de la fiesta, sin pretender sellos ni certificaciones que no mostramos aquí."
          />
        </Container>
      </section>

      <section className="bg-navy py-16 text-white sm:py-20">
        <Container className="text-center">
          <h2 className="text-3xl text-white sm:text-4xl">¿Lista la idea?</h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-navy-20">
            Envía una cotización con tus datos y una imagen de referencia. Te
            respondemos para afinar detalles.
          </p>
          <div className="mt-8 flex justify-center">
            <Button href="/cotizar" size="lg">
              Solicitar cotización
            </Button>
          </div>
        </Container>
      </section>
    </main>
  );
}
