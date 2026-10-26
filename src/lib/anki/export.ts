import { createHash } from "node:crypto";
import { getSql } from "./apkg";
import { plainText } from "./render";
import type { NoteTypeField, NoteTypeTemplate, ParsedDeckConfig } from "./types";

type CardState = "NEW" | "LEARNING" | "REVIEW" | "RELEARNING";

export interface ExportNoteType {
  ankiId: bigint;
  name: string;
  kind: "STANDARD" | "CLOZE";
  css: string;
  fields: NoteTypeField[];
  templates: NoteTypeTemplate[];
  sortFieldIdx: number;
  latexPre: string;
  latexPost: string;
}

export interface ExportDeck {
  ankiId: bigint;
  name: string;
  description: string;
  configAnkiId: bigint;
}

export type ExportDeckConfig = ParsedDeckConfig & { newCardOrder: "SEQUENTIAL" | "RANDOM" };

export interface ExportNote {
  ankiId: bigint;
  guid: string;
  noteTypeAnkiId: bigint;
  fields: string[];
  tags: string[];
  modified: Date;
}

export interface ExportCard {
  ankiId: bigint;
  noteAnkiId: bigint;
  deckAnkiId: bigint;
  ord: number;
  state: CardState;
  due: Date;
  newPosition: number;
  interval: number;
  ease: number;
  reps: number;
  lapses: number;
  step: number;
  stepCount: number;
  stability: number | null;
  difficulty: number | null;
  suspended: boolean;
  flag: number;
}

export interface ExportReview {
  ankiId: bigint;
  cardAnkiId: bigint;
  rating: number;
  prevState: CardState;
  newState: CardState;
  prevInterval: number;
  newInterval: number;
  ease: number;
  durationMs: number;
}

export interface ExportInput {
  now: Date;
  dayStart: Date;
  dayEnd: Date;
  includeScheduling: boolean;
  noteTypes: ExportNoteType[];
  decks: ExportDeck[];
  deckConfigs: ExportDeckConfig[];
  notes: ExportNote[];
  cards: ExportCard[];
  reviews: ExportReview[];
}

export const DEFAULT_ANKI_ID = 1n;

const DAY_MS = 86_400_000;
const FIELD_SEPARATOR = "\x1f";
const DEFAULT_LATEX_PRE =
  "\\documentclass[12pt]{article}\n\\special{papersize=3in,5in}\n\\usepackage[utf8]{inputenc}\n\\usepackage{amssymb,amsmath}\n\\pagestyle{empty}\n\\setlength{\\parindent}{0in}\n\\begin{document}\n";
const DEFAULT_LATEX_POST = "\\end{document}";

const SCHEMA = `
CREATE TABLE col (id integer primary key, crt integer not null, mod integer not null, scm integer not null, ver integer not null, dty integer not null, usn integer not null, ls integer not null, conf text not null, models text not null, decks text not null, dconf text not null, tags text not null);
CREATE TABLE notes (id integer primary key, guid text not null, mid integer not null, mod integer not null, usn integer not null, tags text not null, flds text not null, sfld integer not null, csum integer not null, flags integer not null, data text not null);
CREATE TABLE cards (id integer primary key, nid integer not null, did integer not null, ord integer not null, mod integer not null, usn integer not null, type integer not null, queue integer not null, due integer not null, ivl integer not null, factor integer not null, reps integer not null, lapses integer not null, left integer not null, odue integer not null, odid integer not null, flags integer not null, data text not null);
CREATE TABLE revlog (id integer primary key, cid integer not null, usn integer not null, ease integer not null, ivl integer not null, lastIvl integer not null, factor integer not null, time integer not null, type integer not null);
CREATE TABLE graves (usn integer not null, oid integer not null, type integer not null);
CREATE INDEX ix_notes_usn on notes (usn);
CREATE INDEX ix_cards_usn on cards (usn);
CREATE INDEX ix_revlog_usn on revlog (usn);
CREATE INDEX ix_cards_nid on cards (nid);
CREATE INDEX ix_cards_sched on cards (did, queue, due);
CREATE INDEX ix_revlog_cid on revlog (cid);
CREATE INDEX ix_notes_csum on notes (csum);
`;

