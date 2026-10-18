"use client";

import { useActionState, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Field, FormError } from "@/components/ui/field";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createDeckConfig, deleteDeckConfig, saveDeckConfig, setDeckConfig, type ActionState } from "@/lib/decks/actions";

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

export function DeckOptionsForm({ deckId, config, configs }: Props) {
  const [state, action, pending] = useActionState<ActionState, FormData>(saveDeckConfig.bind(null, config.id), {});
  const [algorithm, setAlgorithm] = useState(config.algorithm);
  const [switching, startSwitch] = useTransition();
  const [newName, setNewName] = useState("");

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Preajuste</CardTitle>
          <CardDescription>Los mazos que compartan un preajuste usan las mismas opciones.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Select
              value={config.id}
              disabled={switching}
              onChange={(event) => startSwitch(() => setDeckConfig(deckId, event.target.value))}
              aria-label="Preajuste"
            >
              {configs.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.isDefault ? " (predeterminada)" : ""}
                </option>
              ))}
            </Select>
            {!config.isDefault ? (
              <Button
                variant="outline"
                onClick={() => startSwitch(() => deleteDeckConfig(deckId, config.id))}
                disabled={switching}
              >
                Eliminar preajuste
              </Button>
            ) : null}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              placeholder="Nombre del nuevo preajuste"
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
              Clonar como nuevo
            </Button>
          </div>
        </CardContent>
      </Card>

      <form action={action} className="flex flex-col gap-6" key={config.id} noValidate>

        <Card>
          <CardHeader>
            <CardTitle>Límites diarios</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="Nombre del preajuste" htmlFor="name" className="sm:col-span-2">
              <Input id="name" name="name" defaultValue={config.name} required maxLength={80} />
            </Field>
            <Field label="Tarjetas nuevas por día" htmlFor="newPerDay">
              <Input id="newPerDay" name="newPerDay" type="number" min={0} max={9999} defaultValue={config.newPerDay} inputMode="numeric" />
            </Field>
            <Field label="Repasos máximos por día" htmlFor="reviewsPerDay">
              <Input id="reviewsPerDay" name="reviewsPerDay" type="number" min={0} max={99999} defaultValue={config.reviewsPerDay} inputMode="numeric" />
            </Field>
            <Field label="Orden de tarjetas nuevas" htmlFor="newCardOrder">
              <Select id="newCardOrder" name="newCardOrder" defaultValue={config.newCardOrder}>
                <option value="SEQUENTIAL">En orden de creación</option>
                <option value="RANDOM">Aleatorio</option>
              </Select>
            </Field>
            <Field label="Algoritmo" htmlFor="algorithm" hint="SM-2 es el clásico de Anki. FSRS es el algoritmo moderno de Anki 23.10+.">
              <Select id="algorithm" name="algorithm" value={algorithm} onChange={(e) => setAlgorithm(e.target.value as "SM2" | "FSRS")}>
                <option value="SM2">SM-2 (Anki clásico)</option>
                <option value="FSRS">FSRS</option>
              </Select>
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tarjetas nuevas</CardTitle>
            <CardDescription>Pasos separados por espacios. Usa m, h o d: “1m 10m”, “1h”, “3d”.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="Pasos de aprendizaje" htmlFor="learningSteps">
              <Input id="learningSteps" name="learningSteps" defaultValue={stepsToText(config.learningSteps)} />
            </Field>
            <Field label="Intervalo de graduación (días)" htmlFor="graduatingInterval">
              <Input id="graduatingInterval" name="graduatingInterval" type="number" min={1} defaultValue={config.graduatingInterval} />
            </Field>
            <Field label="Intervalo fácil (días)" htmlFor="easyInterval">
              <Input id="easyInterval" name="easyInterval" type="number" min={1} defaultValue={config.easyInterval} />
            </Field>
            <Field label="Facilidad inicial (%)" htmlFor="startingEase">
              <Input id="startingEase" name="startingEase" type="number" min={130} max={500} defaultValue={config.startingEase / 10} disabled={algorithm === "FSRS"} />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Olvidos</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="Pasos de reaprendizaje" htmlFor="relearningSteps">
              <Input id="relearningSteps" name="relearningSteps" defaultValue={stepsToText(config.relearningSteps)} />
            </Field>
            <Field label="Intervalo mínimo tras olvido (días)" htmlFor="minLapseInterval">
              <Input id="minLapseInterval" name="minLapseInterval" type="number" min={1} defaultValue={config.minLapseInterval} />
            </Field>
            <Field label="Nuevo intervalo tras olvido (0–1)" htmlFor="lapseMultiplier">
              <Input id="lapseMultiplier" name="lapseMultiplier" type="number" step="0.05" min={0} max={1} defaultValue={config.lapseMultiplier} disabled={algorithm === "FSRS"} />
            </Field>
            <Field label="Umbral de sanguijuela" htmlFor="leechThreshold">
              <Input id="leechThreshold" name="leechThreshold" type="number" min={0} defaultValue={config.leechThreshold} />
            </Field>
            <Field label="Acción con sanguijuelas" htmlFor="leechAction">
              <Select id="leechAction" name="leechAction" defaultValue={config.leechAction}>
                <option value="TAG">Solo etiquetar</option>
                <option value="SUSPEND">Suspender tarjeta</option>
              </Select>
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{algorithm === "FSRS" ? "FSRS" : "Avanzado"}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="Intervalo máximo (días)" htmlFor="maxInterval">
              <Input id="maxInterval" name="maxInterval" type="number" min={1} max={36500} defaultValue={config.maxInterval} />
            </Field>
            {algorithm === "FSRS" ? (
              <>
                <Field label="Retención deseada (0.70–0.99)" htmlFor="desiredRetention">
                  <Input id="desiredRetention" name="desiredRetention" type="number" step="0.01" min={0.7} max={0.99} defaultValue={config.desiredRetention} />
                </Field>
                <Field label="Parámetros FSRS" htmlFor="fsrsWeights" hint="Pega los parámetros optimizados desde Anki o déjalo vacío para usar los predeterminados." className="sm:col-span-2">
                  <Input id="fsrsWeights" name="fsrsWeights" defaultValue={config.fsrsWeights.join(", ")} />
                </Field>
              </>
            ) : (
              <>
                <Field label="Bonificación fácil" htmlFor="easyBonus">
                  <Input id="easyBonus" name="easyBonus" type="number" step="0.05" min={1} max={3} defaultValue={config.easyBonus} />
                </Field>
                <Field label="Multiplicador difícil" htmlFor="hardMultiplier">
                  <Input id="hardMultiplier" name="hardMultiplier" type="number" step="0.05" min={1} max={2} defaultValue={config.hardMultiplier} />
                </Field>
                <Field label="Modificador de intervalo" htmlFor="intervalModifier">
                  <Input id="intervalModifier" name="intervalModifier" type="number" step="0.05" min={0.1} max={3} defaultValue={config.intervalModifier} />
                </Field>
                <input type="hidden" name="desiredRetention" value={config.desiredRetention} />
                <input type="hidden" name="fsrsWeights" value={config.fsrsWeights.join(", ")} />
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
            Guardar opciones
          </Button>
        </div>
      </form>
    </div>
  );
}
