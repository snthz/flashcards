export type Inline = { type: "text" | "bold" | "italic" | "code"; text: string };

export type Block = { type: "paragraph"; lines: Inline[][] } | { type: "list"; ordered: boolean; start: number; items: Inline[][] };

const INLINE = /\*\*(.+?)\*\*|__(.+?)__|`([^`]+)`|\*([^\s*](?:[^*]*[^\s*])?)\*|(?<![\p{L}\p{N}])_([^\s_](?:[^_]*[^\s_])?)_(?![\p{L}\p{N}])/gu;

export function parseInline(text: string): Inline[] {
  const parts: Inline[] = [];
  let index = 0;
  for (const match of text.matchAll(INLINE)) {
    const at = match.index ?? 0;
    if (at > index) parts.push({ type: "text", text: text.slice(index, at) });
    if (match[1] ?? match[2]) parts.push({ type: "bold", text: (match[1] ?? match[2])! });
    else if (match[3]) parts.push({ type: "code", text: match[3] });
    else parts.push({ type: "italic", text: (match[4] ?? match[5])! });
    index = at + match[0].length;
  }
  if (index < text.length) parts.push({ type: "text", text: text.slice(index) });
  return parts;
}

const BULLET = /^\s*[-*•]\s+(.*)$/;
const NUMBERED = /^\s*(\d{1,3})[.)]\s+(.*)$/;

export function parseMarkdown(source: string): Block[] {
  const blocks: Block[] = [];
  let current: Block | null = null;
  const flush = () => {
    if (current) blocks.push(current);
    current = null;
  };
  for (const raw of source.replace(/\r\n?/g, "\n").split("\n")) {
    const line = raw.replace(/^#{1,6}\s+(.*)$/, "**$1**").replace(/^>\s?/, "");
    if (!line.trim()) {
      flush();
      continue;
    }
    const bullet = BULLET.exec(line);
    const numbered = bullet ? null : NUMBERED.exec(line);
    if (bullet || numbered) {
      const ordered = Boolean(numbered);
      const text = bullet ? bullet[1] : numbered![2];
      const block = current as Block | null;
      if (block?.type === "list" && block.ordered === ordered) block.items.push(parseInline(text));
      else {
        flush();
        current = { type: "list", ordered, start: numbered ? Number(numbered[1]) : 1, items: [parseInline(text)] };
      }
      continue;
    }
    const block = current as Block | null;
    if (block?.type === "list" && /^\s{2,}\S/.test(raw)) {
      block.items[block.items.length - 1].push({ type: "text", text: ` ${line.trim()}` });
      continue;
    }
    if (block?.type === "paragraph") block.lines.push(parseInline(line.trim()));
    else {
      flush();
      current = { type: "paragraph", lines: [parseInline(line.trim())] };
    }
  }
  flush();
  return blocks;
}