function stripForChecksum(html: string) {
  return html
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<img[^>]+src=["']?([^"'>]+)["']?[^>]*>/gi, " $1 ")
    .replace(/\[sound:[^\]]+\]/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .trim();
}

export function fieldChecksum(field: string) {
  return parseInt(createHash("sha1").update(stripForChecksum(field)).digest("hex").slice(0, 8), 16);
}

function seconds(date: Date) {
  return Math.floor(date.getTime() / 1000);
}

function collectionStart(input: ExportInput) {
  let earliest = input.dayStart.getTime();
  if (input.includeScheduling) {
    for (const card of input.cards) {
      if (card.state === "REVIEW" && card.due.getTime() < earliest) earliest = card.due.getTime();
    }
  }
  const days = Math.ceil((input.dayStart.getTime() - earliest) / DAY_MS);
  return new Date(input.dayStart.getTime() - days * DAY_MS);
}

function dayNumber(date: Date, crt: Date) {
  return Math.max(0, Math.round((date.getTime() - crt.getTime()) / DAY_MS));
}

function modelJson(noteType: ExportNoteType, deckId: bigint, mod: number) {
  return {
    id: Number(noteType.ankiId),
    name: noteType.name,
    type: noteType.kind === "CLOZE" ? 1 : 0,
    mod,
    usn: 0,
    sortf: noteType.sortFieldIdx,
    did: Number(deckId),
    tmpls: noteType.templates.map((template, ord) => ({
      name: template.name,
      ord,
      qfmt: template.qfmt,
      afmt: template.afmt,
      bqfmt: "",
      bafmt: "",
      did: null,
      bfont: "",
      bsize: 0,
    })),
    flds: noteType.fields.map((field, ord) => ({ name: field.name, ord, sticky: false, rtl: false, font: "Arial", size: 20, media: [] })),
    css: noteType.css,
    latexPre: noteType.latexPre || DEFAULT_LATEX_PRE,
    latexPost: noteType.latexPost || DEFAULT_LATEX_POST,
    latexsvg: false,
    req: noteType.templates.map((_, ord) => [ord, "any", noteType.fields.map((__, index) => index)]),
    tags: [],
    vers: [],
  };
}

function deckJson(id: bigint, name: string, description: string, configId: bigint, mod: number) {
  return {
    id: Number(id),
    mod,
    name,
    usn: 0,
    lrnToday: [0, 0],
    revToday: [0, 0],
    newToday: [0, 0],
    timeToday: [0, 0],
    collapsed: false,
    browserCollapsed: false,
    desc: description,
    dyn: 0,
    conf: Number(configId),
    extendNew: 0,
    extendRev: 0,
  };
}

function fsrsParamsKey(weights: number[]) {
  if (weights.length >= 21) return "fsrsParams6";
  if (weights.length === 19) return "fsrsParams5";
  return "fsrsWeights";
}

function deckConfigJson(config: ExportDeckConfig, mod: number) {
  const json: Record<string, unknown> = {
    id: Number(config.ankiId),
    mod,
    name: config.name,
    usn: 0,
    maxTaken: 60,
    autoplay: true,
    timer: 0,
    replayq: true,
    dyn: false,
    new: {
      bury: false,
      delays: config.learningSteps,
      initialFactor: config.startingEase,
      ints: [config.graduatingInterval, config.easyInterval, 0],
      order: config.newCardOrder === "RANDOM" ? 0 : 1,
      perDay: config.newPerDay,
    },
    rev: {
      bury: false,
      ease4: config.easyBonus,
      ivlFct: config.intervalModifier,
      maxIvl: config.maxInterval,
      perDay: config.reviewsPerDay,
      hardFactor: config.hardMultiplier,
      fuzz: 0.05,
    },
    lapse: {
      delays: config.relearningSteps,
      leechAction: config.leechAction === "SUSPEND" ? 0 : 1,
      leechFails: config.leechThreshold,
      minInt: config.minLapseInterval,
      mult: config.lapseMultiplier,
    },
    desiredRetention: config.desiredRetention,
    fcAlgorithm: config.algorithm,
  };
  if (config.fsrsWeights.length > 0) json[fsrsParamsKey(config.fsrsWeights)] = config.fsrsWeights;
  return json;
}

