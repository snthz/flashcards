import { describe, expect, it } from "vitest";
import { diffTyped, normalizeTyped, typeAnswerHtml } from "./type-answer";

describe("normalizeTyped", () => {
  it("collapses whitespace and trims", () => {
    expect(normalizeTyped("  look   up \n")).toBe("look up");
  });

  it("composes accents so precomposed and decomposed input match", () => {
    expect(normalizeTyped("canción")).toBe("canción");
  });
});

describe("diffTyped", () => {
  it("marks every character good when the answer matches", () => {
    const diff = diffTyped("give up", "give up");
    expect(diff.typed).toEqual([{ kind: "good", text: "give up" }]);
    expect(diff.expected).toEqual([{ kind: "good", text: "give up" }]);
  });

  it("marks extra typed characters as bad and missing ones as missed", () => {
    const diff = diffTyped("gve upp", "give up");
    expect(diff.typed).toEqual([
      { kind: "good", text: "g" },
      { kind: "missed", text: "-" },
      { kind: "good", text: "ve up" },
      { kind: "bad", text: "p" },
    ]);
    expect(diff.expected).toEqual([
      { kind: "good", text: "g" },
      { kind: "missed", text: "i" },
      { kind: "good", text: "ve up" },
    ]);
  });

  it("handles a completely wrong answer", () => {
    const diff = diffTyped("xyz", "ab");
    expect(diff.typed.map((s) => s.kind)).toContain("bad");
    expect(diff.expected).toEqual([{ kind: "missed", text: "ab" }]);
  });
});

describe("typeAnswerHtml", () => {
  it("shows only the expected answer when nothing was typed", () => {
    expect(typeAnswerHtml("", "take off")).toBe('<code id="typeans">take off</code>');
  });

  it("shows a single good span for a correct answer", () => {
    expect(typeAnswerHtml(" take  off ", "take off")).toBe('<code id="typeans"><span class="typeGood">take off</span></code>');
  });

  it("renders both lines with an arrow when the answer differs", () => {
    const html = typeAnswerHtml("tak off", "take off");
    expect(html).toContain('<span id="typearrow">&darr;</span>');
    expect(html).toContain('<span class="typeMissed">e</span>');
  });

  it("escapes html in the typed text", () => {
    expect(typeAnswerHtml("<b>", "b")).not.toContain("<b>");
  });
});
