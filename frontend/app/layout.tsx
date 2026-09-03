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
  // metadataBase resolves openGraph.images' relative URL below into an
  // absolute one. Link-preview crawlers (WhatsApp, etc.) fetch it from
  // their own servers, so it must be a publicly reachable URL, not
  // localhost — set NEXT_PUBLIC_SITE_URL to the frontend's public ngrok URL
  // when sharing (see "Sharing your local instance (ngrok)" in README.md).
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "Piñata Monde",
    template: "%s · Piñata Monde",
  },
  description:
    "Piñatas personalizadas hechas a mano. Cuéntanos tu idea y te ayudamos a convertirla en la pieza de la fiesta.",
  openGraph: {
    title: "Piñata Monde",
    description:
      "Piñatas personalizadas hechas a mano. Cuéntanos tu idea y te ayudamos a convertirla en la pieza de la fiesta.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Piñata Monde" }],
  },
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
