import { prisma } from "@/lib/db";
import { DEFAULT_CSS, defaultNoteTypes } from "@/lib/defaults";
import { locales, type Locale } from "@/lib/i18n/config";

export function textToField(text: string) {
  return text
    .trim()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\r?\n/g, "<br>");
}

export async function ensureBasicNoteType(userId: string, locale: Locale, reversed: boolean) {
  const index = reversed ? 1 : 0;
  const names = locales.map((code) => defaultNoteTypes(code)[index].name);
  const existing = await prisma.noteType.findFirst({
    where: { userId, kind: "STANDARD", name: { in: names } },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  if (existing) return existing.id;
  const template = defaultNoteTypes(locale)[index];
  const created = await prisma.noteType.create({
    data: { userId, name: template.name, kind: template.kind, css: DEFAULT_CSS, fields: template.fields, templates: template.templates },
    select: { id: true },
  });
  return created.id;
}
