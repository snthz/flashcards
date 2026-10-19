import type { Messages } from "../types";

export const nav: Messages["nav"] = {
  decks: "Mazos",
  discover: "Descubrir",
  browse: "Explorar",
  stats: "Estadísticas",
  statsShort: "Stats",
  settings: "Ajustes",
  signedInAs: (name) => `Sesión de ${name}`,
  logout: "Cerrar sesión",
  primary: "Navegación principal",
};
