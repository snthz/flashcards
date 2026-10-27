import { describe, expect, it } from "vitest";
import { GRAMMAR_TOPICS, findTopic, neighbors, topicsByLevel } from "./index";
import { GRAMMAR_LEVELS } from "./types";

describe("grammar content", () => {
  it("covers every level with unique slugs", () => {
    for (const level of GRAMMAR_LEVELS) expect(topicsByLevel(level).length, level).toBeGreaterThanOrEqual(5);
    const slugs = GRAMMAR_TOPICS.map((topic) => topic.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  });

  it("keeps levels in order", () => {
    const order = GRAMMAR_TOPICS.map((topic) => GRAMMAR_LEVELS.indexOf(topic.level));
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });

  for (const topic of GRAMMAR_TOPICS) {
    it(`${topic.level} ${topic.slug} is complete`, () => {
      expect(topic.title.trim()).not.toBe("");
      expect(topic.english.trim()).not.toBe("");
      expect(topic.summary.length).toBeLessThanOrEqual(200);
      expect(topic.sections.length).toBeGreaterThanOrEqual(3);
      for (const section of topic.sections) {
        expect(section.heading.trim()).not.toBe("");
        expect(section.body.trim().length).toBeGreaterThan(40);
        expect(section.body).not.toMatch(/^#|<[a-z]|\]\(|\|.*\|/m);
      }
      for (const table of topic.tables) {
        expect(table.columns.length).toBeGreaterThan(1);
        for (const row of table.rows) expect(row.length, `${topic.slug} table row ${row[0]}`).toBe(table.columns.length);
      }
      expect(topic.examples.length).toBeGreaterThanOrEqual(6);
      for (const [english, spanish] of topic.examples) expect(english.trim() && spanish.trim()).toBeTruthy();
      expect(topic.mistakes.length).toBeGreaterThanOrEqual(3);
      expect(new Set(topic.examples.map(([english]) => english)).size).toBe(topic.examples.length);
      expect(topic.quiz).toHaveLength(5);
      for (const question of topic.quiz) {
        expect(question.options.length).toBeGreaterThanOrEqual(3);
        expect(new Set(question.options).size, question.prompt).toBe(question.options.length);
        expect(question.answer).toBeGreaterThanOrEqual(0);
        expect(question.answer).toBeLessThan(question.options.length);
        expect(question.prompt.split("___").length).toBeLessThanOrEqual(2);
        expect(question.explanation.trim()).not.toBe("");
      }
    });
  }

  it("finds topics and their neighbors", () => {
    const [first, second] = GRAMMAR_TOPICS;
    expect(findTopic(first.slug)).toBe(first);
    expect(findTopic("nope")).toBeNull();
    expect(neighbors(first.slug)).toEqual({ previous: null, next: second });
  });
});
