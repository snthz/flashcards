"use client";

import { useState, useSyncExternalStore } from "react";
import { Moon, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox, Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { useMessages } from "@/lib/i18n/client";
import { DEFAULT_FOCUS, isAppleDevice, loadFocus, runShortcut, saveFocus, type FocusSettings as Settings } from "@/lib/study/focus";

function subscribeNothing() {
  return () => {};
}

export function FocusSettings() {
  const t = useMessages().settings;
  const apple = useSyncExternalStore(subscribeNothing, isAppleDevice, () => false);
  const [settings, setSettings] = useState<Settings | null>(null);
  if (!apple) return null;
  const current = settings ?? loadFocus();

  const update = (patch: Partial<Settings>) => {
    const next = { ...current, ...patch };
    setSettings(next);
    saveFocus(next);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Moon className="size-4" />
          {t.focusTitle}
        </CardTitle>
        <CardDescription>{t.focusDescription}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <ol className="flex list-decimal flex-col gap-1.5 pl-5 text-sm text-muted-foreground">
          {t.focusSteps(current.on || DEFAULT_FOCUS.on, current.off || DEFAULT_FOCUS.off).map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <label className="flex cursor-pointer items-center gap-3">
          <Checkbox checked={current.enabled} onChange={(event) => update({ enabled: event.target.checked })} />
          <span className="text-sm font-medium">{t.focusEnable}</span>
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={t.focusOnName} htmlFor="focus-on">
            <div className="flex gap-2">
              <Input id="focus-on" value={current.on} onChange={(event) => update({ on: event.target.value })} autoComplete="off" />
              <Button variant="outline" size="icon" aria-label={t.focusTest} title={t.focusTest} disabled={!current.on.trim()} onClick={() => runShortcut(current.on.trim())}>
                <Play className="size-4" />
              </Button>
            </div>
          </Field>
          <Field label={t.focusOffName} htmlFor="focus-off">
            <div className="flex gap-2">
              <Input id="focus-off" value={current.off} onChange={(event) => update({ off: event.target.value })} autoComplete="off" />
              <Button variant="outline" size="icon" aria-label={t.focusTest} title={t.focusTest} disabled={!current.off.trim()} onClick={() => runShortcut(current.off.trim())}>
                <Play className="size-4" />
              </Button>
            </div>
          </Field>
        </div>
        <p className="text-xs text-muted-foreground">{t.focusReturnHint}</p>
      </CardContent>
    </Card>
  );
}
