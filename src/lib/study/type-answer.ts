type Kind = "good" | "bad" | "missed";

interface Segment {
  kind: Kind;
  text: string;
}

const MAX_DIFF_LENGTH = 1000;

const CLASS_NAMES: Record<Kind, string> = {
  good: "typeGood",
  bad: "typeBad",
  missed: "typeMissed",
};

export function normalizeTyped(value: string) {
  return value.normalize("NFC").replace(/\s+/g, " ").trim();
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function pushChar(segments: Segment[], kind: Kind, char: string) {
  const last = segments[segments.length - 1];
  if (last && last.kind === kind) last.text += char;
  else segments.push({ kind, text: char });
}

export function diffTyped(typed: string, expected: string): { typed: Segment[]; expected: Segment[] } {
  const a = Array.from(typed);
  const b = Array.from(expected);
  if (a.length > MAX_DIFF_LENGTH || b.length > MAX_DIFF_LENGTH) {
    const same = typed === expected;
    return {
      typed: a.length > 0 ? [{ kind: same ? "good" : "bad", text: typed }] : [],
      expected: b.length > 0 ? [{ kind: same ? "good" : "missed", text: expected }] : [],
    };
  }
  const rows = a.length + 1;
  const cols = b.length + 1;
  const table = new Uint16Array(rows * cols);
  for (let i = a.length - 1; i >= 0; i -= 1) {
    for (let j = b.length - 1; j >= 0; j -= 1) {
      table[i * cols + j] = a[i] === b[j] ? table[(i + 1) * cols + j + 1] + 1 : Math.max(table[(i + 1) * cols + j], table[i * cols + j + 1]);
    }
  }
  const typedSegments: Segment[] = [];
  const expectedSegments: Segment[] = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      pushChar(typedSegments, "good", a[i]);
      pushChar(expectedSegments, "good", b[j]);
      i += 1;
      j += 1;
    } else if (table[(i + 1) * cols + j] >= table[i * cols + j + 1]) {
      pushChar(typedSegments, "bad", a[i]);
      i += 1;
    } else {
      pushChar(typedSegments, "missed", "-");
      pushChar(expectedSegments, "missed", b[j]);
      j += 1;
    }
  }
  for (; i < a.length; i += 1) pushChar(typedSegments, "bad", a[i]);
  for (; j < b.length; j += 1) {
    pushChar(typedSegments, "missed", "-");
    pushChar(expectedSegments, "missed", b[j]);
  }
  return { typed: typedSegments, expected: expectedSegments };
}

function renderSegments(segments: Segment[]) {
  return segments.map((segment) => `<span class="${CLASS_NAMES[segment.kind]}">${escapeHtml(segment.text)}</span>`).join("");
}

export function typeAnswerHtml(typedValue: string, expectedValue: string) {
  const typed = normalizeTyped(typedValue);
  const expected = normalizeTyped(expectedValue);
  if (!typed) return `<code id="typeans">${escapeHtml(expected)}</code>`;
  if (typed === expected) return `<code id="typeans"><span class="typeGood">${escapeHtml(expected)}</span></code>`;
  const diff = diffTyped(typed, expected);
  return `<code id="typeans">${renderSegments(diff.typed)}<br><span id="typearrow">&darr;</span><br>${renderSegments(diff.expected)}</code>`;
}
