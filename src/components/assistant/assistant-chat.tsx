"use client";

import { Fragment, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { ArrowUp, Check, Copy, KeyRound, RotateCcw, Sparkles, Square } from "lucide-react";
import { buttonStyles } from "@/components/ui/button";
import { useMessages } from "@/lib/i18n/client";
import { assistantStatus } from "@/lib/assistant/actions";
import { parseMarkdown, type Inline } from "@/lib/assistant/markdown";
import { MAX_QUESTION, MAX_TURNS, type AssistantError, type AssistantEvent, type ChatMessage } from "@/lib/assistant/types";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "fc-assistant-chat";

interface Entry {
  id: string;
  role: ChatMessage["role"];
  content: string;
  pending?: boolean;
  error?: AssistantError;
  truncated?: boolean;
}

function loadEntries(): Entry[] {
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "[]") as Entry[];
    return Array.isArray(saved) ? saved.filter((entry) => entry && typeof entry.content === "string" && !entry.pending).slice(-MAX_TURNS * 2) : [];
  } catch {
    return [];
  }
}

function saveEntries(entries: Entry[]) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(entries.filter((entry) => !entry.pending).slice(-MAX_TURNS * 2)));
  } catch {
    return;
  }
}

function newId() {
  return Math.random().toString(36).slice(2);
}

function history(entries: Entry[]): ChatMessage[] {
  const turns: ChatMessage[] = [];
  entries.forEach((entry, index) => {
    if (entry.role === "assistant" || entry.error || entry.pending) return;
    const reply = entries[index + 1];
    if (reply?.role !== "assistant" || reply.error || reply.pending || !reply.content.trim()) return;
    turns.push({ role: "user", content: entry.content }, { role: "assistant", content: reply.content });
  });
  return turns.slice(-(MAX_TURNS - 1) * 2);
}

function InlineText({ parts }: { parts: Inline[] }) {
  return (
    <>
      {parts.map((part, index) => {
        if (part.type === "bold") return <strong key={index} className="font-semibold">{part.text}</strong>;
        if (part.type === "italic") return <em key={index}>{part.text}</em>;
        if (part.type === "code") return <code key={index} className="rounded bg-muted px-1 py-0.5 font-mono text-[0.9em]">{part.text}</code>;
        return <Fragment key={index}>{part.text}</Fragment>;
      })}
    </>
  );
}

function Markdown({ text }: { text: string }) {
  const blocks = useMemo(() => parseMarkdown(text), [text]);
  return (
    <div className="flex flex-col gap-2.5 text-sm leading-relaxed">
      {blocks.map((block, index) => {
        if (block.type === "paragraph") {
          return (
            <p key={index}>
              {block.lines.map((line, lineIndex) => (
                <Fragment key={lineIndex}>
                  {lineIndex > 0 ? <br /> : null}
                  <InlineText parts={line} />
                </Fragment>
              ))}
            </p>
          );
        }
        const List = block.ordered ? "ol" : "ul";
        return (
          <List key={index} start={block.ordered ? block.start : undefined} className={cn("flex flex-col gap-1 pl-5", block.ordered ? "list-decimal" : "list-disc")}>
            {block.items.map((item, itemIndex) => (
              <li key={itemIndex} className="pl-0.5 marker:text-muted-foreground">
                <InlineText parts={item} />
              </li>
            ))}
          </List>
        );
      })}
    </div>
  );
}

function Avatar() {
  return (
    <span aria-hidden className="flex size-7 shrink-0 items-center justify-center rounded-full border bg-card text-foreground">
      <Sparkles className="size-3.5" />
    </span>
  );
}

function Thinking({ label }: { label: string }) {
  return (
    <span className="flex items-center gap-2 pt-1 text-sm text-muted-foreground">
      <span className="flex gap-1" aria-hidden>
        {[0, 160, 320].map((delay) => (
          <span key={delay} className="size-1.5 rounded-full bg-current animate-blink" style={{ "--delay": `${delay}ms` } as CSSProperties} />
        ))}
      </span>
      {label}
    </span>
  );
}

function CopyButton({ text }: { text: string }) {
  const t = useMessages().assistant;
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() =>
        void navigator.clipboard?.writeText(text).then(() => {
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1500);
        })
      }
      aria-label={copied ? t.copied : t.copy}
      title={copied ? t.copied : t.copy}
      className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
    </button>
  );
}

