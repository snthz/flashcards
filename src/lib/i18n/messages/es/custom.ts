import type { Messages } from "../types";

const FLAGS = ["", "Roja", "Naranja", "Verde", "Azul", "Rosa", "Turquesa", "Morada"];

export const custom: Messages["custom"] = {
  button: "Estudio personalizado",
  title: "Estudio personalizado",
  description: "Estudia fuera del programa de hoy. Tus respuestas igual reprograman las tarjetas.",
  forgotten: "Repasar tarjetas olvidadas",
  forgottenHint: "Las que respondiste con Otra vez hace poco.",
  ahead: "Adelantar repasos",
  aheadHint: "Repasos que vencen pronto, antes de su fecha.",
  extraNew: "Estudiar más tarjetas nuevas",
  extraNewHint: "Supera el límite de nuevas de hoy.",
  tag: "Estudiar por etiqueta",
  tagHint: "Todas las tarjetas con la etiqueta, en cualquier estado.",
  flag: "Estudiar tarjetas marcadas",
  flagHint: "Todas las tarjetas con esa marca.",
  lastDays: (days) => (days === 1 ? "Último día" : `Últimos ${days} días`),
  nextDays: (days) => (days === 1 ? "Próximo día" : `Próximos ${days} días`),
  cards: (count) => `${count} tarjetas`,
  noTags: "Este mazo no tiene etiquetas",
  flagName: (flag) => FLAGS[flag] ?? String(flag),
  start: "Empezar",
  finished: "Terminaste la sesión personalizada",
  badge: (study) => {
    switch (study.mode) {
      case "forgotten":
        return `Olvidadas · ${study.days === 1 ? "1 día" : `${study.days} días`}`;
      case "ahead":
        return `Adelantar · ${study.days === 1 ? "1 día" : `${study.days} días`}`;
      case "new":
        return `+${study.count} nuevas`;
      case "tag":
        return `#${study.tag}`;
      default:
        return `Marca ${(FLAGS[study.flag ?? 0] ?? "").toLowerCase()}`;
    }
  },
};
