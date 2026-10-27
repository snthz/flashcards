import type { Messages } from "../types";

export const notifications: Messages["notifications"] = {
  title: "Notificaciones",
  open: "Notificaciones",
  short: "Avisos",
  unread: (count) => (count === 1 ? "1 sin leer" : `${count} sin leer`),
  markAllRead: "Marcar todo como leído",
  empty: "Estás al día",
  emptyHint: "Aquí aparecen los recordatorios de tus tareas y de tus sesiones de estudio.",
  agenda: "Abrir agenda",
  justNow: "Ahora",
};
