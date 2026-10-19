import { message, z } from "./zod";

export const noteInputSchema = z.object({
  deckId: z.string().uuid(message("selectDeck")),
  noteTypeId: z.string().uuid(message("selectNoteType")),
  fields: z.array(z.string().max(100_000)).min(1),
  tags: z
    .string()
    .max(2000)
    .transform((value) =>
      Array.from(
        new Set(
          value
            .split(/[\s,]+/)
            .map((t) => t.trim())
            .filter(Boolean),
        ),
      ),
    ),
});

export const noteUpdateSchema = z.object({
  noteId: z.string().uuid(),
  fields: z.array(z.string().max(100_000)).min(1),
  tags: noteInputSchema.shape.tags,
});

export const browseQuerySchema = z.object({
  q: z.string().trim().max(200).optional().default(""),
  deck: z.string().uuid().optional().or(z.literal("")).default(""),
  state: z.enum(["", "NEW", "LEARNING", "REVIEW", "RELEARNING", "SUSPENDED", "BURIED", "FLAGGED"]).optional().default(""),
  page: z.coerce.number().int().min(1).optional().default(1),
});

export type BrowseQuery = z.infer<typeof browseQuerySchema>;
