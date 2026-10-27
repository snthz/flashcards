import { describe, expect, it } from "vitest";
import { shortcutUrl } from "./focus";

describe("shortcutUrl", () => {
  it("runs a shortcut by name", () => {
    expect(shortcutUrl("Flashcards Focus On", null)).toBe("shortcuts://run-shortcut?name=Flashcards%20Focus%20On");
  });

  it("returns to the page afterwards when it can", () => {
    expect(shortcutUrl("Estudio", "https://app.example/decks/1/study")).toBe(
      "shortcuts://x-callback-url/run-shortcut?name=Estudio&x-success=https%3A%2F%2Fapp.example%2Fdecks%2F1%2Fstudy",
    );
  });
});
