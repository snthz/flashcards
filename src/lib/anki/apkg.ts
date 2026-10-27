import { unzipSync } from "fflate";
import { decompress } from "fzstd";
import initSqlJs, { type Database, type SqlJsStatic } from "sql.js";
import { decodeMessage, getMessage, getRepeatedMessages, getString, getVarint, type ProtoMessage } from "./protobuf";
import type {
  ParsedCard,
  ParsedCollection,
  ParsedDeck,
  ParsedDeckConfig,
  ParsedMedia,
  ParsedNote,
  ParsedNoteType,
  ParsedReview,
} from "./types";

const FIELD_SEPARATOR = "\x1f";
const decoder = new TextDecoder();

let sqlPromise: Promise<SqlJsStatic> | null = null;

export function getSql() {
  if (!sqlPromise) sqlPromise = initSqlJs();
  return sqlPromise;
}

type Row = Record<string, unknown>;

function query(db: Database, sql: string): Row[] {
  const rows: Row[] = [];
  const statement = db.prepare(sql);
  try {
    while (statement.step()) rows.push(statement.getAsObject() as Row);
  } finally {
    statement.free();
  }
  return rows;
}

function tableExists(db: Database, name: string) {
  const rows = query(db, `SELECT name FROM sqlite_master WHERE type='table' AND name='${name}'`);
  return rows.length > 0;
}

function asBigInt(value: unknown) {
  if (typeof value === "bigint") return value;
  if (typeof value === "number") return BigInt(Math.trunc(value));
  if (typeof value === "string") return BigInt(value);
  return 0n;
}

function asNumber(value: unknown, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "bigint") return Number(value);
  if (typeof value === "string" && value !== "") return Number(value);
  return fallback;
}

function asString(value: unknown) {
  return typeof value === "string" ? value : value == null ? "" : String(value);
}

function asBytes(value: unknown) {
  return value instanceof Uint8Array ? value : new Uint8Array();
}

function packedFloats(message: ProtoMessage, field: number) {
  const entries = message.get(field) ?? [];
  const values: number[] = [];
  for (const entry of entries) {
    if (entry.fixed32 != null) {
      const view = new DataView(new ArrayBuffer(4));
      view.setUint32(0, entry.fixed32, true);
      values.push(view.getFloat32(0, true));
    } else if (entry.bytes) {
      const view = new DataView(entry.bytes.buffer, entry.bytes.byteOffset, entry.bytes.byteLength);
      for (let i = 0; i + 4 <= entry.bytes.byteLength; i += 4) values.push(view.getFloat32(i, true));
    }
  }
  return values;
}

function floatField(message: ProtoMessage, field: number, fallback: number) {
  const values = packedFloats(message, field);
  return values.length > 0 && Number.isFinite(values[0]) ? values[0] : fallback;
}

export function defaultDeckConfig(ankiId: bigint, name: string): ParsedDeckConfig {
  return {
    ankiId,
    name,
    newPerDay: 20,
    reviewsPerDay: 200,
    learningSteps: [1, 10],
    relearningSteps: [10],
    graduatingInterval: 1,
    easyInterval: 4,
    startingEase: 2500,
    easyBonus: 1.3,
    hardMultiplier: 1.2,
    intervalModifier: 1,
    lapseMultiplier: 0,
    minLapseInterval: 1,
    maxInterval: 36500,
    leechThreshold: 8,
    leechAction: "TAG",
    desiredRetention: 0.9,
    fsrsWeights: [],
    algorithm: "SM2",
  };
}

function sanitizeSteps(steps: unknown, fallback: number[]) {
  if (!Array.isArray(steps)) return fallback;
  const values = steps.map((s) => Number(s)).filter((s) => Number.isFinite(s) && s > 0 && s <= 60 * 24 * 365);
  return values.length > 0 ? values : fallback;
}

function clampInt(value: number, min: number, max: number, fallback: number) {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, Math.round(value)));
}

function numberList(value: unknown) {
  return Array.isArray(value) ? value.map(Number).filter((n) => Number.isFinite(n)) : [];
}

function legacyFsrsWeights(conf: Record<string, unknown>) {
  for (const key of ["fsrsParams6", "fsrsParams5", "fsrsWeights"]) {
    const weights = numberList(conf[key]);
    if (weights.length >= 17) return weights;
  }
  return [];
}

