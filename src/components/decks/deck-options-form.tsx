"use client";

import { useActionState, useState, useTransition } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/ui/number-input";
import { Select } from "@/components/ui/select";
import { Field, FormError } from "@/components/ui/field";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/dialog";
import { createDeckConfig, deleteDeckConfig, optimizeFsrs, saveDeckConfig, setDeckConfig, type ActionState } from "@/lib/decks/actions";
import { useI18n } from "@/lib/i18n/client";
import { formatNumber } from "@/lib/utils";

interface ConfigValues {
  id: string;
  name: string;
  algorithm: "SM2" | "FSRS";
  newPerDay: number;
  reviewsPerDay: number;
  learningSteps: number[];
  relearningSteps: number[];
  graduatingInterval: number;
  easyInterval: number;
  startingEase: number;
  easyBonus: number;
  hardMultiplier: number;
  intervalModifier: number;
  lapseMultiplier: number;
  minLapseInterval: number;
  maxInterval: number;
  leechThreshold: number;
  leechAction: "SUSPEND" | "TAG";
  newCardOrder: "SEQUENTIAL" | "RANDOM";
  desiredRetention: number;
  fsrsWeights: number[];
  isDefault: boolean;
}

interface Props {
  deckId: string;
  config: ConfigValues;
  configs: Array<{ id: string; name: string; isDefault: boolean }>;
}

function stepsToText(steps: number[]) {
  return steps
    .map((m) => (m >= 1440 && m % 1440 === 0 ? `${m / 1440}d` : m >= 60 && m % 60 === 0 ? `${m / 60}h` : `${m}m`))
    .join(" ");
}

function percent(value: number, locale: Parameters<typeof formatNumber>[1]) {
  return `${formatNumber(Math.round(value * 1000) / 10, locale)}%`;
}

