"use client";

import { useState, useTransition } from "react";
import { ExternalLink, KeyRound, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { ConfirmDialog } from "@/components/ui/dialog";
import { useMessages } from "@/lib/i18n/client";
import { removeTranslatorKey, saveTranslatorKey, saveTranslatorModel, type KeyState } from "@/lib/translate/actions";
import { CLAUDE_MODELS, type ClaudeModel } from "@/lib/translate/types";
import { cn } from "@/lib/utils";

export function TranslatorSettings({ keyHint, model }: { keyHint: string | null; model: ClaudeModel }) {
  const t = useMessages().translate;
  const [apiKey, setApiKey] = useState("");
  const [chosen, setChosen] = useState<ClaudeModel>(model);
  const [editing, setEditing] = useState(!keyHint);
  const [status, setStatus] = useState<KeyState["status"]>("idle");
  const [pending, startTransition] = useTransition();
  const [confirmingRemove, setConfirmingRemove] = useState(false);
  const ok = status === "saved" || status === "removed";

  const save = () =>
    startTransition(async () => {
      const result = await saveTranslatorKey(apiKey, chosen);
      setStatus(result.status);
      if (result.status === "saved") {
        setApiKey("");
        setEditing(false);
      }
    });

  const remove = async () => {
    const result = await removeTranslatorKey();
    setStatus(result.status);
    setEditing(true);
    setConfirmingRemove(false);
  };

  const changeModel = (value: ClaudeModel) => {
    setChosen(value);
    if (keyHint && !editing) startTransition(() => saveTranslatorModel(value));
  };

  return (
    <Card id="translator" className="scroll-mt-24">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Languages className="size-4" />
          {t.settingsTitle}
        </CardTitle>
        <CardDescription>{t.settingsDescription}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {keyHint && !editing ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/40 px-3 py-2.5">
            <span className="flex items-center gap-2 text-sm">
              <KeyRound className="size-4 text-success" />
              {t.keySaved(keyHint)}
            </span>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => setEditing(true)} disabled={pending}>
                {t.replaceKey}
              </Button>
              <Button size="sm" variant="ghost" className="text-danger" onClick={() => setConfirmingRemove(true)} disabled={pending}>
                {t.removeKey}
              </Button>
            </div>
            <ConfirmDialog
              open={confirmingRemove}
              onClose={() => setConfirmingRemove(false)}
              onConfirm={remove}
              title={t.removeKeyTitle}
              description={t.removeKeyDescription}
              confirmLabel={t.removeKey}
              icon={<KeyRound />}
            />
          </div>
        ) : (
          <form
            className="flex flex-col gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              save();
            }}
          >
            <Field label={t.keyLabel} htmlFor="anthropic-key" hint={t.keyHint}>
              <Input
                id="anthropic-key"
                type="password"
                autoComplete="off"
                spellCheck={false}
                placeholder={t.keyPlaceholder}
                value={apiKey}
                onChange={(event) => setApiKey(event.target.value)}
              />
            </Field>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <a
                href="https://platform.claude.com/settings/keys"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                {t.getKey}
                <ExternalLink className="size-3.5" />
              </a>
              <div className="flex gap-2">
                {keyHint ? (
                  <Button variant="ghost" onClick={() => setEditing(false)} disabled={pending}>
                    {t.close}
                  </Button>
                ) : null}
                <Button type="submit" loading={pending} disabled={!apiKey.trim()}>
                  {t.saveKey}
                </Button>
              </div>
            </div>
          </form>
        )}
        <Field label={t.modelLabel} htmlFor="anthropic-model">
          <Select id="anthropic-model" value={chosen} onChange={(event) => changeModel(event.target.value as ClaudeModel)} disabled={pending}>
            {CLAUDE_MODELS.map((value) => (
              <option key={value} value={value}>
                {t.models[value]}
              </option>
            ))}
          </Select>
        </Field>
        {status !== "idle" ? (
          <p role="status" className={cn("text-sm", ok ? "text-success" : "text-danger")}>
            {t.keyStatus[status]}
          </p>
        ) : null}
        {!keyHint || status === "removed" ? <p className="text-xs text-muted-foreground">{t.freeMode}</p> : null}
      </CardContent>
    </Card>
  );
}