function parseLegacyDeckConfigs(json: string, fallbackName: string, fsrsEnabled: boolean): ParsedDeckConfig[] {
  const raw = JSON.parse(json || "{}") as Record<string, Record<string, unknown>>;
  return Object.values(raw).map((conf) => {
    const id = asBigInt(conf.id);
    const base = defaultDeckConfig(id, asString(conf.name) || fallbackName);
    const fresh = (conf.new ?? {}) as Record<string, unknown>;
    const rev = (conf.rev ?? {}) as Record<string, unknown>;
    const lapse = (conf.lapse ?? {}) as Record<string, unknown>;
    const ints = Array.isArray(fresh.ints) ? fresh.ints.map(Number) : [];
    return {
      ...base,
      newPerDay: clampInt(asNumber(fresh.perDay, 20), 0, 9999, 20),
      reviewsPerDay: clampInt(asNumber(rev.perDay, 200), 0, 99999, 200),
      learningSteps: sanitizeSteps(fresh.delays, base.learningSteps),
      relearningSteps: Array.isArray(lapse.delays) && lapse.delays.length === 0 ? [] : sanitizeSteps(lapse.delays, base.relearningSteps),
      graduatingInterval: clampInt(ints[0] ?? 1, 1, 3650, 1),
      easyInterval: clampInt(ints[1] ?? 4, 1, 3650, 4),
      startingEase: clampInt(asNumber(fresh.initialFactor, 2500), 1300, 5000, 2500),
      easyBonus: Number.isFinite(asNumber(rev.ease4)) && asNumber(rev.ease4) >= 1 ? asNumber(rev.ease4) : 1.3,
      hardMultiplier: asNumber(rev.hardFactor, 1.2) >= 1 ? asNumber(rev.hardFactor, 1.2) : 1.2,
      intervalModifier: asNumber(rev.ivlFct, 1) > 0 ? asNumber(rev.ivlFct, 1) : 1,
      lapseMultiplier: Math.min(1, Math.max(0, asNumber(lapse.mult, 0))),
      minLapseInterval: clampInt(asNumber(lapse.minInt, 1), 1, 3650, 1),
      maxInterval: clampInt(asNumber(rev.maxIvl, 36500), 1, 36500, 36500),
      leechThreshold: clampInt(asNumber(lapse.leechFails, 8), 0, 9999, 8),
      leechAction: asNumber(lapse.leechAction, 1) === 0 ? "SUSPEND" : "TAG",
      desiredRetention: Math.min(0.99, Math.max(0.7, asNumber(conf.desiredRetention, 0.9))),
      fsrsWeights: legacyFsrsWeights(conf),
      algorithm: conf.fcAlgorithm === "FSRS" || (conf.fcAlgorithm == null && fsrsEnabled) ? "FSRS" : "SM2",
    };
  });
}

function legacyFsrsEnabled(json: string) {
  try {
    return (JSON.parse(json || "{}") as Record<string, unknown>).fsrs === true;
  } catch {
    return false;
  }
}

function parseModernDeckConfigs(db: Database, fallbackName: string): ParsedDeckConfig[] {
  if (!tableExists(db, "deck_config")) return [];
  return query(db, "SELECT id, name, config FROM deck_config").map((row) => {
    const id = asBigInt(row.id);
    const base = defaultDeckConfig(id, asString(row.name) || fallbackName);
    const config = decodeMessage(asBytes(row.config));
    const learn = packedFloats(config, 1);
    const relearn = packedFloats(config, 2);
    const hasRelearn = config.has(2);
    return {
      ...base,
      learningSteps: sanitizeSteps(learn, base.learningSteps),
      relearningSteps: hasRelearn && relearn.length === 0 ? [] : sanitizeSteps(relearn, base.relearningSteps),
      newPerDay: clampInt(getVarint(config, 9, 20), 0, 9999, 20),
      reviewsPerDay: clampInt(getVarint(config, 10, 200), 0, 99999, 200),
      startingEase: clampInt(floatField(config, 13, 2.5) * 1000, 1300, 5000, 2500),
      easyBonus: Math.max(1, floatField(config, 14, 1.3)),
      hardMultiplier: Math.max(1, floatField(config, 15, 1.2)),
      lapseMultiplier: Math.min(1, Math.max(0, floatField(config, 16, 0))),
      intervalModifier: Math.max(0.1, floatField(config, 17, 1)),
      maxInterval: clampInt(getVarint(config, 18, 36500), 1, 36500, 36500),
      minLapseInterval: clampInt(getVarint(config, 19, 1), 1, 3650, 1),
      graduatingInterval: clampInt(getVarint(config, 20, 1), 1, 3650, 1),
      easyInterval: clampInt(getVarint(config, 21, 4), 1, 3650, 4),
      leechAction: getVarint(config, 24, 1) === 0 ? "SUSPEND" : "TAG",
      leechThreshold: clampInt(getVarint(config, 25, 8), 0, 9999, 8),
    };
  });
}

