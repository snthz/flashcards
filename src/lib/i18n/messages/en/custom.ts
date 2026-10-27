import type { CustomStudy } from "@/lib/study/custom";

const FLAGS = ["", "Red", "Orange", "Green", "Blue", "Pink", "Turquoise", "Purple"];

export const custom = {
  button: "Custom study",
  title: "Custom study",
  description: "Study outside today's schedule. Your answers still reschedule the cards.",
  forgotten: "Review forgotten cards",
  forgottenHint: "Cards you answered Again recently.",
  ahead: "Review ahead",
  aheadHint: "Reviews that are due soon, before their date.",
  extraNew: "Study more new cards",
  extraNewHint: "Go beyond today's limit of new cards.",
  tag: "Study by tag",
  tagHint: "Every card with the tag, whatever its state.",
  flag: "Study flagged cards",
  flagHint: "Every card with the flag.",
  lastDays: (days: number) => (days === 1 ? "Last day" : `Last ${days} days`),
  nextDays: (days: number) => (days === 1 ? "Next day" : `Next ${days} days`),
  cards: (count: number) => `${count} cards`,
  noTags: "No tags in this deck",
  flagName: (flag: number) => FLAGS[flag] ?? String(flag),
  start: "Start",
  finished: "Custom session finished",
  badge: (study: CustomStudy) => {
    switch (study.mode) {
      case "forgotten":
        return `Forgotten · ${study.days === 1 ? "1 day" : `${study.days} days`}`;
      case "ahead":
        return `Ahead · ${study.days === 1 ? "1 day" : `${study.days} days`}`;
      case "new":
        return `+${study.count} new`;
      case "tag":
        return `#${study.tag}`;
      default:
        return `${FLAGS[study.flag ?? 0] ?? ""} flag`;
    }
  },
};
