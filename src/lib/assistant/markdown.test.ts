import { describe, expect, it } from "vitest";
import { parseInline, parseMarkdown } from "./markdown";
import { assistantPrompt } from "./claude";

describe("parseInline", () => {
  it("reads bold, italics and code", () => {
    expect(parseInline("The past of *put* is **put**, see `put up`.")).toEqual([
      { type: "text", text: "The past of " },
      { type: "italic", text: "put" },
      { type: "text", text: " is " },
      { type: "bold", text: "put" },
      { type: "text", text: ", see " },
      { type: "code", text: "put up" },
      { type: "text", text: "." },
    ]);
  });

  it("leaves snake_case, lone asterisks and unfinished markers alone", () => {
    expect(parseInline("snake_case_word")).toEqual([{ type: "text", text: "snake_case_word" }]);
    expect(parseInline("2 * 3 = 6")).toEqual([{ type: "text", text: "2 * 3 = 6" }]);
    expect(parseInline("**unfinished")).toEqual([{ type: "text", text: "**unfinished" }]);
  });

  it("reads underscore italics around words", () => {
    expect(parseInline("say _ser_ here")).toEqual([
      { type: "text", text: "say " },
      { type: "italic", text: "ser" },
      { type: "text", text: " here" },
    ]);
  });
});

describe("parseMarkdown", () => {
  it("groups paragraphs and lists", () => {
    const blocks = parseMarkdown("El pasado de *put* es **put**.\n\n- Presente: put\n- Pasado: put\n\n1. Uno\n2. Dos\nFin");
    expect(blocks.map((block) => block.type)).toEqual(["paragraph", "list", "list", "paragraph"]);
    expect(blocks[1]).toMatchObject({ type: "list", ordered: false });
    expect(blocks[2]).toMatchObject({ type: "list", ordered: true, start: 1 });
    expect((blocks[2] as { items: unknown[] }).items).toHaveLength(2);
  });

  it("turns headings into bold lines and keeps line breaks inside paragraphs", () => {
    const [block] = parseMarkdown("## Regla\nUsa *since* con un punto");
    expect(block).toEqual({
      type: "paragraph",
      lines: [
        [{ type: "bold", text: "Regla" }],
        [
          { type: "text", text: "Usa " },
          { type: "italic", text: "since" },
          { type: "text", text: " con un punto" },
        ],
      ],
    });
  });

  it("continues an indented line inside the last list item", () => {
    const [block] = parseMarkdown("- first\n  more\n- second");
    expect(block).toMatchObject({ type: "list", items: [[{ text: "first" }, { text: " more" }], [{ text: "second" }]] });
  });
});

describe("assistantPrompt", () => {
  it("adds the card as data only when there is one", () => {
    expect(assistantPrompt("es")).not.toContain("<card>");
    expect(assistantPrompt("es")).toContain("Spanish");
    expect(assistantPrompt("en", "craving — antojo")).toContain("<card>\ncraving — antojo\n</card>");
  });
});
