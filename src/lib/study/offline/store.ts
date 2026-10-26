import type { StudyOp, StudyPack } from "../types";

const DB_NAME = "fc-offline";
const DB_VERSION = 1;
const PACKS = "packs";
const OPS = "ops";
const META = "meta";

interface PackRecord {
  key: string;
  userId: string;
  deckId: string;
  pack: StudyPack;
}

const memory = {
  packs: new Map<string, PackRecord>(),
  ops: new Map<string, StudyOp>(),
  meta: new Map<string, unknown>(),
};

let dbPromise: Promise<IDBDatabase | null> | null = null;

function openDb() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise<IDBDatabase | null>((resolve) => {
    try {
      if (typeof indexedDB === "undefined") return resolve(null);
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(PACKS)) db.createObjectStore(PACKS, { keyPath: "key" }).createIndex("userId", "userId");
        if (!db.objectStoreNames.contains(OPS)) db.createObjectStore(OPS, { keyPath: "id" }).createIndex("userId", "userId");
        if (!db.objectStoreNames.contains(META)) db.createObjectStore(META, { keyPath: "key" });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
      request.onblocked = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
  return dbPromise;
}

function done<T>(request: IDBRequest<T>) {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function committed(transaction: IDBTransaction) {
  return new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}

async function withStore<T>(name: string, mode: IDBTransactionMode, work: (store: IDBObjectStore) => Promise<T>, fallback: () => T) {
  const db = await openDb();
  if (!db) return fallback();
  try {
    const transaction = db.transaction(name, mode);
    const result = await work(transaction.objectStore(name));
    if (mode === "readwrite") await committed(transaction);
    return result;
  } catch {
    return fallback();
  }
}

function packKey(userId: string, deckId: string) {
  return `${userId}:${deckId}`;
}

export async function savePack(pack: StudyPack) {
  const record: PackRecord = { key: packKey(pack.userId, pack.deckId), userId: pack.userId, deckId: pack.deckId, pack };
  memory.packs.set(record.key, record);
  await withStore(PACKS, "readwrite", (store) => done(store.put(record)), () => undefined);
}

export async function loadPack(userId: string, deckId: string) {
  const key = packKey(userId, deckId);
  const record = await withStore<PackRecord | undefined>(PACKS, "readonly", (store) => done(store.get(key)), () => memory.packs.get(key));
  return record?.pack ?? null;
}

export async function listPacks(userId: string) {
  const records = await withStore<PackRecord[]>(
    PACKS,
    "readonly",
    (store) => done(store.index("userId").getAll(userId)),
    () => [...memory.packs.values()].filter((record) => record.userId === userId),
  );
  return records.map((record) => record.pack);
}

export async function clearPacks() {
  memory.packs.clear();
  await withStore(PACKS, "readwrite", (store) => done(store.clear()), () => undefined);
}

export async function addOp(op: StudyOp) {
  memory.ops.set(op.id, op);
  await withStore(OPS, "readwrite", (store) => done(store.put(op)), () => undefined);
}

export async function putOps(ops: StudyOp[]) {
  for (const op of ops) memory.ops.set(op.id, op);
  await withStore(
    OPS,
    "readwrite",
    async (store) => {
      for (const op of ops) store.put(op);
    },
    () => undefined,
  );
}

export async function deleteOps(ids: string[]) {
  for (const id of ids) memory.ops.delete(id);
  await withStore(
    OPS,
    "readwrite",
    async (store) => {
      for (const id of ids) store.delete(id);
    },
    () => undefined,
  );
}

export async function loadOps(userId: string) {
  const ops = await withStore<StudyOp[]>(
    OPS,
    "readonly",
    (store) => done(store.index("userId").getAll(userId)),
    () => [...memory.ops.values()].filter((op) => op.userId === userId),
  );
  return ops.sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
}

export async function setMeta(key: string, value: unknown) {
  memory.meta.set(key, value);
  await withStore(META, "readwrite", (store) => done(store.put({ key, value })), () => undefined);
}

export async function getMeta<T>(key: string): Promise<T | null> {
  const record = await withStore<{ key: string; value: T } | undefined>(
    META,
    "readonly",
    (store) => done(store.get(key)),
    () => (memory.meta.has(key) ? { key, value: memory.meta.get(key) as T } : undefined),
  );
  return record?.value ?? null;
}
