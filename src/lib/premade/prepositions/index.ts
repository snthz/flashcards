import { defineChunkDeck, type ChunkGroup } from "../chunks";
import { adjectives } from "./data/adjectives";
import { phrases } from "./data/phrases";
import { place } from "./data/place";
import { time } from "./data/time";
import { verbs } from "./data/verbs";

export const PREPOSITION_GROUPS: ChunkGroup[] = [
  { name: "Tiempo", tag: "tiempo", entries: time },
  { name: "Lugar", tag: "lugar", entries: place },
  { name: "Verbo + preposición", tag: "verbos", entries: verbs },
  { name: "Adjetivo + preposición", tag: "adjetivos", entries: adjectives },
  { name: "Frases fijas", tag: "frases", entries: phrases },
];

export const prepositionsDeck = defineChunkDeck({
  slug: "prepositions",
  title: "Prepositions",
  idBase: 9_108_000_000_000n,
  guidPrefix: "fc-prep",
  tag: "prepositions",
  rootName: "Prepositions (EN → ES)",
  noteTypeName: "Preposition (EN → ES)",
  groups: PREPOSITION_GROUPS,
  text: (count) => ({
    en: {
      summary: `${count} uses of in, on, at and other prepositions that don't match Spanish, with typed answers.`,
      description:
        "On Monday, at night, in July; at home, on the bus, in the car; depend on, interested in, married to. The prepositions Spanish speakers get wrong because Spanish uses «en» or «de» for almost everything. One card gives you a sentence in Spanish and asks you to type the missing chunk; the other shows it in context and asks what it means. Pronunciation uses your device's voice.",
      languages: "English → Spanish",
      level: "Beginner",
      tags: ["English", "Grammar", "Typed answers", "With audio"],
    },
    es: {
      summary: `${count} usos de in, on, at y otras preposiciones que no coinciden con el español, con respuesta escrita.`,
      description:
        "On Monday, at night, in July; at home, on the bus, in the car; depend on, interested in, married to. Las preposiciones en las que fallamos los hispanohablantes porque en español usamos «en» o «de» para casi todo. Una tarjeta te da una frase en español y te pide escribir el pedazo que falta; la otra lo muestra en contexto y te pregunta qué significa. La pronunciación usa la voz de tu dispositivo.",
      languages: "Inglés → Español",
      level: "Básico",
      tags: ["Inglés", "Gramática", "Respuesta escrita", "Con audio"],
    },
  }),
  samples: PREPOSITION_GROUPS.map((group) => group.entries[0][0]),
});
