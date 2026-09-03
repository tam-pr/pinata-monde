export type CatalogProduct = {
  slug: string;
  title: string;
  description: string;
  /** Optional real product photo (falls back to a placeholder when absent). */
  image?: string;
};

export type CatalogCategory = {
  slug: string;
  title: string;
  description: string;
  /** Optional real cover photo (falls back to a decorative placeholder when absent). */
  image?: string;
  products: CatalogProduct[];
};

export const CATALOG_CATEGORIES: CatalogCategory[] = [
  {
    slug: "paw-patrol",
    title: "Paw Patrol",
    description: "Diseños de Paw Patrol para tu fiesta.",
    image: "/catalog/paw-patrol/cover.webp",
    products: [
      { slug: "marshall", title: "Piñata de Marshall", description: "Diseño de Marshall hecho a mano en el taller de Piñata Monde.", image: "/catalog/paw-patrol/cover.webp" },
      { slug: "skye", title: "Piñata de Skye", description: "Diseño de Skye hecho a mano en el taller de Piñata Monde.", image: "/catalog/paw-patrol/skye.webp" },
    ],
  },
  {
    slug: "preescolar",
    title: "Preescolar",
    description: "Diseños de personajes preescolares para tu fiesta.",
    image: "/catalog/preescolar/cover.webp",
    products: [
      { slug: "rosita-fresita", title: "Piñata de Rosita Fresita", description: "Diseño de Rosita Fresita hecho a mano en el taller de Piñata Monde.", image: "/catalog/preescolar/rosita-fresita.webp" },
      { slug: "poppy", title: "Piñata de Poppy (Trolls)", description: "Diseño de Poppy hecho a mano en el taller de Piñata Monde.", image: "/catalog/preescolar/poppy.webp" },
    ],
  },
  {
    slug: "superheroes",
    title: "Superhéroes",
    description: "Diseños de superhéroes para tu fiesta.",
    image: "/catalog/superheroes/cover.webp",
    products: [
      { slug: "capitan-america", title: "Piñata de Capitán América", description: "Diseño de Capitán América hecho a mano en el taller de Piñata Monde.", image: "/catalog/superheroes/cover.webp" },
      { slug: "spiderman", title: "Piñata de Spiderman", description: "Diseño de Spiderman hecho a mano en el taller de Piñata Monde.", image: "/catalog/superheroes/spiderman.webp" },
      { slug: "spiderman-venom", title: "Piñata de Spiderman y Venom", description: "Diseño de Spiderman y Venom hecho a mano en el taller de Piñata Monde.", image: "/catalog/superheroes/venom.webp" },
    ],
  },
  {
    slug: "princesas",
    title: "Princesas",
    description: "Diseños de princesas para tu fiesta.",
    image: "/catalog/princesas/cover.webp",
    products: [
      { slug: "cenicienta", title: "Piñata de Cenicienta", description: "Diseño de Cenicienta hecho a mano en el taller de Piñata Monde.", image: "/catalog/princesas/cenicienta.webp" },
      { slug: "sirenita", title: "Piñata de la Sirenita", description: "Diseño de la Sirenita hecho a mano en el taller de Piñata Monde.", image: "/catalog/princesas/sirenita.webp" },
      { slug: "jazmin", title: "Piñata de Jazmín", description: "Diseño de Jazmín hecho a mano en el taller de Piñata Monde.", image: "/catalog/princesas/jazmin.webp" },
    ],
  },
  {
    slug: "disney",
    title: "Disney",
    description: "Diseños de personajes Disney para tu fiesta.",
    image: "/catalog/disney/cover.webp",
    products: [
      { slug: "mickey-futbolista", title: "Piñata de Mickey Futbolista", description: "Diseño de Mickey futbolista hecho a mano en el taller de Piñata Monde.", image: "/catalog/disney/mickey-futbolista.webp" },
      { slug: "minnie", title: "Piñata de Minnie Mouse", description: "Diseño de Minnie Mouse hecho a mano en el taller de Piñata Monde.", image: "/catalog/disney/minnie.webp" },
    ],
  },
  {
    slug: "dinosaurios-dragones",
    title: "Dinosaurios y Dragones",
    description: "Diseños de dinosaurios y dragones para tu fiesta.",
    image: "/catalog/dinosaurios-dragones/cover.webp",
    products: [
      { slug: "trex-chiva", title: "Piñata de T-Rex Chivas", description: "Diseño de T-Rex con playera de Chivas hecho a mano en el taller de Piñata Monde.", image: "/catalog/dinosaurios-dragones/trex-chiva.webp" },
    ],
  },
  {
    slug: "videojuegos-youtube",
    title: "Video juegos y YouTube",
    description: "Diseños de videojuegos y YouTube para tu fiesta.",
    image: "/catalog/videojuegos-youtube/cover.webp",
    products: [
      { slug: "mario", title: "Piñata de Mario", description: "Diseño de Mario hecho a mano en el taller de Piñata Monde.", image: "/catalog/videojuegos-youtube/cover.webp" },
      { slug: "bowser", title: "Piñata de Bowser", description: "Diseño de Bowser hecho a mano en el taller de Piñata Monde.", image: "/catalog/videojuegos-youtube/bowser.webp" },
      { slug: "luigi", title: "Piñata de Luigi", description: "Diseño de Luigi hecho a mano en el taller de Piñata Monde.", image: "/catalog/videojuegos-youtube/luigi.webp" },
    ],
  },
  {
    slug: "animalitos",
    title: "Animalitos",
    description: "Diseños de animalitos para tu fiesta.",
    image: "/catalog/animalitos/cover.webp",
    products: [
      { slug: "tiburon-blanco", title: "Piñata de Tiburón Blanco", description: "Diseño de tiburón blanco hecho a mano en el taller de Piñata Monde.", image: "/catalog/animalitos/tiburon-blanco.webp" },
      { slug: "tiburon-martillo", title: "Piñata de Tiburón Martillo", description: "Diseño de tiburón martillo hecho a mano en el taller de Piñata Monde.", image: "/catalog/animalitos/tiburon-martillo.webp" },
      { slug: "leopardo", title: "Piñata de Leopardo", description: "Diseño de leopardo hecho a mano en el taller de Piñata Monde.", image: "/catalog/animalitos/leopardo.webp" },
    ],
  },
  {
    slug: "carros-vehiculos",
    title: "Carros y Vehículos",
    description: "Diseños de carros y vehículos para tu fiesta.",
    image: "/catalog/carros-vehiculos/cover.webp",
    products: [
      { slug: "porsche-911", title: "Piñata de Porsche 911", description: "Diseño de Porsche 911 hecho a mano en el taller de Piñata Monde.", image: "/catalog/carros-vehiculos/cover.webp" },
      { slug: "mustang", title: "Piñata de Mustang Clásico", description: "Diseño de Mustang clásico hecho a mano en el taller de Piñata Monde.", image: "/catalog/carros-vehiculos/mustang.webp" },
      { slug: "rayo-mcqueen", title: "Piñata de Rayo McQueen", description: "Diseño de Rayo McQueen hecho a mano en el taller de Piñata Monde.", image: "/catalog/carros-vehiculos/rayo-mcqueen.webp" },
    ],
  },
  {
    slug: "deportes",
    title: "Deportes",
    description: "Diseños deportivos para tu fiesta.",
    image: "/catalog/deportes/cover.webp",
    products: [
      { slug: "messi", title: "Piñata de Messi", description: "Diseño de Messi hecho a mano en el taller de Piñata Monde.", image: "/catalog/deportes/cover.webp" },
      { slug: "ronaldo", title: "Piñata de Ronaldo", description: "Diseño de Ronaldo hecho a mano en el taller de Piñata Monde.", image: "/catalog/deportes/ronaldo.webp" },
      { slug: "chivas", title: "Piñata de Chivas del Guadalajara", description: "Diseño de Chivas del Guadalajara hecho a mano en el taller de Piñata Monde.", image: "/catalog/deportes/chivas.webp" },
    ],
  },
  {
    slug: "toy-story",
    title: "Toy Story",
    description: "Diseños de Toy Story para tu fiesta.",
    image: "/catalog/toy-story/cover.webp",
    products: [
      { slug: "buzz", title: "Piñata de Buzz Lightyear", description: "Diseño de Buzz Lightyear hecho a mano en el taller de Piñata Monde.", image: "/catalog/toy-story/cover.webp" },
      { slug: "woody", title: "Piñata de Woody", description: "Diseño de Woody hecho a mano en el taller de Piñata Monde.", image: "/catalog/toy-story/woody.webp" },
      { slug: "jessy", title: "Piñata de Jessy", description: "Diseño de Jessy hecho a mano en el taller de Piñata Monde.", image: "/catalog/toy-story/jessy.webp" },
    ],
  },
  {
    slug: "anime-pokemon",
    title: "Anime y Pokemon",
    description: "Diseños de anime y Pokemon para tu fiesta.",
    image: "/catalog/anime-pokemon/cover.webp",
    // No individual product could be confidently matched to a specific
    // image on the source site (filenames are generic); placeholders kept
    // instead of guessing. See migration report.
    products: [
      { slug: "diseno-01", title: "Piñata de Anime y Pokemon · diseño 01", description: "[Referencia de catálogo] Diseño de muestra sin disponibilidad confirmada." },
      { slug: "diseno-02", title: "Piñata de Anime y Pokemon · diseño 02", description: "[Referencia de catálogo] Espacio para una futura pieza de esta categoría." },
      { slug: "diseno-03", title: "Piñata de Anime y Pokemon · diseño 03", description: "[Referencia de catálogo] Idea para conversar y personalizar." },
    ],
  },
  {
    slug: "temporadas",
    title: "Temporadas",
    description: "Diseños de temporada (Navidad, Halloween y más) para tu fiesta.",
    image: "/catalog/temporadas/cover.webp",
    products: [
      { slug: "diseno-01", title: "Piñata de Temporadas · diseño 01", description: "[Referencia de catálogo] Diseño de muestra sin disponibilidad confirmada." },
      { slug: "diseno-02", title: "Piñata de Temporadas · diseño 02", description: "[Referencia de catálogo] Espacio para una futura pieza de esta categoría." },
      { slug: "diseno-03", title: "Piñata de Temporadas · diseño 03", description: "[Referencia de catálogo] Idea para conversar y personalizar." },
    ],
  },
  {
    slug: "comida",
    title: "Comida",
    description: "Diseños de comida para tu fiesta.",
    image: "/catalog/comida/cover.webp",
    products: [
      { slug: "diseno-01", title: "Piñata de Comida · diseño 01", description: "[Referencia de catálogo] Diseño de muestra sin disponibilidad confirmada." },
      { slug: "diseno-02", title: "Piñata de Comida · diseño 02", description: "[Referencia de catálogo] Espacio para una futura pieza de esta categoría." },
      { slug: "diseno-03", title: "Piñata de Comida · diseño 03", description: "[Referencia de catálogo] Idea para conversar y personalizar." },
    ],
  },
  {
    slug: "numeros-letras",
    title: "Números y Letras",
    description: "Diseños de números y letras para tu fiesta.",
    image: "/catalog/numeros-letras/cover.webp",
    products: [
      { slug: "diseno-01", title: "Piñata de Números y Letras · diseño 01", description: "[Referencia de catálogo] Diseño de muestra sin disponibilidad confirmada." },
      { slug: "diseno-02", title: "Piñata de Números y Letras · diseño 02", description: "[Referencia de catálogo] Espacio para una futura pieza de esta categoría." },
      { slug: "diseno-03", title: "Piñata de Números y Letras · diseño 03", description: "[Referencia de catálogo] Idea para conversar y personalizar." },
    ],
  },
  {
    slug: "harry-potter",
    title: "Harry Potter",
    description: "Diseños de Harry Potter para tu fiesta.",
    image: "/catalog/harry-potter/cover.webp",
    products: [
      { slug: "ron-weasley", title: "Piñata de Ron Weasley", description: "Diseño de Ron Weasley hecho a mano en el taller de Piñata Monde.", image: "/catalog/harry-potter/ron-weasley.webp" },
      { slug: "hermione", title: "Piñata de Hermione Granger", description: "Diseño de Hermione Granger hecho a mano en el taller de Piñata Monde.", image: "/catalog/harry-potter/hermione.webp" },
      { slug: "hedwig", title: "Piñata de Hedwig", description: "Diseño de Hedwig hecho a mano en el taller de Piñata Monde.", image: "/catalog/harry-potter/hedwig.webp" },
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
