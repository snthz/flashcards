import type { NextRequest } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/user";
import { writeAnkiCollection, writeNotesText } from "@/lib/anki/export";
import { collectExport } from "@/lib/export/collect";
import { apkgStream } from "@/lib/export/zip";

const querySchema = z.object({
  deck: z.string().uuid().or(z.literal("")).default(""),
  format: z.enum(["apkg", "txt"]).default("apkg"),
  scheduling: z.enum(["0", "1"]).default("1"),
  media: z.enum(["0", "1"]).default("1"),
});

function attachment(name: string, extension: string) {
  const base = name.replace(/::/g, " - ").replace(/[\\/:*?"<>|\u0000-\u001f]+/g, "_").trim() || "Flashcards";
  const ascii = base.normalize("NFKD").replace(/[^\x20-\x7e]/g, "").replace(/"/g, "") || "Flashcards";
  return `attachment; filename="${ascii}.${extension}"; filename*=UTF-8''${encodeURIComponent(`${base}.${extension}`)}`;
}

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return new Response(null, { status: 401 });
  const parsed = querySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) return new Response(null, { status: 400 });
  const { deck, format, scheduling, media } = parsed.data;

  const bundle = await collectExport(user, {
    deckId: deck || null,
    includeScheduling: format === "apkg" && scheduling === "1",
    includeMedia: format === "apkg" && media === "1",
  });
  if (!bundle) return new Response(null, { status: 404 });

  const headers = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };
  if (format === "txt") {
    return new Response(writeNotesText(bundle.text), {
      headers: { ...headers, "Content-Type": "text/plain; charset=utf-8", "Content-Disposition": attachment(bundle.name, "txt") },
    });
  }
  const collection = await writeAnkiCollection(bundle.input);
  return new Response(apkgStream(collection, bundle.media), {
    headers: { ...headers, "Content-Type": "application/octet-stream", "Content-Disposition": attachment(bundle.name, "apkg") },
  });
}
