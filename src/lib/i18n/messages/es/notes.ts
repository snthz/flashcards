import type { Messages } from "../types";

export const notes: Messages["notes"] = {
  addTitle: "Añadir nota",
  editTitle: "Editar nota",
  createDeckFirst: "Crea un mazo primero",
  createDeckFirstHint: "Necesitas al menos un mazo para añadir tarjetas.",
  noNoteTypes: "No tienes tipos de nota.",
  deck: "Mazo",
  noteType: "Tipo de nota",
  clozeHint: "Usa {{c1::texto}} para crear huecos. Se admite HTML.",
  tags: "Etiquetas",
  tagsHint: "Separadas por espacios.",
  deleteConfirm: "¿Eliminar esta nota y todas sus tarjetas?",
  deleteNote: "Eliminar nota",
  add: "Añadir",
  invalidDeckOrNoteType: "Mazo o tipo de nota no válido",
  fieldsEmpty: "Escribe al menos un campo",
  added: (count: number) => (count === 1 ? "Nota añadida (1 tarjeta)" : `Nota añadida (${count} tarjetas)`),
  saved: "Nota guardada",
  noteNotFound: "Nota no encontrada",
  emptyPreview: "(vacío)",
};
