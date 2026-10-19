"use client";

import { useActionState, useEffect, useState, useTransition, type ReactNode } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input, Textarea } from "@/components/ui/input";
import { Field, FormError } from "@/components/ui/field";
import { createDeck, deleteDeck, renameDeck, type ActionState } from "@/lib/decks/actions";
import type { DeckNode } from "@/lib/decks/queries";
import { DECK_DESCRIPTION_MAX } from "@/lib/validation/deck";
import { useI18n } from "@/lib/i18n/client";
import { formatNumber } from "@/lib/utils";

export function CreateDeckButton({
  children,
  parentId,
  variant,
  size,
}: {
  children: ReactNode;
  parentId?: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<ActionState, FormData>(createDeck, {});
  return (
    <>
      <Button variant={variant} size={size} onClick={() => setOpen(true)}>
        {children}
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} title={parentId ? t.decks.newSubdeck : t.decks.newDeck}>
        <form action={action} className="flex flex-col gap-4">
          <FormError message={state.error} />
          <input type="hidden" name="parentId" value={parentId ?? ""} />
          <Field label={t.decks.name} htmlFor="deck-name">
            <Input id="deck-name" name="name" autoFocus required maxLength={120} placeholder={t.decks.namePlaceholder} />
          </Field>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button type="submit" loading={pending}>
              {t.common.create}
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}

export function RenameDeckDialog({ deck, onClose }: { deck: DeckNode | null; onClose: () => void }) {
  const { t } = useI18n();
  const [state, action, pending] = useActionState<ActionState, FormData>(renameDeck, {});
  useEffect(() => {
    if (state.success) onClose();
  }, [state.success, onClose]);
  return (
    <Dialog open={deck !== null} onClose={onClose} title={t.decks.renameTitle}>
      {deck ? (
        <form action={action} className="flex flex-col gap-4" key={deck.id}>
          <FormError message={state.error} />
          <input type="hidden" name="id" value={deck.id} />
          <Field label={t.decks.name} htmlFor="rename-name">
            <Input id="rename-name" name="name" defaultValue={deck.name} required maxLength={120} autoFocus />
          </Field>
          <Field label={t.decks.description} htmlFor="rename-description">
            <Textarea id="rename-description" name="description" defaultValue={deck.description} maxLength={DECK_DESCRIPTION_MAX} />
          </Field>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              {t.common.cancel}
            </Button>
            <Button type="submit" loading={pending}>
              {t.common.save}
            </Button>
          </div>
        </form>
      ) : null}
    </Dialog>
  );
}

export function DeleteDeckDialog({ deck, onClose }: { deck: DeckNode | null; onClose: () => void }) {
  const { locale, t } = useI18n();
  const [pending, startTransition] = useTransition();
  return (
    <Dialog
      open={deck !== null}
      onClose={onClose}
      title={t.decks.deleteTitle}
      description={
        deck ? t.decks.deleteDescription(deck.fullName, deck.counts.total, formatNumber(deck.counts.total, locale)) : undefined
      }
    >
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>
          {t.common.cancel}
        </Button>
        <Button
          variant="danger"
          loading={pending}
          onClick={() => {
            if (!deck) return;
            startTransition(async () => {
              await deleteDeck(deck.id);
              onClose();
            });
          }}
        >
          {t.common.delete}
        </Button>
      </div>
    </Dialog>
  );
}
