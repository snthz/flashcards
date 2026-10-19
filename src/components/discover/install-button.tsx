"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Plus, RefreshCw } from "lucide-react";
import { Button, buttonStyles } from "@/components/ui/button";
import { FormError } from "@/components/ui/field";
import { installPremadeDeck } from "@/lib/premade/actions";
import { useMessages } from "@/lib/i18n/client";

export function InstallButton({ slug, installedDeckId }: { slug: string; installedDeckId: string | null }) {
  const t = useMessages();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [updated, setUpdated] = useState(false);

  const install = () =>
    startTransition(async () => {
      setError(null);
      const result = await installPremadeDeck(slug);
      if (result.error) return setError(result.error);
      if (installedDeckId) return setUpdated(true);
      if (result.deckId) router.push(`/decks/${result.deckId}`);
    });

  return (
    <div className="flex flex-col gap-3">
      <FormError message={error} />
      {installedDeckId ? (
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link href={`/decks/${installedDeckId}`} className={buttonStyles("primary", "lg", "sm:flex-1")}>
            <Check className="size-4" />
            {t.discover.openDeck}
          </Link>
          <Button variant="outline" size="lg" loading={pending} onClick={install}>
            {pending ? null : <RefreshCw className="size-4" />}
            {updated ? t.discover.updated : t.discover.updateContent}
          </Button>
        </div>
      ) : (
        <Button size="lg" className="w-full" loading={pending} onClick={install}>
          {pending ? null : <Plus className="size-4" />}
          {pending ? t.discover.adding : t.discover.addToDecks}
        </Button>
      )}
    </div>
  );
}
