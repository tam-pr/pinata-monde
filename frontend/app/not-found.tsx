import { Button } from "@/components/Button";
import { Container } from "@/components/Container";

export default function NotFound() {
  return (
    <main className="py-20">
      <Container className="max-w-lg text-center">
        <h1 className="text-3xl">No encontramos esa página</h1>
        <p className="mt-4 text-ink-soft">
          Revisa el enlace o vuelve al inicio para cotizar tu piñata.
        </p>
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
