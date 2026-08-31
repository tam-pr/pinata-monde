import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Piñata Monde",
  description: "Piñatas personalizadas. Solicita una cotización.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} min-h-screen antialiased`}>
        <header className="border-b border-border bg-card">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              Piñata Monde
            </Link>
            <nav className="flex gap-6 text-sm text-muted">
              <Link href="/" className="hover:text-foreground">
                Inicio
              </Link>
              <Link href="/cotizar" className="hover:text-foreground">
                Cotizar
              </Link>
            </nav>
          </div>
        </header>
        {children}
        <footer className="border-t border-border px-4 py-8 text-center text-sm text-muted">
          Piñata Monde — cotizaciones en línea (demo)
        </footer>
      </body>
    </html>
  );
}