function Notice({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="m-auto flex max-w-xs flex-col items-center gap-3 py-6 text-center animate-in">
      <span className="flex size-11 items-center justify-center rounded-full bg-muted text-foreground [&>svg]:size-5">{icon}</span>
      <div className="flex flex-col gap-1">
        <p className="font-medium">{title}</p>
        {children}
      </div>
    </div>
  );
}

interface AssistantChatProps {
  card?: string | null;
  autoFocus?: boolean;
  embedded?: boolean;
}

export function AssistantChat({ card = null, autoFocus = false, embedded = false }: AssistantChatProps) {
  const t = useMessages().assistant;
  const [entries, setEntries] = useState<Entry[]>(loadEntries);
  const [input, setInput] = useState("");
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const [streaming, setStreaming] = useState(false);
  const controller = useRef<AbortController | null>(null);
  const end = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    let cancelled = false;
    assistantStatus()
      .then((status) => !cancelled && setHasKey(status.hasKey))
      .catch(() => !cancelled && setHasKey(true));
    return () => {
      cancelled = true;
      controller.current?.abort();
    };
  }, []);

  useEffect(() => {
    end.current?.scrollIntoView({ block: "nearest" });
    if (!streaming) saveEntries(entries);
  }, [entries, streaming]);

  useEffect(() => {
    const node = field.current;
    if (!node) return;
    node.style.height = "auto";
    node.style.height = `${Math.min(node.scrollHeight, 160)}px`;
  }, [input]);

  const update = (id: string, patch: (entry: Entry) => Partial<Entry>) =>
    setEntries((current) => current.map((entry) => (entry.id === id ? { ...entry, ...patch(entry) } : entry)));

  const ask = async (text: string, base: Entry[] = entries) => {
    const question = text.trim().slice(0, MAX_QUESTION);
    if (!question || streaming) return;
    const user: Entry = { id: newId(), role: "user", content: question };
    const reply: Entry = { id: newId(), role: "assistant", content: "", pending: true };
    setEntries([...base, user, reply]);
    setInput("");
    if (!navigator.onLine) {
      update(reply.id, () => ({ pending: false, error: "offline" }));
      return;
    }
    const abort = new AbortController();
    controller.current = abort;
    setStreaming(true);
    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...history(base), { role: "user", content: question }], card }),
        signal: abort.signal,
      });
      if (!response.ok || !response.body) {
        const data = (await response.json().catch(() => ({}))) as { error?: AssistantError };
        const error = data.error ?? "unavailable";
        if (error === "no-key") setHasKey(false);
        update(reply.id, () => ({ pending: false, error }));
        return;
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let finished = false;
      while (!finished) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let newline = buffer.indexOf("\n");
        while (newline >= 0) {
          const line = buffer.slice(0, newline).trim();
          buffer = buffer.slice(newline + 1);
          newline = buffer.indexOf("\n");
          if (!line) continue;
          const event = JSON.parse(line) as AssistantEvent;
          if (event.type === "text") update(reply.id, (entry) => ({ content: entry.content + event.text }));
          else if (event.type === "done") {
            update(reply.id, () => ({ pending: false, truncated: event.truncated }));
            finished = true;
          } else {
            if (event.error === "invalid-key") setHasKey(true);
            update(reply.id, () => ({ pending: false, error: event.error }));
            finished = true;
          }
        }
      }
      update(reply.id, (entry) => (entry.pending ? { pending: false, error: entry.content ? undefined : "unavailable" } : {}));
    } catch {
      if (abort.signal.aborted) {
        setEntries((current) => current.flatMap((entry) => (entry.id !== reply.id ? [entry] : entry.content.trim() ? [{ ...entry, pending: false }] : [])));
      } else update(reply.id, () => ({ pending: false, error: "unavailable" }));
    } finally {
      controller.current = null;
      setStreaming(false);
    }
  };

  const retry = (id: string) => {
    const index = entries.findIndex((entry) => entry.id === id);
    const question = entries[index - 1];
    if (!question || question.role !== "user") return;
    void ask(question.content, entries.slice(0, index - 1));
  };

  const reset = () => {
    controller.current?.abort();
    setEntries([]);
    field.current?.focus();
  };

  const empty = entries.length === 0;
  const blocked = hasKey === false;

  return (
    <div className={cn("flex flex-1 flex-col", !embedded && "h-full min-h-0")}>
      <div className={cn("flex flex-1 flex-col", !embedded && "min-h-0 overflow-y-auto overscroll-contain px-4 py-4")} aria-live="polite">
        {blocked && empty ? (
          <Notice icon={<KeyRound />} title={t.noKeyTitle}>
            <p className="text-sm text-muted-foreground">{t.noKeyDescription}</p>
            <Link href="/settings#translator" className={buttonStyles("primary", "sm", "mt-3 self-center")}>
              {t.noKeyAction}
            </Link>
          </Notice>
        ) : empty ? (
          <Notice icon={<Sparkles />} title={t.emptyTitle}>
            <p className="text-sm text-muted-foreground">{t.emptyDescription}</p>
            {card ? <p className="text-xs text-muted-foreground">{t.cardHint}</p> : null}
            <div className="mt-3 flex flex-wrap justify-center gap-1.5">
              {t.suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => void ask(suggestion)}
                  disabled={hasKey === null}
                  className="rounded-full border bg-card px-3 py-1.5 text-xs transition-colors hover:border-foreground/30 hover:bg-muted disabled:opacity-60"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </Notice>
        ) : (
          <div className="flex flex-col gap-5">
            <div className="flex justify-end">
              <button type="button" onClick={reset} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                <RotateCcw className="size-3" />
                {t.newChat}
              </button>
            </div>
            {entries.map((entry) =>
              entry.role === "user" ? (
                <div key={entry.id} className="flex justify-end animate-in">
                  <p className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-accent px-3.5 py-2 text-sm text-accent-foreground">
                    <span className="sr-only">{t.you}: </span>
                    {entry.content}
                  </p>
                </div>
              ) : (
                <div key={entry.id} className="group flex items-start gap-2.5">
                  <Avatar />
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5 pt-0.5">
                    {entry.content ? <Markdown text={entry.content} /> : entry.pending ? <Thinking label={t.thinking} /> : null}
                    {entry.truncated ? <p className="text-xs text-muted-foreground">{t.truncated}</p> : null}
                    {entry.error ? (
                      <div className="flex flex-wrap items-center gap-2 text-sm text-danger">
                        <span>{t.errors[entry.error]}</span>
                        {entry.error !== "no-key" && entry.error !== "invalid-key" ? (
                          <button type="button" onClick={() => retry(entry.id)} disabled={streaming} className="font-medium text-foreground underline underline-offset-2">
                            {t.retry}
                          </button>
                        ) : (
                          <Link href="/settings#translator" className="font-medium text-foreground underline underline-offset-2">
                            {t.noKeyAction}
                          </Link>
                        )}
                      </div>
                    ) : null}
                    {!entry.pending && entry.content ? (
                      <div className="-ml-1.5 flex opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100">
                        <CopyButton text={entry.content} />
                      </div>
                    ) : null}
                  </div>
                </div>
              ),
            )}
          </div>
        )}
        <div ref={end} />
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void ask(input);
        }}
        className={cn("bg-background", embedded ? "sticky bottom-0 -mx-4 -mb-4 mt-4 border-t px-4 pb-4 pt-3" : "border-t p-3")}
      >
        <div className="flex items-end gap-2 rounded-2xl border bg-card p-1.5 pl-3.5 transition-shadow focus-within:border-accent focus-within:ring-2 focus-within:ring-ring">
          <textarea
            ref={field}
            rows={1}
            value={input}
            maxLength={MAX_QUESTION}
            autoFocus={autoFocus}
            disabled={blocked}
            aria-label={t.placeholder}
            placeholder={t.placeholder}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                event.preventDefault();
                void ask(input);
              }
            }}
            className="max-h-40 min-h-8 flex-1 resize-none bg-transparent py-1.5 text-base leading-snug placeholder:text-muted-foreground focus:outline-none disabled:opacity-60 sm:text-sm"
          />
          {streaming ? (
            <button
              type="button"
              onClick={() => controller.current?.abort()}
              aria-label={t.stop}
              title={t.stop}
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-foreground text-background transition-transform active:scale-95"
            >
              <Square className="size-3 fill-current" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim() || blocked}
              aria-label={t.send}
              title={t.send}
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground transition-[transform,opacity] active:scale-95 disabled:opacity-40"
            >
              <ArrowUp className="size-4" />
            </button>
          )}
        </div>
        <p className="mt-1.5 hidden px-1 text-[11px] text-muted-foreground md:block">{t.inputHint}</p>
      </form>
    </div>
  );
}
