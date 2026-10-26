import type { Messages } from "../types";

export const reminders: Messages["reminders"] = {
  title: "Hora de repasar",
  body: (count) => (count === 1 ? "Tienes 1 tarjeta pendiente hoy." : `Tienes ${count} tarjetas pendientes hoy.`),
  bodyStreak: (count, days) => `${count === 1 ? "Tienes 1 tarjeta pendiente" : `Tienes ${count} tarjetas pendientes`}. Mantén tu racha de ${days} días.`,
  testTitle: "Recordatorios activados",
  testBody: "Así se verá tu recordatorio diario.",
};
