import { describe, expect, it } from "vitest";
import { clozeOrdinals, isQuestionEmpty, plainText, renderCard, rewriteMedia, type RenderInput } from "./render";

function input(overrides: Partial<RenderInput> = {}): RenderInput {
  return {
    fields: { Anverso: "Hola", Reverso: "Hello" },
    template: { name: "Tarjeta 1", qfmt: "{{Anverso}}", afmt: "{{FrontSide}}<hr id=answer>{{Reverso}}" },
    css: ".card { color: red; }",
    ord: 0,
    kind: "STANDARD",
    tags: ["idiomas", "básico"],
    deckName: "Idiomas::Inglés",
    noteTypeName: "Básico",
    mediaBase: "/api/media/",
    ...overrides,
  };
}

describe("renderCard", () => {
  it("renders basic fields and FrontSide", () => {
    const result = renderCard(input());
    expect(result.question).toBe("Hola");
    expect(result.answer).toBe("Hola<hr id=answer>Hello");
  });

  it("supports special fields", () => {
    const result = renderCard(
      input({ template: { name: "T", qfmt: "{{Tags}} | {{Deck}} | {{Subdeck}} | {{Card}} | {{Type}}", afmt: "" } }),
    );
    expect(result.question).toBe("idiomas básico | Idiomas::Inglés | Inglés | T | Básico");
  });

  it("handles conditional sections", () => {
    const template = { name: "T", qfmt: "{{#Extra}}extra:{{Extra}}{{/Extra}}{{^Extra}}sin extra{{/Extra}}", afmt: "" };
    expect(renderCard(input({ template })).question).toBe("sin extra");
    expect(renderCard(input({ template, fields: { Extra: "x" } })).question).toBe("extra:x");
  });

  it("renders cloze deletions per ordinal", () => {
    const fields = { Texto: "La capital de {{c1::Francia}} es {{c2::París::ciudad}}" };
    const template = { name: "Cloze", qfmt: "{{cloze:Texto}}", afmt: "{{cloze:Texto}}" };
    const first = renderCard(input({ kind: "CLOZE", fields, template, ord: 0 }));
    expect(first.question).toContain("[...]");
    expect(first.question).toContain("París");
    expect(first.answer).toContain('<span class="cloze">Francia</span>');
    const second = renderCard(input({ kind: "CLOZE", fields, template, ord: 1 }));
    expect(second.question).toContain("[ciudad]");
    expect(second.question).toContain("Francia");
  });

  it("rewrites media sources and extracts sound tags", () => {
    const fields = { Anverso: '<img src="foto 1.jpg"> [sound:audio.mp3]', Reverso: "" };
    const result = renderCard(input({ fields }));
    expect(result.question).toContain('src="/api/media/foto%201.jpg"');
    expect(result.question).toContain('data-src="/api/media/audio.mp3"');
    expect(result.audio.question).toEqual(["/api/media/audio.mp3"]);
  });

  it("leaves external urls untouched", () => {
    expect(rewriteMedia('<img src="https://x.com/a.png">', "/m/")).toBe('<img src="https://x.com/a.png">');
  });

  it("strips scripts and inline handlers", () => {
    const fields = { Anverso: '<script>alert(1)</script><b onclick="x()">hi</b>', Reverso: "" };
    const result = renderCard(input({ fields }));
    expect(result.question).toBe("<b>hi</b>");
  });

  it("applies the hint and text filters", () => {
    const fields = { Anverso: "<b>Hola</b>", Pista: "ayuda" };
    const template = { name: "T", qfmt: "{{text:Anverso}} {{hint:Pista}}", afmt: "" };
    const result = renderCard(input({ fields, template }));
    expect(result.question).toContain("Hola <details");
    expect(result.question).not.toContain("<b>");
  });
});

describe("helpers", () => {
  it("detects cloze ordinals", () => {
    expect(clozeOrdinals("{{c2::a}} {{c1::b}} {{c2::c}}")).toEqual([0, 1]);
  });

  it("detects empty questions", () => {
    expect(isQuestionEmpty(input({ fields: { Anverso: "", Reverso: "x" } }))).toBe(true);
    expect(isQuestionEmpty(input({ fields: { Anverso: "<img src=a.png>", Reverso: "" } }))).toBe(false);
  });

  it("produces plain text previews", () => {
    expect(plainText("<b>Hola</b>&nbsp;<br>mundo [sound:a.mp3]")).toBe("Hola mundo");
  });
});
