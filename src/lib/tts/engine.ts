import { createHash } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { mediaRoot } from "@/lib/media";
import { MAX_SPEECH_CHARS, NATURAL_VOICES, naturalVoice } from "./voices";
import { toWav } from "./wav";

const MODEL_ID = "onnx-community/Kokoro-82M-v1.0-ONNX";
const IDLE_MS = 15 * 60_000;
const MAX_BACKLOG = 400;

interface Model {
  generate(text: string, options: { voice: string; speed?: number }): Promise<{ audio: Float32Array; sampling_rate: number }>;
  model?: { dispose?: () => Promise<unknown> };
}

interface Job {
  key: string;
  text: string;
  voice: string;
  resolve: (audio: Uint8Array | null) => void;
}

interface State {
  model: Promise<Model> | null;
  broken: boolean;
  running: boolean;
  urgent: Job[];
  background: Job[];
  pending: Map<string, Promise<Uint8Array | null>>;
  idle: ReturnType<typeof setTimeout> | null;
}

const globalState = globalThis as typeof globalThis & { __flashcardsTts?: State };
const state: State = (globalState.__flashcardsTts ??= { model: null, broken: false, running: false, urgent: [], background: [], pending: new Map(), idle: null });

export function speechEnabled() {
  return process.env.TTS !== "off" && !state.broken;
}

export function normalizeSpeech(text: string) {
  return text.replace(/\s+/g, " ").trim().slice(0, MAX_SPEECH_CHARS);
}

function cacheKey(text: string, voice: string) {
  return createHash("sha256").update(`${voice}\u0000${text}`).digest("hex").slice(0, 40);
}

function cachePath(key: string, voice: string) {
  return path.join(mediaRoot(), ".speech", voice, `${key}.wav`);
}

async function withKokoroDirectory<T>(work: () => Promise<T>) {
  const scope = globalThis as unknown as { __dirname?: string };
  const previous = scope.__dirname;
  scope.__dirname = path.join(process.cwd(), "node_modules", "kokoro-js", "dist");
  try {
    return await work();
  } finally {
    if (previous === undefined) delete scope.__dirname;
    else scope.__dirname = previous;
  }
}

async function loadModel(): Promise<Model> {
  const transformers = await import("@huggingface/transformers");
  if (process.env.TTS_MODEL_DIR) transformers.env.cacheDir = process.env.TTS_MODEL_DIR;
  if (process.env.TTS_OFFLINE === "1") transformers.env.allowRemoteModels = false;
  const { KokoroTTS } = await import("kokoro-js");
  const model = (await KokoroTTS.from_pretrained(MODEL_ID, { dtype: "q8", device: "cpu" })) as unknown as Model;
  await withKokoroDirectory(async () => {
    for (const voice of NATURAL_VOICES) await model.generate("Hi.", { voice });
  });
  return model;
}

function scheduleUnload() {
  if (state.idle) clearTimeout(state.idle);
  state.idle = setTimeout(() => {
    const model = state.model;
    state.model = null;
    state.idle = null;
    void model?.then((loaded) => loaded.model?.dispose?.()).catch(() => null);
  }, IDLE_MS);
  state.idle.unref?.();
}

async function write(file: string, audio: Uint8Array) {
  await mkdir(path.dirname(file), { recursive: true });
  const temporary = `${file}.${process.pid}.tmp`;
  await writeFile(temporary, audio);
  await rename(temporary, file);
}

function nextJob() {
  return state.urgent.shift() ?? state.background.shift();
}

async function drain() {
  if (state.running) return;
  state.running = true;
  try {
    for (let job = nextJob(); job; job = nextJob()) {
      let model: Model;
      try {
        state.model ??= loadModel();
        model = await state.model;
      } catch (error) {
        state.broken = true;
        state.model = null;
        console.error("[tts] the speech model could not be loaded, falling back to device voices", error);
        for (const waiting of [job, ...state.urgent.splice(0), ...state.background.splice(0)]) {
          state.pending.delete(waiting.key);
          waiting.resolve(null);
        }
        return;
      }
      try {
        const result = await model.generate(job.text, { voice: job.voice });
        const audio = toWav(result.audio, result.sampling_rate);
        await write(cachePath(job.key, job.voice), audio);
        job.resolve(audio);
      } catch (error) {
        console.error("[tts] generation failed", error);
        job.resolve(null);
      } finally {
        state.pending.delete(job.key);
      }
    }
  } finally {
    state.running = false;
    scheduleUnload();
  }
}

export async function cachedSpeech(text: string, lang: string) {
  const voice = naturalVoice(lang);
  const clean = normalizeSpeech(text);
  if (!voice || !clean) return null;
  return readFile(cachePath(cacheKey(clean, voice), voice)).catch(() => null);
}

export function queueSpeech(text: string, lang: string, urgent: boolean) {
  const voice = naturalVoice(lang);
  const clean = normalizeSpeech(text);
  if (!voice || !clean || !speechEnabled()) return null;
  const key = cacheKey(clean, voice);
  const existing = state.pending.get(key);
  if (existing) {
    if (urgent) {
      const index = state.background.findIndex((job) => job.key === key);
      if (index >= 0) state.urgent.push(...state.background.splice(index, 1));
    }
    return existing;
  }
  if (!urgent && state.background.length >= MAX_BACKLOG) return null;
  const promise = new Promise<Uint8Array | null>((resolve) => {
    (urgent ? state.urgent : state.background).push({ key, text: clean, voice, resolve });
  });
  state.pending.set(key, promise);
  void drain();
  return promise;
}
