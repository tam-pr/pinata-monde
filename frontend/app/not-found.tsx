import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";

export default function NotFound() {
  return (
    <main className="py-20 sm:py-28">
      <Container className="max-w-lg text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/logo-isotipo.svg" alt="" className="mx-auto h-20 w-auto" />
        <div className="mt-6">
          <SectionHeading
            as="h1"
            align="center"
            eyebrow="Error 404"
            title="¡Oops! Esta página no existe."
            description="Puede que el enlace esté roto o que la página se haya movido. Vuelve al inicio o arma tu cotización."
          />
        </div>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button href="/">Ir al inicio</Button>
          <Button href="/cotizar" variant="secondary">
            Cotizar
          </Button>
        </div>
      </Container>
    </main>
  );
}
