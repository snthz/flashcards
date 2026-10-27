"use client";

import { useEffect, useState, useTransition } from "react";
import { Check } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox, Select, Textarea } from "@/components/ui/input";
import { Field, FormError } from "@/components/ui/field";
import { useMessages } from "@/lib/i18n/client";
import { saveTranslationCard, translatorDecks } from "@/lib/translate/actions";

const DECK_KEY = "fc-translate-deck";

export interface CardDraft {
  front: string;
  back: string;
}

function rememberDeck(id: string) {
  try {
    localStorage.setItem(DECK_KEY, id);
  } catch {
    return;
  }
}

function rememberedDeck() {
  try {
    return localStorage.getItem(DECK_KEY);
  } catch {
    return null;
  }
}

export function SaveCardDialog({ draft, deckId, onClose }: { draft: CardDraft | null; deckId?: string; onClose: () => void }) {
  const t = useMessages().translate;
  const [decks, setDecks] = useState<Array<{ id: string; name: string }> | null>(null);
  const [form, setForm] = useState({ deckId: "", front: "", back: "", reversed: false });
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
        const preferred = [deckId, rememberedDeck()].find((id) => id && list.some((deck) => deck.id === id));
        setForm({ deckId: preferred ?? list[0]?.id ?? "", front: draft.front, back: draft.back, reversed: false });
        setError(null);
        setSaved(false);
      })
      .catch(() => !cancelled && setDecks([]));
    return () => {
      cancelled = true;
    };
  }, [draft, deckId]);

  const submit = () =>
    startTransition(async () => {
      setError(null);
      const result = await saveTranslationCard(form);
      if (result.error) {
        setError(result.error);
        return;
      }
      rememberDeck(form.deckId);
      setSaved(true);
      window.setTimeout(onClose, 900);
    });

  return (
    <Dialog open={Boolean(draft)} onClose={onClose} title={t.saveTitle} className="max-w-lg">
      {decks && decks.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t.noDecks}</p>
      ) : (
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <Field label={t.deck} htmlFor="save-card-deck">
            <Select id="save-card-deck" value={form.deckId} onChange={(event) => setForm({ ...form, deckId: event.target.value })} disabled={!decks}>
              {(decks ?? []).map((deck) => (
                <option key={deck.id} value={deck.id}>
                  {deck.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t.front} htmlFor="save-card-front">
            <Textarea id="save-card-front" className="min-h-16" value={form.front} onChange={(event) => setForm({ ...form, front: event.target.value })} />
          </Field>
          <Field label={t.back} htmlFor="save-card-back">
            <Textarea id="save-card-back" value={form.back} onChange={(event) => setForm({ ...form, back: event.target.value })} />
          </Field>
          <label className="flex cursor-pointer items-center gap-3 text-sm">
            <Checkbox checked={form.reversed} onChange={(event) => setForm({ ...form, reversed: event.target.checked })} />
            {t.reversed}
          </label>
          <FormError message={error} />
          <div className="flex justify-end">
            <Button type="submit" loading={pending} disabled={!decks || !form.deckId || !form.front.trim() || !form.back.trim() || saved}>
              {saved ? <Check className="size-4" /> : null}
              {saved ? t.saved : t.save}
            </Button>
          </div>
        </form>
      )}
    </Dialog>
  );
}
