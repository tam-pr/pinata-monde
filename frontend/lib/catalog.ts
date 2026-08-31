export type CatalogProduct = {
  slug: string;
  title: string;
  description: string;
};

export type CatalogCategory = {
  slug: string;
  title: string;
  description: string;
  products: CatalogProduct[];
};

export const CATALOG_CATEGORIES: CatalogCategory[] = [
  {
    slug: "cumpleanos",
    title: "Cumpleaños",
    description: "Ideas para hacer del festejo una pieza central con mucho color.",
    products: [
      { slug: "diseno-01", title: "Piñata de cumpleaños · diseño 01", description: "[Referencia de catálogo] Propuesta visual de cumpleaños pendiente de información oficial." },
      { slug: "diseno-02", title: "Piñata de cumpleaños · diseño 02", description: "[Referencia de catálogo] Otra dirección creativa para explorar antes de cotizar." },
      { slug: "diseno-03", title: "Piñata de cumpleaños · diseño 03", description: "[Referencia de catálogo] Marcador de posición para una futura pieza del tema." },
    ],
  },
  {
    slug: "personajes",
    title: "Personajes",
    description: "Puntos de partida para imaginar héroes, cuentos y personajes favoritos.",
    products: [
      { slug: "diseno-01", title: "Piñata de personaje · diseño 01", description: "[Referencia de catálogo] Ejemplo de una pieza personalizable por definir." },
      { slug: "diseno-02", title: "Piñata de personaje · diseño 02", description: "[Referencia de catálogo] Espacio reservado para un producto oficial." },
      { slug: "diseno-03", title: "Piñata de personaje · diseño 03", description: "[Referencia de catálogo] Propuesta visual pendiente de contenido final." },
    ],
  },
  {
    slug: "celebraciones",
    title: "Celebraciones",
    description: "Referencias para reuniones, momentos especiales y festejos compartidos.",
    products: [
      { slug: "diseno-01", title: "Piñata de celebración · diseño 01", description: "[Referencia de catálogo] Diseño de muestra sin disponibilidad confirmada." },
      { slug: "diseno-02", title: "Piñata de celebración · diseño 02", description: "[Referencia de catálogo] Espacio para una futura pieza de esta categoría." },
      { slug: "diseno-03", title: "Piñata de celebración · diseño 03", description: "[Referencia de catálogo] Idea para conversar y personalizar." },
    ],
  },
  {
    slug: "temporadas",
    title: "Temporadas",
    description: "Inspiración para momentos del año y celebraciones temáticas.",
    products: [
      { slug: "diseno-01", title: "Piñata de temporada · diseño 01", description: "[Referencia de catálogo] Marcador de posición para contenido estacional oficial." },
      { slug: "diseno-02", title: "Piñata de temporada · diseño 02", description: "[Referencia de catálogo] Ejemplo visual sujeto a definición posterior." },
      { slug: "diseno-03", title: "Piñata de temporada · diseño 03", description: "[Referencia de catálogo] Punto de partida para una cotización personalizada." },
    ],
  },
  {
    slug: "otros",
    title: "Otros",
    description: "Ideas abiertas para una referencia fuera de las categorías habituales.",
    products: [
      { slug: "diseno-01", title: "Piñata personalizada · diseño 01", description: "[Referencia de catálogo] Espacio para una idea que no encaja en otra categoría." },
      { slug: "diseno-02", title: "Piñata personalizada · diseño 02", description: "[Referencia de catálogo] Diseño de muestra para explorar posibilidades." },
      { slug: "diseno-03", title: "Piñata personalizada · diseño 03", description: "[Referencia de catálogo] Marcador de posición para catálogo futuro." },
    ],
  },
];

export function getCatalogCategory(slug: string) {
  return CATALOG_CATEGORIES.find((category) => category.slug === slug);
}

export function getCatalogProduct(categorySlug: string, productSlug: string) {
  const category = getCatalogCategory(categorySlug);
  const product = category?.products.find((item) => item.slug === productSlug);
  return category && product ? { category, product } : undefined;
}
