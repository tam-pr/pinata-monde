export const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/catalogo", label: "Catálogo" },
  { href: "/cotizar", label: "Personaliza" },
  { href: "/colaboraciones", label: "Colaboraciones" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/contacto", label: "Contacto" },
] as const;

export const CONTACT = {
  email: "ventas@piñatamonde.com",
  phoneDisplay: "33 2154 5735",
  phoneHref: "tel:+523321545735",
} as const;

export const SOCIAL_LINKS = [
  { label: "Facebook", href: "https://www.facebook.com/profile.php?id=100041994589896" },
  { label: "Instagram", href: "https://www.instagram.com/pinatamonde" },
  { label: "TikTok", href: "https://www.tiktok.com/@pinatamonde" },
  { label: "YouTube", href: "https://www.youtube.com/channel/UC9-NRzToOBuqVWe8tSI5jLg" },
] as const;
