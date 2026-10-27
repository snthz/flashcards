"use client";

import { useEffect, useMemo, useState, useTransition, type ReactNode } from "react";
import { Check, Volume2 } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Field, FormError } from "@/components/ui/field";
import { CardFrame } from "@/components/study/card-frame";
import { useI18n } from "@/lib/i18n/client";
import { fieldMap, renderCard } from "@/lib/anki/render";
import { saveTranslationCard, translatorDecks } from "@/lib/translate/actions";
import { vocabularyFields, vocabularyNoteType } from "@/lib/translate/vocabulary";
import type { LanguageCode } from "@/lib/translate/types";
import { cn } from "@/lib/utils";

const DECK_KEY = "fc-translate-deck";
const DIRECTION_KEY = "fc-translate-direction";
const NO_AUDIO: string[] = [];

type Direction = "forward" | "reverse" | "both";

export interface CardDraft {
  term: string;
  termLang: LanguageCode;
  meaning: string;
  meaningLang: LanguageCode;
  kind: string;
  synonyms: Partial<Record<LanguageCode, string>>;
  example: string;
  exampleTranslation: string;
  notes: string;
}

export function swapDraft(draft: CardDraft): CardDraft {
  return {
    ...draft,
    term: draft.meaning,
    meaning: draft.term,
    termLang: draft.meaningLang,
    meaningLang: draft.termLang,
    example: draft.exampleTranslation || "",
    exampleTranslation: draft.exampleTranslation ? draft.example : "",
  };
}

function remember(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    return;
  }
}

