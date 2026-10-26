import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/user";
import { applyStudyOps } from "@/lib/study/apply";
import type { StudyOp, SyncResponse } from "@/lib/study/types";

const base = {
  id: z.string().uuid(),
  userId: z.string().uuid(),
  cardId: z.string().uuid(),
  at: z.string().datetime({ offset: true }),
};

const opSchema = z.discriminatedUnion("kind", [
  z.object({ ...base, kind: z.literal("review"), rating: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]), durationMs: z.number().finite().min(0) }),
  z.object({ ...base, kind: z.literal("bury") }),
  z.object({ ...base, kind: z.literal("suspend") }),
  z.object({ ...base, kind: z.literal("flag"), flag: z.number().int().min(0).max(7) }),
]);

const bodySchema = z.object({ ops: z.array(opSchema).max(500) });

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "invalid" }, { status: 400 });
  const results = await applyStudyOps(user, parsed.data.ops as StudyOp[]);
  const body: SyncResponse = { serverTime: new Date().toISOString(), results };
  return Response.json(body, { headers: { "Cache-Control": "no-store" } });
}