export function DeckOptionsForm({ deckId, config, configs }: Props) {
  const { locale, t } = useI18n();
  const o = t.deckOptions;
  const l = o.labels;
  const [state, action, pending] = useActionState<ActionState, FormData>(saveDeckConfig.bind(null, config.id), {});
  const [algorithm, setAlgorithm] = useState(config.algorithm);
  const [switching, startSwitch] = useTransition();
  const [newName, setNewName] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [weights, setWeights] = useState(config.fsrsWeights.join(", "));
  const [optimizing, startOptimize] = useTransition();
  const [optimizeMessage, setOptimizeMessage] = useState<{ tone: "success" | "info" | "danger"; text: string } | null>(null);

  const optimize = () =>
    startOptimize(async () => {
      setOptimizeMessage(null);
      const result = await optimizeFsrs(deckId);
      if (result.status === "failed") return setOptimizeMessage({ tone: "danger", text: o.optimizeFailed });
      if (result.status === "not_enough") return setOptimizeMessage({ tone: "info", text: o.optimizeNotEnough(result.reviews, result.required) });
      if (result.status === "optimal") return setOptimizeMessage({ tone: "info", text: o.optimizeOptimal(percent(result.before.rmse, locale), result.reviews) });
      setWeights(result.weights.join(", "));
      setOptimizeMessage({ tone: "success", text: o.optimizeUpdated(percent(result.before.rmse, locale), percent(result.after.rmse, locale), result.reviews) });
    });

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{o.preset}</CardTitle>
          <CardDescription>{o.presetDescription}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Select
              value={config.id}
              disabled={switching}
              onChange={(id) => startSwitch(() => setDeckConfig(deckId, id))}
              label={o.preset}
              options={configs.map((c) => ({ value: c.id, label: `${c.name}${c.isDefault ? o.defaultSuffix : ""}` }))}
            />
            {!config.isDefault ? (
              <Button variant="outline" onClick={() => setConfirmingDelete(true)} disabled={switching}>
                {o.deletePreset}
              </Button>
            ) : null}
            <ConfirmDialog
              open={confirmingDelete}
              onClose={() => setConfirmingDelete(false)}
              onConfirm={async () => {
                await deleteDeckConfig(deckId, config.id);
                setConfirmingDelete(false);
              }}
              title={o.deletePresetTitle(config.name)}
              description={o.deletePresetDescription}
              confirmLabel={o.deletePreset}
            />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              placeholder={o.newPresetPlaceholder}
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              maxLength={80}
            />
            <Button
              variant="secondary"
              disabled={!newName.trim() || switching}
              onClick={() =>
                startSwitch(async () => {
                  await createDeckConfig(deckId, newName);
                  setNewName("");
                })
              }
            >
              {o.cloneAsNew}
            </Button>
          </div>
        </CardContent>
      </Card>

      <form action={action} className="flex flex-col gap-6" key={config.id} noValidate>

        <Card>
          <CardHeader>
            <CardTitle>{o.dailyLimits}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label={l.name} htmlFor="name" className="sm:col-span-2">
              <Input id="name" name="name" defaultValue={config.name} required maxLength={80} />
            </Field>
            <Field label={l.newPerDay} htmlFor="newPerDay">
              <NumberInput id="newPerDay" name="newPerDay" min={0} max={9999} defaultValue={config.newPerDay} />
            </Field>
            <Field label={l.reviewsPerDay} htmlFor="reviewsPerDay">
              <NumberInput id="reviewsPerDay" name="reviewsPerDay" min={0} max={99999} defaultValue={config.reviewsPerDay} />
            </Field>
            <Field label={l.newCardOrder} htmlFor="newCardOrder">
              <Select
                id="newCardOrder"
                name="newCardOrder"
                defaultValue={config.newCardOrder}
                options={[
                  { value: "SEQUENTIAL", label: o.orderSequential },
                  { value: "RANDOM", label: o.orderRandom },
                ]}
              />
            </Field>
            <Field label={l.algorithm} htmlFor="algorithm" hint={o.algorithmHint}>
              <Select
                id="algorithm"
                name="algorithm"
                value={algorithm}
                onChange={setAlgorithm}
                options={[
                  { value: "SM2", label: o.algorithmSm2 },
                  { value: "FSRS", label: "FSRS" },
                ]}
              />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{o.newCards}</CardTitle>
            <CardDescription>{o.stepsHint}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label={l.learningSteps} htmlFor="learningSteps">
              <Input id="learningSteps" name="learningSteps" defaultValue={stepsToText(config.learningSteps)} />
            </Field>
            <Field label={l.graduatingInterval} htmlFor="graduatingInterval">
              <NumberInput id="graduatingInterval" name="graduatingInterval" min={1} defaultValue={config.graduatingInterval} />
            </Field>
            <Field label={l.easyInterval} htmlFor="easyInterval">
              <NumberInput id="easyInterval" name="easyInterval" min={1} defaultValue={config.easyInterval} />
            </Field>
            <Field label={l.startingEase} htmlFor="startingEase">
              <NumberInput id="startingEase" name="startingEase" min={130} max={500} defaultValue={config.startingEase / 10} disabled={algorithm === "FSRS"} />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{o.lapses}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label={l.relearningSteps} htmlFor="relearningSteps">
              <Input id="relearningSteps" name="relearningSteps" defaultValue={stepsToText(config.relearningSteps)} />
            </Field>
            <Field label={l.minLapseInterval} htmlFor="minLapseInterval">
              <NumberInput id="minLapseInterval" name="minLapseInterval" min={1} defaultValue={config.minLapseInterval} />
            </Field>
            <Field label={l.lapseMultiplier} htmlFor="lapseMultiplier">
              <NumberInput id="lapseMultiplier" name="lapseMultiplier" step="0.05" min={0} max={1} defaultValue={config.lapseMultiplier} disabled={algorithm === "FSRS"} />
            </Field>
            <Field label={l.leechThreshold} htmlFor="leechThreshold">
              <NumberInput id="leechThreshold" name="leechThreshold" min={0} defaultValue={config.leechThreshold} />
            </Field>
            <Field label={l.leechAction} htmlFor="leechAction">
              <Select
                id="leechAction"
                name="leechAction"
                defaultValue={config.leechAction}
                options={[
                  { value: "TAG", label: o.leechTagOnly },
                  { value: "SUSPEND", label: o.leechSuspend },
                ]}
              />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{algorithm === "FSRS" ? "FSRS" : o.advanced}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label={l.maxInterval} htmlFor="maxInterval">
              <NumberInput id="maxInterval" name="maxInterval" min={1} max={36500} defaultValue={config.maxInterval} />
            </Field>
            {algorithm === "FSRS" ? (
              <>
                <Field label={l.desiredRetention} htmlFor="desiredRetention">
                  <NumberInput id="desiredRetention" name="desiredRetention" step="0.01" min={0.7} max={0.99} defaultValue={config.desiredRetention} />
                </Field>
                <Field label={l.fsrsWeights} htmlFor="fsrsWeights" hint={o.fsrsWeightsHint} className="sm:col-span-2">
                  <Input id="fsrsWeights" name="fsrsWeights" value={weights} onChange={(event) => setWeights(event.target.value)} />
                </Field>
                <div className="flex flex-col gap-2 sm:col-span-2">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <Button type="button" variant="secondary" onClick={optimize} loading={optimizing} className="shrink-0">
                      {optimizing ? null : <Sparkles className="size-4" />}
                      {o.optimize}
                    </Button>
                    <p className="text-xs text-muted-foreground">{o.optimizeHint}</p>
                  </div>
                  {optimizeMessage ? (
                    <p
                      role="status"
                      className={
                        optimizeMessage.tone === "success"
                          ? "rounded-lg bg-success-soft px-3 py-2 text-sm text-success"
                          : optimizeMessage.tone === "danger"
                            ? "rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger"
                            : "rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground"
                      }
                    >
                      {optimizeMessage.text}
                    </p>
                  ) : null}
                </div>
              </>
            ) : (
              <>
                <Field label={l.easyBonus} htmlFor="easyBonus">
                  <NumberInput id="easyBonus" name="easyBonus" step="0.05" min={1} max={3} defaultValue={config.easyBonus} />
                </Field>
                <Field label={l.hardMultiplier} htmlFor="hardMultiplier">
                  <NumberInput id="hardMultiplier" name="hardMultiplier" step="0.05" min={1} max={2} defaultValue={config.hardMultiplier} />
                </Field>
                <Field label={l.intervalModifier} htmlFor="intervalModifier">
                  <NumberInput id="intervalModifier" name="intervalModifier" step="0.05" min={0.1} max={3} defaultValue={config.intervalModifier} />
                </Field>
                <input type="hidden" name="desiredRetention" value={config.desiredRetention} />
                <input type="hidden" name="fsrsWeights" value={weights} />
              </>
            )}
            {algorithm === "FSRS" ? (
              <>
                <input type="hidden" name="easyBonus" value={config.easyBonus} />
                <input type="hidden" name="hardMultiplier" value={config.hardMultiplier} />
                <input type="hidden" name="intervalModifier" value={config.intervalModifier} />
                <input type="hidden" name="startingEase" value={config.startingEase / 10} />
                <input type="hidden" name="lapseMultiplier" value={config.lapseMultiplier} />
              </>
            ) : null}
          </CardContent>
        </Card>

        <FormError message={state.error} />
        {state.success ? <p className="rounded-lg bg-success-soft px-3 py-2 text-sm text-success">{state.success}</p> : null}
        <div className="flex justify-end">
          <Button type="submit" size="lg" loading={pending}>
            {o.saveOptions}
          </Button>
        </div>
      </form>
    </div>
  );
}