function parseLegacyNoteTypes(json: string, fallbackName: string): ParsedNoteType[] {
  const raw = JSON.parse(json || "{}") as Record<string, Record<string, unknown>>;
  return Object.values(raw).map((model) => {
    const flds = (Array.isArray(model.flds) ? model.flds : []) as Array<Record<string, unknown>>;
    const tmpls = (Array.isArray(model.tmpls) ? model.tmpls : []) as Array<Record<string, unknown>>;
    return {
      ankiId: asBigInt(model.id),
      name: asString(model.name) || fallbackName,
      kind: asNumber(model.type) === 1 ? "CLOZE" : "STANDARD",
      css: asString(model.css),
      fields: [...flds].sort((a, b) => asNumber(a.ord) - asNumber(b.ord)).map((f) => ({ name: asString(f.name) })),
      templates: [...tmpls]
        .sort((a, b) => asNumber(a.ord) - asNumber(b.ord))
        .map((t) => ({ name: asString(t.name), qfmt: asString(t.qfmt), afmt: asString(t.afmt) })),
      sortFieldIdx: asNumber(model.sortf),
      latexPre: asString(model.latexPre),
      latexPost: asString(model.latexPost),
    };
  });
}

function parseModernNoteTypes(db: Database, fallbackName: string): ParsedNoteType[] {
  const fieldsByType = new Map<string, Array<{ ord: number; name: string }>>();
  for (const row of query(db, "SELECT ntid, ord, name FROM fields")) {
    const key = asBigInt(row.ntid).toString();
    const list = fieldsByType.get(key) ?? [];
    list.push({ ord: asNumber(row.ord), name: asString(row.name) });
    fieldsByType.set(key, list);
  }
  const templatesByType = new Map<string, Array<{ ord: number; name: string; qfmt: string; afmt: string }>>();
  for (const row of query(db, "SELECT ntid, ord, name, config FROM templates")) {
    const key = asBigInt(row.ntid).toString();
    const config = decodeMessage(asBytes(row.config));
    const list = templatesByType.get(key) ?? [];
    list.push({ ord: asNumber(row.ord), name: asString(row.name), qfmt: getString(config, 1), afmt: getString(config, 2) });
    templatesByType.set(key, list);
  }
  return query(db, "SELECT id, name, config FROM notetypes").map((row) => {
    const id = asBigInt(row.id);
    const key = id.toString();
    const config = decodeMessage(asBytes(row.config));
    return {
      ankiId: id,
      name: asString(row.name) || fallbackName,
      kind: getVarint(config, 1) === 1 ? "CLOZE" : "STANDARD",
      css: getString(config, 3),
      fields: (fieldsByType.get(key) ?? []).sort((a, b) => a.ord - b.ord).map((f) => ({ name: f.name })),
      templates: (templatesByType.get(key) ?? [])
        .sort((a, b) => a.ord - b.ord)
        .map((t) => ({ name: t.name, qfmt: t.qfmt, afmt: t.afmt })),
      sortFieldIdx: getVarint(config, 2),
      latexPre: getString(config, 5),
      latexPost: getString(config, 6),
    };
  });
}

function parseLegacyDecks(json: string): ParsedDeck[] {
  const raw = JSON.parse(json || "{}") as Record<string, Record<string, unknown>>;
  return Object.values(raw)
    .filter((deck) => asNumber(deck.dyn) !== 1)
    .map((deck) => ({
      ankiId: asBigInt(deck.id),
      name: asString(deck.name).replace(/\x1f/g, "::"),
      description: asString(deck.desc),
      configAnkiId: deck.conf != null ? asBigInt(deck.conf) : null,
    }));
}

