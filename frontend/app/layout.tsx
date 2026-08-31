import type { Metadata } from "next";
import { Raleway } from "next/font/google";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "Piñata Monde",
    template: "%s · Piñata Monde",
  },
  description:
    "Piñatas personalizadas hechas a mano. Cuéntanos tu idea y te ayudamos a convertirla en la pieza de la fiesta.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${raleway.variable} flex min-h-screen flex-col antialiased`}>
        <a className="skip-link" href="#contenido">
          Saltar al contenido
        </a>
        <SiteHeader />
        <div id="contenido" className="flex-1">
          {children}
        </div>
        <SiteFooter />
      </body>
    </html>
  );
}
