"use client";

import { useActionState, useEffect, useState, useTransition, type ReactNode } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input, Textarea } from "@/components/ui/input";
import { Field, FormError } from "@/components/ui/field";
import { createDeck, deleteDeck, renameDeck, type ActionState } from "@/lib/decks/actions";
import type { DeckNode } from "@/lib/decks/queries";

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
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<ActionState, FormData>(createDeck, {});
  return (
    <>
      <Button variant={variant} size={size} onClick={() => setOpen(true)}>
        {children}
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} title={parentId ? "Nuevo submazo" : "Nuevo mazo"}>
        <form action={action} className="flex flex-col gap-4">
          <FormError message={state.error} />
          <input type="hidden" name="parentId" value={parentId ?? ""} />
          <Field label="Nombre" htmlFor="deck-name">
            <Input id="deck-name" name="name" autoFocus required maxLength={120} placeholder="Ej. Vocabulario" />
          </Field>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={pending}>
              Crear
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}

export function RenameDeckDialog({ deck, onClose }: { deck: DeckNode | null; onClose: () => void }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(renameDeck, {});
  useEffect(() => {
    if (state.success) onClose();
  }, [state.success, onClose]);
  return (
    <Dialog open={deck !== null} onClose={onClose} title="Renombrar mazo">
      {deck ? (
        <form action={action} className="flex flex-col gap-4" key={deck.id}>
          <FormError message={state.error} />
          <input type="hidden" name="id" value={deck.id} />
          <Field label="Nombre" htmlFor="rename-name">
            <Input id="rename-name" name="name" defaultValue={deck.name} required maxLength={120} autoFocus />
          </Field>
          <Field label="Descripción" htmlFor="rename-description">
            <Textarea id="rename-description" name="description" defaultValue={deck.description} maxLength={2000} />
          </Field>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" loading={pending}>
              Guardar
            </Button>
          </div>
        </form>
      ) : null}
    </Dialog>
  );
}

export function DeleteDeckDialog({ deck, onClose }: { deck: DeckNode | null; onClose: () => void }) {
  const [pending, startTransition] = useTransition();
  return (
    <Dialog
      open={deck !== null}
      onClose={onClose}
      title="Eliminar mazo"
      description={
        deck
          ? `Se eliminarán “${deck.fullName}”, sus submazos y ${deck.counts.total} tarjetas con su historial. Esta acción no se puede deshacer.`
          : undefined
      }
    >
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>
          Cancelar
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
          Eliminar
        </Button>
      </div>
    </Dialog>
  );
}
