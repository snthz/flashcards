import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/user";
import { ApkgError, parseApkg } from "@/lib/anki/apkg";
import { importCollection } from "@/lib/anki/import";
import { getI18n } from "@/lib/i18n/server";

const MAX_BYTES = 1024 * 1024 * 1024;

export async function POST(request: Request) {
  const { locale, t } = await getI18n();
  const errors = t.importer.errors;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: errors.unauthorized }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: errors.missingFile }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: errors.tooLarge }, { status: 413 });
  if (!file.name.toLowerCase().endsWith(".apkg") && !file.name.toLowerCase().endsWith(".colpkg")) {
    return NextResponse.json({ error: errors.unsupportedType }, { status: 400 });
  }

  try {
    const buffer = new Uint8Array(await file.arrayBuffer());
    const parsed = await parseApkg(buffer, {
      fallbackNames: { deckConfig: t.importer.defaults.importedDeckConfig, noteType: t.importer.defaults.noteType },
    });
    const summary = await importCollection(user.id, parsed, locale);
    return NextResponse.json({ ok: true, summary });
  } catch (error) {
    const message = error instanceof ApkgError ? errors[error.code] : error instanceof Error ? error.message : errors.failed;
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
