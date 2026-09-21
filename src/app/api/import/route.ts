import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/user";
import { parseApkg } from "@/lib/anki/apkg";
import { importCollection } from "@/lib/anki/import";

const MAX_BYTES = 1024 * 1024 * 1024;

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Selecciona un archivo .apkg" }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "El archivo es demasiado grande" }, { status: 413 });
  if (!file.name.toLowerCase().endsWith(".apkg") && !file.name.toLowerCase().endsWith(".colpkg")) {
    return NextResponse.json({ error: "Solo se admiten archivos .apkg" }, { status: 400 });
  }

  try {
    const buffer = new Uint8Array(await file.arrayBuffer());
    const parsed = await parseApkg(buffer);
    const summary = await importCollection(user.id, parsed);
    return NextResponse.json({ ok: true, summary });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo importar el archivo";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