function cardType(state: CardState) {
  return { NEW: 0, LEARNING: 1, REVIEW: 2, RELEARNING: 3 }[state];
}

function scheduledCardRow(card: ExportCard, input: ExportInput, crt: Date) {
  const remaining = Math.max(1, card.stepCount - card.step);
  const left = card.stepCount > 0 ? card.stepCount * 1000 + remaining : 0;
  const learningLike = card.state === "LEARNING" || card.state === "RELEARNING";
  let queue: number = cardType(card.state);
  let due: number;
  if (card.state === "NEW") due = card.newPosition;
  else if (card.state === "REVIEW") due = dayNumber(card.due, crt);
  else if (card.due.getTime() >= input.dayEnd.getTime()) {
    queue = 3;
    due = dayNumber(card.due, crt);
  } else {
    queue = 1;
    due = seconds(card.due);
  }
  if (card.suspended) queue = -1;
  const memory =
    card.state !== "NEW" && card.stability != null && card.difficulty != null
      ? JSON.stringify({ s: Number(card.stability.toFixed(4)), d: Number(card.difficulty.toFixed(3)) })
      : "";
  return {
    type: cardType(card.state),
    queue,
    due,
    ivl: card.state === "REVIEW" || card.state === "RELEARNING" ? Math.max(1, Math.round(card.interval)) : 0,
    factor: card.state === "NEW" ? 0 : card.ease,
    reps: card.reps,
    lapses: card.lapses,
    left: learningLike ? left : 0,
    flags: card.flag & 7,
    data: memory,
  };
}

function revlogType(state: CardState) {
  if (state === "REVIEW") return 1;
  if (state === "RELEARNING") return 2;
  return 0;
}

