import type { Messages } from "../types";

export const offline: Messages["offline"] = {
  title: "Sin conexión",
  body: "Necesitas conexión para sincronizar tu progreso. Cuando vuelvas a estar en línea, recarga la página.",
  studyTitle: "Estudiar sin conexión",
  studyLead: "Estos mazos están guardados en este dispositivo. Tus respuestas se sincronizan solas cuando vuelvas a tener conexión.",
  savedAt: (time) => `Guardado ${time}`,
  nothingDue: "Nada pendiente para hoy",
  noSavedDecks: "Todavía no hay mazos guardados en este dispositivo. Abre tus mazos con conexión y las tarjetas del día quedarán disponibles sin conexión.",
  retry: "Reintentar",
};
