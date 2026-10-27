import { prisma } from "@/lib/db";
import { locales, type Locale } from "@/lib/i18n/config";
import type { LanguageCode } from "./types";
import { noteTypeName, vocabularyNoteType } from "./vocabulary";

export async function ensureVocabularyNoteType(userId: string, language: LanguageCode, locale: Locale) {
  const existing = await prisma.noteType.findFirst({
    where: { userId, kind: "STANDARD", name: { in: locales.map((code) => noteTypeName(language, code)) } },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  if (existing) return existing.id;
  const template = vocabularyNoteType(language, locale);
  const created = await prisma.noteType.create({
    data: { userId, name: template.name, kind: "STANDARD", css: template.css, fields: template.fields, templates: template.templates },
    select: { id: true },
  });
  return created.id;
}
