import { describe, expect, it } from "vitest";
import { zipSync } from "fflate";
import initSqlJs from "sql.js";
import { parseApkg } from "./apkg";

const CRT = 1_600_000_000;

async function buildLegacyApkg() {
  const SQL = await initSqlJs();
  const db = new SQL.Database();
  db.run(`
    CREATE TABLE col (id integer primary key, crt integer, mod integer, scm integer, ver integer, dty integer, usn integer, ls integer, conf text, models text, decks text, dconf text, tags text);
    CREATE TABLE notes (id integer primary key, guid text, mid integer, mod integer, usn integer, tags text, flds text, sfld text, csum integer, flags integer, data text);
    CREATE TABLE cards (id integer primary key, nid integer, did integer, ord integer, mod integer, usn integer, type integer, queue integer, due integer, ivl integer, factor integer, reps integer, lapses integer, left integer, odue integer, odid integer, flags integer, data text);
  `);
  const models = {
    "1001": {
      id: 1001,
      name: "Basic",
      type: 0,
      css: ".card { color: blue; }",
      sortf: 0,
      flds: [
        { name: "Front", ord: 0 },
        { name: "Back", ord: 1 },
      ],
      tmpls: [{ name: "Card 1", ord: 0, qfmt: "{{Front}}", afmt: "{{FrontSide}}<hr id=answer>{{Back}}" }],
    },
  };
  const decks = {
    "1": { id: 1, name: "Default", desc: "", conf: 1 },
    "2001": { id: 2001, name: "Idiomas::Inglés", desc: "Vocabulario", conf: 1 },
  };
  const dconf = {
    "1": {
      id: 1,
      name: "Default",
      new: { delays: [1, 10], ints: [1, 4, 0], perDay: 25, initialFactor: 2500 },
      rev: { perDay: 150, ease4: 1.3, ivlFct: 1, maxIvl: 36500, hardFactor: 1.2 },
      lapse: { delays: [10], mult: 0, minInt: 1, leechFails: 8, leechAction: 1 },
    },
  };
  db.run("INSERT INTO col VALUES (1, ?, 0, 0, 11, 0, 0, 0, '{}', ?, ?, ?, '{}')", [
    CRT,
    JSON.stringify(models),
    JSON.stringify(decks),
    JSON.stringify(dconf),
  ]);
  db.run("INSERT INTO notes VALUES (5001, 'guid1', 1001, 0, 0, ' vocab ', 'hello\x1fhola <img src=\"pic.jpg\">', 'hello', 0, 0, '')");
  db.run("INSERT INTO notes VALUES (5002, 'guid2', 1001, 0, 0, '', 'bye\x1fadiós', 'bye', 0, 0, '')");
  db.run("INSERT INTO cards VALUES (7001, 5001, 2001, 0, 0, 0, 2, 2, 10, 15, 2600, 4, 1, 0, 0, 0, 0, '')");
  db.run("INSERT INTO cards VALUES (7002, 5002, 2001, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, '')");
  db.run("INSERT INTO cards VALUES (7003, 5002, 1, 0, 0, 0, 1, 1, 1700000000, 0, 2500, 1, 0, 2001, 0, 0, 0, '')");
  const bytes = db.export();
  db.close();
  return zipSync({
    "collection.anki2": bytes,
    media: new TextEncoder().encode(JSON.stringify({ "0": "pic.jpg" })),
    "0": new Uint8Array([1, 2, 3]),
  });
}

describe("parseApkg (legacy format)", () => {
  it("parses note types, decks, configs, notes, cards and media", async () => {
    const apkg = await buildLegacyApkg();
    const now = new Date("2026-03-10T12:00:00Z");
    const parsed = await parseApkg(apkg, { now });

    expect(parsed.noteTypes).toHaveLength(1);
    expect(parsed.noteTypes[0].name).toBe("Basic");
    expect(parsed.noteTypes[0].fields.map((f) => f.name)).toEqual(["Front", "Back"]);
    expect(parsed.noteTypes[0].templates[0].afmt).toContain("{{Back}}");

    expect(parsed.decks.map((d) => d.name)).toEqual(["Default", "Idiomas::Inglés"]);
    expect(parsed.deckConfigs[0].newPerDay).toBe(25);
    expect(parsed.deckConfigs[0].reviewsPerDay).toBe(150);

    expect(parsed.notes).toHaveLength(2);
    expect(parsed.notes[0].fields).toEqual(["hello", 'hola <img src="pic.jpg">']);
    expect(parsed.notes[0].tags).toEqual(["vocab"]);

    const review = parsed.cards.find((c) => c.ankiId === 7001n)!;
    expect(review.state).toBe("REVIEW");
    expect(review.interval).toBe(15);
    expect(review.ease).toBe(2600);
    expect(review.due.getTime()).toBe((CRT + 10 * 86_400) * 1000);
    expect(review.deckAnkiId).toBe(2001n);

    const fresh = parsed.cards.find((c) => c.ankiId === 7002n)!;
    expect(fresh.state).toBe("NEW");
    expect(fresh.newPosition).toBe(3);

    const learning = parsed.cards.find((c) => c.ankiId === 7003n)!;
    expect(learning.state).toBe("LEARNING");
    expect(learning.due.getTime()).toBe(1_700_000_000_000);
    expect(learning.step).toBe(1);

    expect(parsed.media).toEqual([{ name: "pic.jpg", data: new Uint8Array([1, 2, 3]) }]);
  });
});
