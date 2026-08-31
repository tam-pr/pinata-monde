import Link from "next/link";

const THEMES = [
  "Superhéroes",
  "Princesas",
  "Dinosaurios",
  "Deportes",
  "Coches",
  "Disney",
  "Videojuegos",
  "Paw Patrol",
];

export default function Home() {
  return (
    <main>
      <section className="mx-auto max-w-5xl px-4 py-16 sm:py-24">
        <p className="text-sm font-medium uppercase tracking-wide text-accent">
          Piñatas personalizadas
        </p>
        <h1 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Hacemos de cada evento una experiencia única
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted">
          Cuéntanos tu idea, sube una imagen de referencia y recibe una
          cotización estimada. Este sitio es el inicio de la plataforma digital
          de Piñata Monde.
        </p>
        <Link
          href="/cotizar"
          className="mt-8 inline-flex rounded-full bg-accent px-6 py-3 text-sm font-medium text-white hover:bg-accent-dark"
        >
          Solicitar cotización
        </Link>
      </section>

      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-5xl px-4 py-12">
          <h2 className="text-xl font-semibold">Temas frecuentes</h2>
          <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {THEMES.map((theme) => (
              <li
                key={theme}
                className="rounded-xl border border-border bg-background px-4 py-3 text-sm"
              >
                {theme}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12">
        <h2 className="text-xl font-semibold">Preguntas frecuentes</h2>
        <dl className="mt-6 space-y-6 text-sm">
          <div>
            <dt className="font-medium">¿Cómo cotizo una piñata personalizada?</dt>
            <dd className="mt-1 text-muted">
              Completa el formulario de cotización con tamaño, cantidad, fecha,
              envío y una imagen de referencia. Más adelante también podrás
              hacerlo por WhatsApp; ambas vías usarán el mismo proceso.
            </dd>
          </div>
          <div>
            <dt className="font-medium">¿El precio del formulario es final?</dt>
            <dd className="mt-1 text-muted">
              No. El estimado se calculará con reglas de precio (aún con valores
              de demostración) y una complejidad de 1 a 5. El equipo confirma el
              pedido.
            </dd>
          </div>
        </dl>
      </section>
    </main>
  );
}
