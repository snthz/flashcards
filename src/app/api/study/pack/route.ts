import type { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/user";
import { getLocale } from "@/lib/i18n/server";
import { buildStudyPack } from "@/lib/study/queue";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });
  const deckId = request.nextUrl.searchParams.get("deck") ?? "";
  if (!UUID_RE.test(deckId)) return Response.json({ error: "invalid" }, { status: 400 });
  const pack = await buildStudyPack(user, deckId, await getLocale());
  if (!pack) return Response.json({ error: "not_found" }, { status: 404 });
  return Response.json(pack, { headers: { "Cache-Control": "no-store" } });
}
