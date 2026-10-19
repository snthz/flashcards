import type { Messages } from "../types";

export const discover: Messages["discover"] = {
  title: "Descubrir",
  description: "Mazos listos para estudiar. Añádelos a tu colección con un toque.",
  added: "Añadido",
  cardCount: (count, formatted) => (count === 1 ? "1 tarjeta" : `${formatted} tarjetas`),
  comingSoon: "Pronto habrá más mazos: verbos irregulares, usos de “get” y más.",
  sampleCards: "Algunas tarjetas",
  subdecks: "Submazos",
  openDeck: "Abrir mazo",
  updated: "Actualizado",
  updateContent: "Actualizar contenido",
  adding: "Añadiendo…",
  addToDecks: "Añadir a mis mazos",
  unavailable: "Este mazo ya no está disponible",
  installFailed: "No se pudo añadir el mazo. Inténtalo de nuevo.",
};
