import type { Messages } from "../types";

export const validation: Messages["validation"] = {
  invalid: "Valor inválido",
  emailInvalid: "Ingresa un correo válido",
  passwordMin: "La contraseña debe tener al menos 8 caracteres",
  passwordTooLong: "La contraseña es demasiado larga",
  nameRequired: "Ingresa tu nombre",
  passwordRequired: "Ingresa tu contraseña",
  currentPasswordRequired: "Ingresa tu contraseña actual",
  deckNameRequired: "Escribe un nombre",
  deckNameTooLong: "El nombre es demasiado largo",
  deckNameNoSeparator: "El nombre no puede contener ::",
  descriptionTooLong: "La descripción es demasiado larga",
  stepsPositive: "Los pasos deben ser positivos",
  fsrsWeightsCount: "Se esperan al menos 17 parámetros",
  selectDeck: "Selecciona un mazo",
  selectNoteType: "Selecciona un tipo de nota",
};