function recall(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function Segmented<T extends string>({ value, options, onChange, label }: { value: T; options: Array<{ value: T; label: string }>; onChange: (value: T) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="grid auto-cols-fr grid-flow-col gap-1 rounded-lg bg-muted p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "min-h-8 rounded-md px-2 py-1 text-xs font-medium transition-colors sm:text-sm",
            value === option.value ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </div>
  );
}

export function SaveCardDialog({ draft, deckId, onClose, languageName }: { draft: CardDraft | null; deckId?: string; onClose: () => void; languageName: (code: string) => string }) {
  const { locale, t } = useI18n();
  const tr = t.translate;
  const [decks, setDecks] = useState<Array<{ id: string; name: string }> | null>(null);
  const [deck, setDeck] = useState("");
  const [card, setCard] = useState<CardDraft | null>(null);
  const [direction, setDirection] = useState<Direction>("forward");
  const [side, setSide] = useState<"question" | "answer">("answer");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!draft) return;
    let cancelled = false;
    translatorDecks()
      .then((list) => {
        if (cancelled) return;
        setDecks(list);
        const preferred = [deckId, recall(DECK_KEY)].find((id) => id && list.some((item) => item.id === id));
        setDeck(preferred ?? list[0]?.id ?? "");
        setCard(draft);
        const storedDirection = recall(DIRECTION_KEY);
        setDirection(storedDirection === "reverse" || storedDirection === "both" ? storedDirection : "forward");
        setSide("answer");
        setError(null);
        setSaved(false);
      })
      .catch(() => !cancelled && setDecks([]));
    return () => {
      cancelled = true;
    };
  }, [draft, deckId]);

  const synonyms = card ? (card.synonyms[card.termLang] ?? "") : "";
  const bilingual = Boolean(card && card.termLang !== card.meaningLang);

  const preview = useMemo(() => {
    if (!card || !card.term.trim() || !card.meaning.trim()) return null;
    const noteType = vocabularyNoteType(card.termLang, locale);
    const values = vocabularyFields({ ...card, synonyms, direction });
    const ord = direction === "reverse" ? 1 : 0;
    const rendered = renderCard({
      fields: fieldMap(
        noteType.fields.map((field) => field.name),
        values,
      ),
      template: noteType.templates[ord],
      css: noteType.css,
      ord,
      kind: "STANDARD",
      tags: [],
      deckName: "",
      noteTypeName: noteType.name,
      mediaBase: "/api/media/",
    });
    return { ...rendered, ord };
  }, [card, synonyms, direction, locale]);

  const update = (patch: Partial<CardDraft>) => setCard((current) => (current ? { ...current, ...patch } : current));

  const submit = () =>
    startTransition(async () => {
      if (!card) return;
      setError(null);
      const result = await saveTranslationCard({
        deckId: deck,
        term: card.term,
        meaning: card.meaning,
        termLang: card.termLang,
        kind: card.kind,
        synonyms,
        example: card.example,
        exampleTranslation: card.exampleTranslation,
        notes: card.notes,
        direction,
      });
      if (result.error) {
        setError(result.error);
        return;
      }
      remember(DECK_KEY, deck);
      remember(DIRECTION_KEY, direction);
      setSaved(true);
      window.setTimeout(onClose, 900);
    });

  const termName = card ? languageName(card.termLang) : "";
  const meaningName = card ? languageName(card.meaningLang) : "";

  return (
    <Dialog open={Boolean(draft)} onClose={onClose} title={tr.saveTitle} className="max-h-[92dvh] max-w-xl overflow-y-auto">
      {decks && decks.length === 0 ? (
        <p className="text-sm text-muted-foreground">{tr.noDecks}</p>
      ) : card ? (
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <Field label={tr.deck} htmlFor="save-card-deck">
            <Select id="save-card-deck" value={deck} onChange={(event) => setDeck(event.target.value)} disabled={!decks}>
              {(decks ?? []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
          </Field>

          {bilingual ? (
            <Group label={tr.learning}>
              <Segmented
                label={tr.learning}
                value={card.termLang}
                options={[card.termLang, card.meaningLang].map((code) => ({ value: code, label: languageName(code) }))}
                onChange={(value) => value !== card.termLang && setCard(swapDraft(card))}
              />
            </Group>
          ) : null}

          <Group label={tr.cards}>
            <Segmented
              label={tr.cards}
              value={direction}
              onChange={setDirection}
              options={[
                { value: "forward", label: bilingual ? `${termName} → ${meaningName}` : tr.wordToDefinition },
                { value: "reverse", label: bilingual ? `${meaningName} → ${termName}` : tr.definitionToWord },
                { value: "both", label: tr.both },
              ]}
            />
          </Group>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={`${tr.term} · ${termName}`} htmlFor="save-card-term">
              <Input id="save-card-term" value={card.term} lang={card.termLang} onChange={(event) => update({ term: event.target.value })} />
            </Field>
            <Field label={`${tr.meaning} · ${meaningName}`} htmlFor="save-card-meaning">
              <Input id="save-card-meaning" value={card.meaning} lang={card.meaningLang} onChange={(event) => update({ meaning: event.target.value })} />
            </Field>
            <Field label={tr.kind} htmlFor="save-card-kind">
              <Input id="save-card-kind" value={card.kind} placeholder={tr.kindPlaceholder} onChange={(event) => update({ kind: event.target.value })} />
            </Field>
            <Field label={tr.synonyms} htmlFor="save-card-synonyms">
              <Input
                id="save-card-synonyms"
                value={synonyms}
                lang={card.termLang}
                placeholder={tr.synonymsPlaceholder}
                onChange={(event) => update({ synonyms: { ...card.synonyms, [card.termLang]: event.target.value } })}
              />
            </Field>
            <Field label={`${tr.example} · ${termName}`} htmlFor="save-card-example">
              <Input id="save-card-example" value={card.example} lang={card.termLang} onChange={(event) => update({ example: event.target.value })} />
            </Field>
            <Field label={tr.exampleTranslation} htmlFor="save-card-example-translation">
              <Input id="save-card-example-translation" value={card.exampleTranslation} onChange={(event) => update({ exampleTranslation: event.target.value })} />
            </Field>
          </div>
          <Field label={tr.cardNotes} htmlFor="save-card-notes">
            <Textarea id="save-card-notes" rows={2} className="resize-none" value={card.notes} onChange={(event) => update({ notes: event.target.value })} />
          </Field>

          <section className="flex flex-col gap-2" aria-label={tr.preview}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium">{tr.preview}</span>
              <div className="flex rounded-lg border bg-muted/60 p-0.5 text-xs">
                {(["question", "answer"] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setSide(value)}
                    aria-pressed={side === value}
                    className={cn("rounded-md px-2.5 py-1 font-medium transition-colors", side === value ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground")}
                  >
                    {value === "question" ? tr.previewFront : tr.previewBack}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex max-h-72 min-h-32 flex-col overflow-y-auto rounded-xl border bg-card">
              {preview ? (
                <CardFrame
                  key={`${side}-${preview.ord}`}
                  html={side === "question" ? preview.question : preview.answer}
                  css={preview.css}
                  ord={preview.ord}
                  side={side}
                  autoplay={NO_AUDIO}
                />
              ) : null}
            </div>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Volume2 className="size-3.5 shrink-0" />
              {tr.audioHint}
            </p>
          </section>

          <FormError message={error} />
          <div className="flex justify-end">
            <Button type="submit" loading={pending} disabled={!decks || !deck || !card.term.trim() || !card.meaning.trim() || saved}>
              {saved ? <Check className="size-4" /> : null}
              {saved ? tr.saved : tr.save}
            </Button>
          </div>
        </form>
      ) : null}
    </Dialog>
  );
}
