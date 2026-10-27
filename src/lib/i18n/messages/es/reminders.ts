import type { Messages } from "../types";

const cards = (count: number) => (count === 1 ? "1 tarjeta" : `${count} tarjetas`);
const days = (count: number) => (count === 1 ? "1 día" : `${count} días`);

export const reminders: Messages["reminders"] = {
  title: "Hora de repasar",
  body: (count) => `Tienes ${cards(count)} ${count === 1 ? "pendiente" : "pendientes"} hoy.`,
  bodyStreak: (count, streak) => `Tienes ${cards(count)} ${count === 1 ? "pendiente" : "pendientes"}. Mantén tu racha de ${days(streak)}.`,
  firstTitles: ["Hora de repasar", "Tus tarjetas te esperan"],
  nudgeTitles: ["¿Un repaso rápido?", "Todavía no repasas hoy"],
  nudgeStreakTitles: (streak) => [`Tu racha de ${days(streak)} te espera`, `No dejes caer tu racha de ${days(streak)}`],
  nudgeBodies: (count, minutes) => [
    `Son ${cards(count)}, ${minutes === 1 ? "un minuto" : `unos ${minutes} min`}.`,
    `Con ${minutes === 1 ? "un minuto" : `${minutes} min`} hoy, mañana será más ligero.`,
  ],
  lastCallTitles: (streak) => [`Tu racha de ${days(streak)} termina esta noche`, "Última oportunidad para tu racha"],
  lastCallBodies: (streak, count) => [
    `Aún estás a tiempo: con 5 tarjetas mantienes tus ${days(streak)}.`,
    `Te ${count === 1 ? "queda" : "quedan"} ${cards(count)}. Unos minutos ahora salvan tu racha de ${days(streak)}.`,
  ],
  testTitle: "Recordatorios activados",
  testBody: "Así se verá tu recordatorio diario.",
};
