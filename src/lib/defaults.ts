import type { Prisma } from "@/generated/prisma/client";

export const DEFAULT_CSS = `.card {
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 22px;
  text-align: center;
  color: inherit;
  background-color: transparent;
}`;

export const defaultNoteTypes: Array<{
  name: string;
  kind: "STANDARD" | "CLOZE";
  fields: Array<{ name: string }>;
  templates: Array<{ name: string; qfmt: string; afmt: string }>;
}> = [
  {
    name: "Básico",
    kind: "STANDARD",
    fields: [{ name: "Anverso" }, { name: "Reverso" }],
    templates: [
      {
        name: "Tarjeta 1",
        qfmt: "{{Anverso}}",
        afmt: "{{FrontSide}}\n\n<hr id=answer>\n\n{{Reverso}}",
      },
    ],
  },
  {
    name: "Básico (y tarjeta invertida)",
    kind: "STANDARD",
    fields: [{ name: "Anverso" }, { name: "Reverso" }],
    templates: [
      {
        name: "Tarjeta 1",
        qfmt: "{{Anverso}}",
        afmt: "{{FrontSide}}\n\n<hr id=answer>\n\n{{Reverso}}",
      },
      {
        name: "Tarjeta 2",
        qfmt: "{{Reverso}}",
        afmt: "{{FrontSide}}\n\n<hr id=answer>\n\n{{Anverso}}",
      },
    ],
  },
  {
    name: "Cloze",
    kind: "CLOZE",
    fields: [{ name: "Texto" }, { name: "Extra" }],
    templates: [
      {
        name: "Cloze",
        qfmt: "{{cloze:Texto}}",
        afmt: "{{cloze:Texto}}<br>\n{{Extra}}",
      },
    ],
  },
];

export function defaultNoteTypeCreateInputs(userId: string): Prisma.NoteTypeCreateManyInput[] {
  return defaultNoteTypes.map((noteType) => ({
    userId,
    name: noteType.name,
    kind: noteType.kind,
    css: DEFAULT_CSS,
    fields: noteType.fields,
    templates: noteType.templates,
  }));
}

export function defaultDeckConfigInput(userId: string): Prisma.DeckConfigCreateInput {
  return {
    user: { connect: { id: userId } },
    name: "Predeterminada",
    isDefault: true,
  };
}
