import type { Messages } from "../types";

export const nav: Messages["nav"] = {
  decks: "Mazos",
  discover: "Descubrir",
  browse: "Explorar",
  stats: "Estadísticas",
  statsShort: "Stats",
  settings: "Ajustes",
  translate: "Traducir",
  import: "Importar",
  account: "Cuenta",
  logout: "Cerrar sesión",
  primary: "Navegación principal",
  search: "Buscar…",
  searchLabel: "Buscar notas y secciones",
  searchPlaceholder: "Busca en tus notas o salta a una sección",
  searchNotes: (query) => `Buscar “${query}” en tus notas`,
  goTo: "Ir a",
  noResults: "No hay coincidencias.",
  paletteHint: "↑↓ para moverte · Enter para abrir · Esc para cerrar",
};