function parseModernDecks(db: Database): ParsedDeck[] {
  const decks: ParsedDeck[] = [];
  for (const row of query(db, "SELECT id, name, kind FROM decks")) {
    const kind = decodeMessage(asBytes(row.kind));
    const normal = getMessage(kind, 1);
    if (!normal) continue;
    decks.push({
      ankiId: asBigInt(row.id),
      name: asString(row.name).replace(/\x1f/g, "::"),
      description: getString(normal, 4),
      configAnkiId: normal.has(1) ? BigInt(getVarint(normal, 1)) : null,
    });
  }
  return decks;
}

function parseNotes(db: Database): ParsedNote[] {
  return query(db, "SELECT id, guid, mid, tags, flds FROM notes").map((row) => ({
    ankiId: asBigInt(row.id),
    guid: asString(row.guid),
    noteTypeAnkiId: asBigInt(row.mid),
    fields: asString(row.flds).split(FIELD_SEPARATOR),
    tags: asString(row.tags)
      .split(/\s+/)
      .map((t) => t.trim())
      .filter(Boolean),
  }));
}

function parseCards(db: Database, crtSeconds: number, now: Date): ParsedCard[] {
  const crtMs = crtSeconds * 1000;
  const dayMs = 86_400_000;
  const rows = query(
    db,
    "SELECT id, nid, did, ord, type, queue, due, ivl, factor, reps, lapses, left, odue, odid, flags, data FROM cards",
  );
  return rows.map((row) => {
    const odid = asBigInt(row.odid);
    const inFiltered = odid !== 0n;
    const deckAnkiId = inFiltered ? odid : asBigInt(row.did);
    const rawDue = inFiltered ? asNumber(row.odue) : asNumber(row.due);
    const type = asNumber(row.type);
    const queue = asNumber(row.queue);
    const ivlRaw = asNumber(row.ivl);
    const interval = ivlRaw < 0 ? Math.max(0, -ivlRaw / 86_400) : ivlRaw;
    const left = asNumber(row.left);
    const remaining = left % 1000;
    const total = Math.floor(left / 1000);
    const step = total > 0 && remaining > 0 ? Math.max(0, total - remaining) : 0;
    let state: ParsedCard["state"] = "NEW";
    let due = now;
    let newPosition = 0;
    if (type === 0) {
      state = "NEW";
      newPosition = rawDue;
    } else if (type === 1 || type === 3) {
      state = type === 1 ? "LEARNING" : "RELEARNING";
      if (rawDue > 1_000_000_000) due = new Date(rawDue * 1000);
      else if (rawDue > 0 && rawDue < 100_000) due = new Date(crtMs + rawDue * dayMs);
      if (Number.isNaN(due.getTime())) due = now;
    } else {
      state = "REVIEW";
      due = rawDue > 100_000 ? new Date(rawDue * 1000) : new Date(crtMs + rawDue * dayMs);
      if (Number.isNaN(due.getTime())) due = now;
    }
    let stability: number | null = null;
    let difficulty: number | null = null;
    const data = asString(row.data);
    if (data.startsWith("{")) {
      try {
        const parsed = JSON.parse(data) as Record<string, unknown>;
        if (typeof parsed.s === "number" && parsed.s > 0) stability = parsed.s;
        if (typeof parsed.d === "number" && parsed.d > 0) difficulty = parsed.d;
      } catch {
        stability = null;
      }
    }
    const factor = asNumber(row.factor);
    return {
      ankiId: asBigInt(row.id),
      noteAnkiId: asBigInt(row.nid),
      deckAnkiId,
      ord: asNumber(row.ord),
      state,
      due,
      newPosition,
      interval: state === "REVIEW" || state === "RELEARNING" ? Math.max(0, interval) : 0,
      ease: factor >= 1300 ? factor : 2500,
      reps: asNumber(row.reps),
      lapses: asNumber(row.lapses),
      step,
      stability,
      difficulty,
      suspended: queue === -1,
      buried: queue === -2 || queue === -3,
      flag: asNumber(row.flags) & 7,
    };
  });
}

