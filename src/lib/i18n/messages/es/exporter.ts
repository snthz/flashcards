import type { Messages } from "../types";

export const exporter: Messages["exporter"] = {
  export: "Exportar",
  title: "Exportar mazo",
  allTitle: "Exportar todos los mazos",
  description: (name) => `Descarga «${name}» junto con sus submazos.`,
  allDescription: "Descarga todos los mazos de tu cuenta.",
  format: "Formato",
  formatApkg: "Paquete de Anki (.apkg)",
  formatApkgHint: "Se abre en Anki y se puede volver a importar aquí, con plantillas y estilos.",
  formatTxt: "Notas en texto plano (.txt)",
  formatTxtHint: "Separado por tabuladores, una nota por línea. Anki también puede importarlo.",
  includeScheduling: "Incluir la programación",
  includeSchedulingHint: "Conserva fechas, intervalos, marcas e historial de repasos.",
  includeMedia: "Incluir multimedia",
  includeMediaHint: "Imágenes y audio que usan las tarjetas.",
  download: "Descargar",
  preparing: "Preparando el archivo…",
  backupTitle: "Copia de seguridad",
  backupDescription: "Descarga todos tus mazos como paquete de Anki, con progreso y multimedia, para tener siempre una copia.",
  exportAll: "Exportar todos los mazos",
};
