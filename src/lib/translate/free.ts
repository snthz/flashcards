import type { LanguageCode, TranslateInput, TranslationResult } from "./types";

const ENDPOINT = "https://api.mymemory.translated.net/get";

export class QuotaError extends Error {}

interface MyMemoryResponse {
  responseStatus?: number | string;
  quotaFinished?: boolean;
  responseData?: { translatedText?: string; detectedLanguage?: string };
  matches?: Array<{ translation?: string; match?: number | string; quality?: number | string }>;
}

function decode(value: string) {
  return value
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .trim();
}

function same(a: string, b: string) {
  return a.toLocaleLowerCase().replace(/[“”"'.!?¡¿\s]+/g, "") === b.toLocaleLowerCase().replace(/[“”"'.!?¡¿\s]+/g, "");
}

export function parseFree(body: MyMemoryResponse, input: TranslateInput): TranslationResult {
  if (body.quotaFinished || String(body.responseStatus) === "429") throw new QuotaError("quota");
  if (String(body.responseStatus) !== "200") throw new Error(`translation failed: ${body.responseStatus}`);
  const echoed = decode(body.responseData?.translatedText ?? "");
  if (!echoed) throw new Error("empty translation");
  const better = same(echoed, input.text)
    ? (body.matches ?? []).map((match) => ({ text: decode(match.translation ?? ""), score: Number(match.match) })).find((match) => match.text && match.score >= 0.5 && !same(match.text, input.text))
    : undefined;
  const translation = better?.text ?? echoed;
  const alternatives: TranslationResult["alternatives"] = [];
  for (const match of body.matches ?? []) {
    const text = decode(match.translation ?? "");
    if (!text || Number(match.match) < 0.7) continue;
    if (same(text, translation) || same(text, input.text) || alternatives.some((alt) => same(alt.text, text))) continue;
    alternatives.push({ text, note: "" });
    if (alternatives.length === 3) break;
  }
  return {
    provider: "free",
    source: input.source === "auto" ? (body.responseData?.detectedLanguage?.slice(0, 2) ?? null) : input.source,
    target: input.target,
    text: input.text,
    translation,
    literal: null,
    kind: null,
    synonyms: [],
    alternatives,
    notes: [],
    examples: [],
  };
}

export function freeUrl(input: TranslateInput, contact?: string) {
  const params = new URLSearchParams({ q: input.text, langpair: `${input.source === "auto" ? "autodetect" : input.source}|${input.target}` });
  if (contact) params.set("de", contact);
  return `${ENDPOINT}?${params}`;
}

export async function translateFree(input: TranslateInput & { target: LanguageCode }) {
  const response = await fetch(freeUrl(input, process.env.MYMEMORY_EMAIL || undefined), { signal: AbortSignal.timeout(12_000), cache: "no-store" });
  if (response.status === 429) throw new QuotaError("quota");
  if (!response.ok) throw new Error(`translation failed: ${response.status}`);
  return parseFree((await response.json()) as MyMemoryResponse, input);
}