function parseReviews(db: Database): ParsedReview[] {
  if (!tableExists(db, "revlog")) return [];
  return query(db, "SELECT id, cid, ease, ivl, lastIvl, factor, time, type FROM revlog").map((row) => ({
    id: asBigInt(row.id),
    cardAnkiId: asBigInt(row.cid),
    ease: asNumber(row.ease),
    interval: asNumber(row.ivl),
    lastInterval: asNumber(row.lastIvl),
    factor: asNumber(row.factor),
    timeMs: asNumber(row.time),
    type: asNumber(row.type),
  }));
}

function parseMediaMap(files: Record<string, Uint8Array>, zstd: boolean): Map<string, string> {
  const map = new Map<string, string>();
  const raw = files.media;
  if (!raw) return map;
  let text: string | null = null;
  if (!zstd) {
    try {
      text = decoder.decode(raw);
      const json = JSON.parse(text) as Record<string, string>;
      for (const [index, name] of Object.entries(json)) map.set(index, name);
      return map;
    } catch {
      text = null;
    }
  }
  const bytes = zstd || text === null ? safeDecompress(raw) : raw;
  const message = decodeMessage(bytes);
  getRepeatedMessages(message, 1).forEach((entry, index) => {
    map.set(String(index), getString(entry, 1));
  });
  return map;
}

function safeDecompress(data: Uint8Array) {
  try {
    return decompress(data);
  } catch {
    return data;
  }
}

function isZstd(data: Uint8Array) {
  return data.length >= 4 && data[0] === 0x28 && data[1] === 0xb5 && data[2] === 0x2f && data[3] === 0xfd;
}

export class ApkgError extends Error {
  constructor(readonly code: "noCollection" | "emptyCollection") {
    super(code);
    this.name = "ApkgError";
  }
}

export interface ParseOptions {
  now?: Date;
  includeMedia?: boolean;
  fallbackNames?: { deckConfig?: string; noteType?: string };
}

export async function parseApkg(buffer: Uint8Array, options: ParseOptions = {}): Promise<ParsedCollection> {
  const now = options.now ?? new Date();
  const deckConfigName = options.fallbackNames?.deckConfig ?? "Imported";
  const noteTypeName = options.fallbackNames?.noteType ?? "Unnamed";
  const files = unzipSync(buffer);
  let version = 1;
  if (files.meta) {
    try {
      version = getVarint(decodeMessage(files.meta), 1, 1);
    } catch {
      version = 1;
    }
  }
  let collectionBytes: Uint8Array | null = null;
  if (files["collection.anki21b"]) {
    collectionBytes = decompress(files["collection.anki21b"]);
    version = Math.max(version, 3);
  } else if (files["collection.anki21"]) {
    collectionBytes = files["collection.anki21"];
  } else if (files["collection.anki2"]) {
    collectionBytes = files["collection.anki2"];
  }
  if (!collectionBytes) throw new ApkgError("noCollection");

  const SQL = await getSql();
  const db = new SQL.Database(collectionBytes);
  try {
    const col = query(db, "SELECT crt, conf, models, decks, dconf, ver FROM col")[0];
    if (!col) throw new ApkgError("emptyCollection");
    const crt = asNumber(col.crt);
    const modern = tableExists(db, "notetypes") && query(db, "SELECT COUNT(*) AS c FROM notetypes")[0]?.c !== 0;
    const legacyModels = asString(col.models);
    const useModern = modern && (legacyModels === "" || legacyModels === "{}");

    const noteTypes = useModern ? parseModernNoteTypes(db, noteTypeName) : parseLegacyNoteTypes(legacyModels, noteTypeName);
    const decks = useModern ? parseModernDecks(db) : parseLegacyDecks(asString(col.decks));
    const deckConfigs = useModern
      ? parseModernDeckConfigs(db, deckConfigName)
      : parseLegacyDeckConfigs(asString(col.dconf), deckConfigName, legacyFsrsEnabled(asString(col.conf)));
    const notes = parseNotes(db);
    const cards = parseCards(db, crt, now);
    const reviews = parseReviews(db);

    const media: ParsedMedia[] = [];
    if (options.includeMedia !== false) {
      const zstd = version >= 3;
      const mediaMap = parseMediaMap(files, zstd);
      for (const [index, name] of mediaMap) {
        const data = files[index];
        if (!data || !name) continue;
        media.push({ name, data: zstd || isZstd(data) ? safeDecompress(data) : data });
      }
    }

    return { noteTypes, decks, deckConfigs, notes, cards, media, reviews };
  } finally {
    db.close();
  }
}
