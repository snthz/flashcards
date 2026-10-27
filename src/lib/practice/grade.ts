import type { Grade } from "./types";

export function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/[’‘`´]/g, "'")
    .replace(/[“”«»]/g, '"')
    .replace(/[¿¡!?.,;:"()…]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function stripAccents(value: string) {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

export function distance(a: string, b: string) {
  if (a === b) return 0;
  const previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    let diagonal = previous[0];
    previous[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const above = previous[j];
      previous[j] = Math.min(previous[j] + 1, previous[j - 1] + 1, diagonal + (a[i - 1] === b[j - 1] ? 0 : 1));
      diagonal = above;
    }
  }
  return previous[b.length];
}

export function acceptedAnswers(expected: string) {
  const whole = expected.trim();
  const parts = whole
    .split(/\s*[,;\/|]\s*|\s+\bor\b\s+|\s+\bo\b\s+/i)
    .map((part) => part.replace(/\([^)]*\)/g, "").trim())
    .filter(Boolean);
  const withoutTo = [whole, ...parts].map((value) => value.replace(/^to\s+/i, "")).filter(Boolean);
  return [...new Set([whole, ...parts, ...withoutTo])];
}

function tolerance(length: number) {
  if (length >= 12) return Math.floor(length * 0.1) + 1;
  if (length >= 8) return 2;
  if (length >= 4) return 1;
  return 0;
}

export function grade(input: string, expected: string | string[]): Grade {
  const given = normalize(input);
  if (!given) return "wrong";
  const answers = (Array.isArray(expected) ? expected : [expected]).flatMap(acceptedAnswers).map(normalize).filter(Boolean);
  const bare = given.replace(/^to /, "");
  if (answers.some((answer) => answer === given || answer === bare)) return "correct";
  const plain = stripAccents(bare);
  if (answers.some((answer) => stripAccents(answer) === plain)) return "almost";
  if (answers.some((answer) => distance(stripAccents(answer), plain) <= tolerance(answer.length))) return "almost";
  return "wrong";
}
