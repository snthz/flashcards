import type { StudyOp, SyncResponse } from "../types";
import { clearPacks, deleteOps, listPacks, loadOps, putOps, setMeta } from "./store";

const BATCH = 200;
const KEEP_SYNCED_MS = 3 * 86_400_000;
const CHANNEL = "fc-study-sync";

export interface FlushResult {
  ok: boolean;
  pending: number;
}

const listeners = new Set<() => void>();
let channel: BroadcastChannel | null = null;
let inflight: Promise<FlushResult> | null = null;

function ensureChannel() {
  if (channel || typeof BroadcastChannel === "undefined") return;
  channel = new BroadcastChannel(CHANNEL);
  channel.onmessage = () => listeners.forEach((listener) => listener());
}

function notify() {
  listeners.forEach((listener) => listener());
  channel?.postMessage("changed");
}

export function subscribeSync(listener: () => void) {
  ensureChannel();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function wireOp(op: StudyOp): StudyOp {
  return { ...op, syncedAt: undefined };
}

async function prune(userId: string, ops: StudyOp[]) {
  const packs = await listPacks(userId);
  const oldestPack = packs.reduce((min, pack) => Math.min(min, Date.parse(pack.fetchedAt)), Number.POSITIVE_INFINITY);
  const cutoff = Date.now() - KEEP_SYNCED_MS;
  const stale = ops
    .filter((op) => op.syncedAt && (Date.parse(op.syncedAt) <= oldestPack || Date.parse(op.syncedAt) < cutoff))
    .map((op) => op.id);
  if (stale.length > 0) await deleteOps(stale);
}

async function run(userId: string): Promise<FlushResult> {
  const ops = await loadOps(userId);
  const pending = ops.filter((op) => !op.syncedAt);
  if (pending.length === 0) {
    await prune(userId, ops);
    return { ok: true, pending: 0 };
  }
  if (typeof navigator !== "undefined" && navigator.onLine === false) return { ok: false, pending: pending.length };
  let remaining = pending.length;
  try {
    for (let i = 0; i < pending.length; i += BATCH) {
      const batch = pending.slice(i, i + BATCH);
      const response = await fetch("/api/study/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ops: batch.map(wireOp) }),
        cache: "no-store",
        keepalive: batch.length <= 50,
      });
      if (response.status === 400) {
        await deleteOps(batch.map((op) => op.id));
        remaining -= batch.length;
        continue;
      }
      if (!response.ok) break;
      const body = (await response.json()) as SyncResponse;
      const byId = new Map(batch.map((op) => [op.id, op]));
      const synced: StudyOp[] = [];
      const rejected: string[] = [];
      for (const result of body.results) {
        const op = byId.get(result.id);
        if (!op) continue;
        if (result.status === "applied" || result.status === "duplicate") synced.push({ ...op, syncedAt: body.serverTime });
        else if (result.status !== "error") rejected.push(op.id);
      }
      await putOps(synced);
      await deleteOps(rejected);
      remaining -= synced.length + rejected.length;
    }
  } catch {
    return { ok: false, pending: remaining };
  } finally {
    notify();
  }
  await prune(userId, await loadOps(userId));
  return { ok: remaining === 0, pending: remaining };
}

export function flushOps(userId: string) {
  inflight ??= run(userId).finally(() => {
    inflight = null;
  });
  return inflight;
}

export async function pendingCount(userId: string) {
  return (await loadOps(userId)).filter((op) => !op.syncedAt).length;
}

export async function forgetOfflineData() {
  await clearPacks();
  await setMeta("userId", null);
}
