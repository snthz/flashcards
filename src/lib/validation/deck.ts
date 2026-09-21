import { z } from "zod";

export const deckNameSchema = z
  .string()
  .trim()
  .min(1, "Escribe un nombre")
  .max(120, "El nombre es demasiado largo")
  .refine((value) => !value.includes("::"), "El nombre no puede contener ::");

export const createDeckSchema = z.object({
  name: deckNameSchema,
  parentId: z.string().uuid().optional().or(z.literal("")),
});

export const renameDeckSchema = z.object({
  id: z.string().uuid(),
  name: deckNameSchema,
  description: z.string().trim().max(2000).optional(),
});

const stepsSchema = z
  .string()
  .transform((value) =>
    value
      .split(/[\s,]+/)
      .map((v) => v.trim())
      .filter(Boolean)
      .map((v) => {
        const match = /^(\d+(?:\.\d+)?)([mhd]?)$/.exec(v);
        if (!match) return Number.NaN;
        const amount = Number(match[1]);
        const unit = match[2] || "m";
        return unit === "d" ? amount * 1440 : unit === "h" ? amount * 60 : amount;
      }),
  )
  .pipe(z.array(z.number().positive("Los pasos deben ser positivos").max(60 * 24 * 365)));

export const deckConfigSchema = z.object({
  name: z.string().trim().min(1).max(80),
  algorithm: z.enum(["SM2", "FSRS"]),
  newPerDay: z.coerce.number().int().min(0).max(9999),
  reviewsPerDay: z.coerce.number().int().min(0).max(99999),
  learningSteps: stepsSchema,
  relearningSteps: stepsSchema,
  graduatingInterval: z.coerce.number().int().min(1).max(3650),
  easyInterval: z.coerce.number().int().min(1).max(3650),
  startingEase: z.coerce.number().min(130).max(500),
  easyBonus: z.coerce.number().min(1).max(3),
  hardMultiplier: z.coerce.number().min(1).max(2),
  intervalModifier: z.coerce.number().min(0.1).max(3),
  lapseMultiplier: z.coerce.number().min(0).max(1),
  minLapseInterval: z.coerce.number().int().min(1).max(3650),
  maxInterval: z.coerce.number().int().min(1).max(36500),
  leechThreshold: z.coerce.number().int().min(0).max(9999),
  leechAction: z.enum(["SUSPEND", "TAG"]),
  newCardOrder: z.enum(["SEQUENTIAL", "RANDOM"]),
  desiredRetention: z.coerce.number().min(0.7).max(0.99),
  fsrsWeights: z
    .string()
    .transform((value) =>
      value
        .split(/[\s,]+/)
        .map((v) => v.trim())
        .filter(Boolean)
        .map(Number),
    )
    .pipe(z.array(z.number()).refine((w) => w.length === 0 || w.length >= 17, "Se esperan al menos 17 parámetros")),
});

export type DeckConfigInput = z.infer<typeof deckConfigSchema>;
