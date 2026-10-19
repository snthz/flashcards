import type { Prisma } from "@/generated/prisma/client";
import { defaultLocale, type Locale } from "@/lib/i18n/config";

export const DEFAULT_CSS = `.card {
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 22px;
  text-align: center;
  color: inherit;
  background-color: transparent;
}`;

type DefaultNoteType = {
  name: string;
  kind: "STANDARD" | "CLOZE";
  fields: Array<{ name: string }>;
  templates: Array<{ name: string; qfmt: string; afmt: string }>;
};

const defaultNames: Record<
  Locale,
  { basic: string; reversed: string; front: string; back: string; card: (n: number) => string; text: string; config: string }
> = {
  en: {
    basic: "Basic",
    reversed: "Basic (and reversed card)",
    front: "Front",
    back: "Back",
    card: (n) => `Card ${n}`,
    text: "Text",
    config: "Default",
  },
  es: {
    basic: "Básico",
    reversed: "Básico (y tarjeta invertida)",
    front: "Anverso",
    back: "Reverso",
    card: (n) => `Tarjeta ${n}`,
    text: "Texto",
    config: "Predeterminada",
  },
};

export function defaultConfigName(locale: Locale = defaultLocale) {
  return defaultNames[locale].config;
}

export function defaultNoteTypes(locale: Locale = defaultLocale): DefaultNoteType[] {
  const { basic, reversed, front, back, card, text } = defaultNames[locale];
  return [
    {
      name: basic,
      kind: "STANDARD",
      fields: [{ name: front }, { name: back }],
      templates: [
        {
          name: card(1),
          qfmt: `{{${front}}}`,
          afmt: `{{FrontSide}}\n\n<hr id=answer>\n\n{{${back}}}`,
        },
      ],
    },
    {
      name: reversed,
      kind: "STANDARD",
      fields: [{ name: front }, { name: back }],
      templates: [
        {
          name: card(1),
          qfmt: `{{${front}}}`,
          afmt: `{{FrontSide}}\n\n<hr id=answer>\n\n{{${back}}}`,
        },
        {
          name: card(2),
          qfmt: `{{${back}}}`,
          afmt: `{{FrontSide}}\n\n<hr id=answer>\n\n{{${front}}}`,
        },
      ],
    },
    {
      name: "Cloze",
      kind: "CLOZE",
      fields: [{ name: text }, { name: "Extra" }],
      templates: [
        {
          name: "Cloze",
          qfmt: `{{cloze:${text}}}`,
          afmt: `{{cloze:${text}}}<br>\n{{Extra}}`,
        },
      ],
    },
  ];
}

export function defaultNoteTypeCreateInputs(userId: string, locale: Locale = defaultLocale): Prisma.NoteTypeCreateManyInput[] {
  return defaultNoteTypes(locale).map((noteType) => ({
    userId,
    name: noteType.name,
    kind: noteType.kind,
    css: DEFAULT_CSS,
    fields: noteType.fields,
    templates: noteType.templates,
  }));
}

export function defaultDeckConfigInput(userId: string, locale: Locale = defaultLocale): Prisma.DeckConfigCreateInput {
  return {
    user: { connect: { id: userId } },
    name: defaultConfigName(locale),
    isDefault: true,
  };
}
