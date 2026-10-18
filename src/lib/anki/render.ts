import type { NoteTypeTemplate } from "./types";

export interface RenderInput {
  fields: Record<string, string>;
  template: NoteTypeTemplate;
  css: string;
  ord: number;
  kind: "STANDARD" | "CLOZE";
  tags: string[];
  deckName: string;
  noteTypeName: string;
  mediaBase: string;
}

export interface RenderedCard {
  question: string;
  answer: string;
  css: string;
  audio: { question: string[]; answer: string[] };
}

const CLOZE_RE = /\{\{c(\d+)::([\s\S]*?)(?:::([\s\S]*?))?\}\}/g;
const SOUND_RE = /\[sound:([^\]]+)\]/g;
const SRC_RE = /(<(?:img|audio|video|source)\b[^>]*?\s(?:src|data-src))=(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi;
const SCRIPT_RE = /<script\b[^>]*>[\s\S]*?<\/script>/gi;
const EVENT_ATTR_RE = /\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;
const TAG_RE = /<[^>]+>/g;
const HIDDEN_BLOCK_RE = /<(style|script)\b[^>]*>[\s\S]*?<\/\1>|<!--[\s\S]*?-->/gi;
const BLOCK_TAG_RE = /<\/?(?:p|div|h[1-6]|ul|ol|table|tr|blockquote|pre|section|article|header|footer)\b[^>]*>/gi;
const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

function stripHtml(value: string) {
  return value.replace(TAG_RE, "");
}

function isExternal(url: string) {
  return /^(?:https?:|data:|blob:|\/|#)/i.test(url);
}

export function rewriteMedia(html: string, mediaBase: string) {
  return html.replace(SRC_RE, (match: string, prefix: string, doubleQuoted?: string, singleQuoted?: string, bare?: string) => {
    const url = (doubleQuoted ?? singleQuoted ?? bare ?? "").trim();
    if (!url || isExternal(url)) return match;
    let decoded = url;
    try {
      decoded = decodeURIComponent(url);
    } catch {
      decoded = url;
    }
    return `${prefix}="${mediaBase}${encodeURIComponent(decoded)}"`;
  });
}

function extractAudio(html: string, mediaBase: string) {
  const files: string[] = [];
  const replaced = html.replace(SOUND_RE, (_m, file: string) => {
    const url = isExternal(file) ? file : `${mediaBase}${encodeURIComponent(file.trim())}`;
    files.push(url);
    const index = files.length;
    return `<span class="fc-audio" data-src="${url}" data-index="${index}">🔊</span>`;
  });
  return { html: replaced, files };
}

function sanitize(html: string) {
  return html.replace(SCRIPT_RE, "").replace(EVENT_ATTR_RE, "");
}

function renderCloze(text: string, ord: number, side: "question" | "answer") {
  const target = ord + 1;
  return text.replace(CLOZE_RE, (_m, num: string, content: string, hint?: string) => {
    if (Number(num) !== target) return side === "question" ? content : content;
    if (side === "question") {
      const shown = hint && hint.length > 0 ? hint : "...";
      return `<span class="cloze" data-cloze="${escapeAttr(content)}">[${shown}]</span>`;
    }
    return `<span class="cloze">${content}</span>`;
  });
}

function clozeOnlyText(text: string, ord: number) {
  const target = ord + 1;
  const parts: string[] = [];
  for (const match of text.matchAll(CLOZE_RE)) {
    if (Number(match[1]) === target) parts.push(match[2]);
  }
  return parts.join(", ");
}

function escapeAttr(value: string) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

export function clozeOrdinals(text: string) {
  const ords = new Set<number>();
  for (const match of text.matchAll(CLOZE_RE)) {
    const n = Number(match[1]);
    if (n > 0) ords.add(n - 1);
  }
  return [...ords].sort((a, b) => a - b);
}

function applyFilters(filters: string[], value: string, fieldName: string, input: RenderInput, side: "question" | "answer") {
  let result = value;
  for (const filter of [...filters].reverse()) {
    switch (filter) {
      case "cloze":
        result = renderCloze(result, input.ord, side);
        break;
      case "cloze-only":
        result = clozeOnlyText(result, input.ord);
        break;
      case "text":
        result = stripHtml(result);
        break;
      case "hint":
        result = result.trim()
          ? `<details class="hint"><summary>${escapeAttr(fieldName)}</summary>${result}</details>`
          : "";
        break;
      case "type":
        result = side === "question" ? `<input class="typeans" type="text" placeholder="Escribe la respuesta" autocomplete="off">` : `<div class="typeans-answer">${result}</div>`;
        break;
      case "type-cloze":
        result = side === "question" ? `<input class="typeans" type="text" autocomplete="off">` : `<div class="typeans-answer">${clozeOnlyText(result, input.ord)}</div>`;
        break;
      case "furigana":
      case "kanji":
      case "kana":
      case "tts":
      case "tts-voices":
        break;
      default:
        break;
    }
  }
  return result;
}

function resolveTag(name: string, input: RenderInput, side: "question" | "answer", frontSide: string): string | null {
  const parts = name.split(":").map((p) => p.trim());
  const fieldName = parts.pop() ?? "";
  const filters = parts.map((p) => p.toLowerCase());
  if (fieldName === "FrontSide") return frontSide;
  if (fieldName === "Tags") return input.tags.join(" ");
  if (fieldName === "Type") return input.noteTypeName;
  if (fieldName === "Deck") return input.deckName;
  if (fieldName === "Subdeck") return input.deckName.split("::").pop() ?? input.deckName;
  if (fieldName === "Card") return input.template.name;
  if (fieldName === "CardFlag") return "";
  if (!(fieldName in input.fields)) return null;
  const value = input.fields[fieldName] ?? "";
  if (filters.length === 0) return value;
  return applyFilters(filters, value, fieldName, input, side);
}

function fieldNonEmpty(name: string, input: RenderInput) {
  const value = input.fields[name];
  if (value == null) return false;
  if (input.kind === "CLOZE" && name.startsWith("c") && /^c\d+$/.test(name)) {
    return Number(name.slice(1)) === input.ord + 1;
  }
  return stripHtml(value).trim().length > 0;
}

function renderSections(template: string, input: RenderInput): string {
  const sectionRe = /\{\{([#^])([^}]+)\}\}([\s\S]*?)\{\{\/\2\}\}/;
  let output = template;
  let match = sectionRe.exec(output);
  let guard = 0;
  while (match && guard < 500) {
    const [whole, type, rawName, body] = match;
    const name = rawName.trim();
    const show = type === "#" ? fieldNonEmpty(name, input) : !fieldNonEmpty(name, input);
    output = output.replace(whole, show ? body : "");
    match = sectionRe.exec(output);
    guard += 1;
  }
  return output;
}

function renderTemplate(template: string, input: RenderInput, side: "question" | "answer", frontSide: string) {
  const withSections = renderSections(template, input);
  return withSections.replace(/\{\{([^{}]+)\}\}/g, (whole, name: string) => {
    const resolved = resolveTag(name.trim(), input, side, frontSide);
    return resolved ?? whole;
  });
}

export function renderCard(input: RenderInput): RenderedCard {
  const rawQuestion = renderTemplate(input.template.qfmt, input, "question", "");
  const rawAnswer = renderTemplate(input.template.afmt, input, "answer", rawQuestion);
  const question = extractAudio(sanitize(rewriteMedia(rawQuestion, input.mediaBase)), input.mediaBase);
  const answer = extractAudio(sanitize(rewriteMedia(rawAnswer, input.mediaBase)), input.mediaBase);
  return {
    question: question.html,
    answer: answer.html,
    css: input.css,
    audio: { question: question.files, answer: answer.files },
  };
}

export function isQuestionEmpty(input: RenderInput) {
  const rendered = renderTemplate(input.template.qfmt, input, "question", "");
  return stripHtml(rendered.replace(SOUND_RE, "x").replace(/<img[^>]*>/gi, "x")).trim().length === 0;
}

export function fieldMap(names: string[], values: string[]) {
  const map: Record<string, string> = {};
  names.forEach((name, index) => {
    map[name] = values[index] ?? "";
  });
  return map;
}

export function plainText(html: string, maxLength = 120) {
  const text = stripHtml(html.replace(SOUND_RE, "").replace(/<br\s*\/?>/gi, " ").replace(/&nbsp;/g, " "))
    .replace(/\s+/g, " ")
    .trim();
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
}

function decodeEntities(value: string) {
  return value.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, entity: string) => {
    if (entity[0] !== "#") return ENTITIES[entity.toLowerCase()] ?? match;
    const code = entity[1].toLowerCase() === "x" ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10);
    return code <= 0x10ffff ? String.fromCodePoint(code) : match;
  });
}

export function htmlToText(html: string) {
  const text = html
    .replace(HIDDEN_BLOCK_RE, "")
    .replace(SOUND_RE, "")
    .replace(/\s+/g, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<li\b[^>]*>/gi, "\n• ")
    .replace(BLOCK_TAG_RE, "\n")
    .replace(TAG_RE, "");
  return decodeEntities(text)
    .replace(/[^\S\n]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