export async function writeAnkiCollection(input: ExportInput): Promise<Uint8Array> {
  const SQL = await getSql();
  const db = new SQL.Database();
  try {
    db.exec(SCHEMA);
    const mod = seconds(input.now);
    const crt = collectionStart(input);

    const configs = new Map<string, ExportDeckConfig>();
    for (const config of input.deckConfigs) configs.set(config.ankiId.toString(), config);
    const dconf: Record<string, unknown> = {};
    if (!configs.has(DEFAULT_ANKI_ID.toString())) {
      dconf[DEFAULT_ANKI_ID.toString()] = deckConfigJson({ ...defaultConfigValues(), ankiId: DEFAULT_ANKI_ID, name: "Default" }, mod);
    }
    for (const config of configs.values()) dconf[config.ankiId.toString()] = deckConfigJson(config, mod);

    const decks: Record<string, unknown> = {
      [DEFAULT_ANKI_ID.toString()]: deckJson(DEFAULT_ANKI_ID, "Default", "", DEFAULT_ANKI_ID, mod),
    };
    for (const deck of input.decks) decks[deck.ankiId.toString()] = deckJson(deck.ankiId, deck.name, deck.description, deck.configAnkiId, mod);

    const firstDeck = input.decks[0]?.ankiId ?? DEFAULT_ANKI_ID;
    const models: Record<string, unknown> = {};
    for (const noteType of input.noteTypes) models[noteType.ankiId.toString()] = modelJson(noteType, firstDeck, mod);

    const maxPosition = input.cards.reduce((max, card) => Math.max(max, card.newPosition), 0);
    const conf = {
      nextPos: maxPosition + 1,
      estTimes: true,
      activeDecks: [1],
      sortType: "noteFld",
      timeLim: 0,
      sortBackwards: false,
      addToCur: true,
      curDeck: Number(firstDeck),
      newSpread: 0,
      dueCounts: true,
      curModel: input.noteTypes[0] ? Number(input.noteTypes[0].ankiId) : null,
      collapseTime: 1200,
      fsrs: input.deckConfigs.some((config) => config.algorithm === "FSRS"),
    };
    db.run("INSERT INTO col VALUES (1, ?, ?, ?, 11, 0, 0, 0, ?, ?, ?, ?, '{}')", [
      seconds(crt),
      input.now.getTime(),
      input.now.getTime(),
      JSON.stringify(conf),
      JSON.stringify(models),
      JSON.stringify(decks),
      JSON.stringify(dconf),
    ]);

    const sortFields = new Map(input.noteTypes.map((noteType) => [noteType.ankiId.toString(), noteType.sortFieldIdx]));
    const insertNote = db.prepare("INSERT INTO notes VALUES (?, ?, ?, ?, 0, ?, ?, ?, ?, 0, '')");
    try {
      for (const note of input.notes) {
        const sortIndex = sortFields.get(note.noteTypeAnkiId.toString()) ?? 0;
        insertNote.run([
          Number(note.ankiId),
          note.guid,
          Number(note.noteTypeAnkiId),
          seconds(note.modified),
          note.tags.length > 0 ? ` ${note.tags.join(" ")} ` : "",
          note.fields.join(FIELD_SEPARATOR),
          plainText(note.fields[sortIndex] ?? "", 1000),
          fieldChecksum(note.fields[0] ?? ""),
        ]);
      }
    } finally {
      insertNote.free();
    }

    const insertCard = db.prepare("INSERT INTO cards VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?)");
    try {
      for (const card of input.cards) {
        const row = input.includeScheduling
          ? scheduledCardRow(card, input, crt)
          : { type: 0, queue: 0, due: card.newPosition, ivl: 0, factor: 0, reps: 0, lapses: 0, left: 0, flags: 0, data: "" };
        insertCard.run([
          Number(card.ankiId),
          Number(card.noteAnkiId),
          Number(card.deckAnkiId),
          card.ord,
          mod,
          row.type,
          row.queue,
          row.due,
          row.ivl,
          row.factor,
          row.reps,
          row.lapses,
          row.left,
          row.flags,
          row.data,
        ]);
      }
    } finally {
      insertCard.free();
    }

    if (input.includeScheduling) {
      const insertReview = db.prepare("INSERT INTO revlog VALUES (?, ?, 0, ?, ?, ?, ?, ?, ?)");
      try {
        for (const review of input.reviews) {
          insertReview.run([
            Number(review.ankiId),
            Number(review.cardAnkiId),
            review.rating,
            review.newState === "REVIEW" ? Math.max(1, Math.round(review.newInterval)) : 0,
            review.prevState === "REVIEW" || review.prevState === "RELEARNING" ? Math.round(review.prevInterval) : 0,
            review.ease,
            Math.max(0, Math.round(review.durationMs)),
            revlogType(review.prevState),
          ]);
        }
      } finally {
        insertReview.free();
      }
    }

    return db.export();
  } finally {
    db.close();
  }
}

function defaultConfigValues(): Omit<ExportDeckConfig, "ankiId" | "name"> {
  return {
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
    newCardOrder: "SEQUENTIAL",
  };
}

export interface TextExportNote {
  guid: string;
  noteTypeName: string;
  deckName: string;
  fields: string[];
  tags: string[];
}

function textCell(value: string) {
  return /[\t\n\r"]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function writeNotesText(notes: TextExportNote[]) {
  const fieldColumns = notes.reduce((max, note) => Math.max(max, note.fields.length), 0);
  const tagsColumn = fieldColumns + 4;
  const lines = ["#separator:tab", "#html:true", "#guid column:1", "#notetype column:2", "#deck column:3", `#tags column:${tagsColumn}`];
  for (const note of notes) {
    const fields = Array.from({ length: fieldColumns }, (_, index) => note.fields[index] ?? "");
    lines.push([note.guid, note.noteTypeName, note.deckName, ...fields, note.tags.join(" ")].map(textCell).join("\t"));
  }
  return `${lines.join("\n")}\n`;
}
