import { defineChunkDeck, type ChunkGroup } from "../chunks";
import { doCollocations } from "./data/do";
import { have } from "./data/have";
import { make } from "./data/make";
import { take } from "./data/take";

export const COLLOCATION_GROUPS: ChunkGroup[] = [
  { name: "Make", tag: "make", entries: make },
  { name: "Do", tag: "do", entries: doCollocations },
  { name: "Take", tag: "take", entries: take },
  { name: "Have", tag: "have", entries: have },
];

export const makeDoDeck = defineChunkDeck({
  slug: "make-do-take-have",
  title: "Make, do, take & have",
  idBase: 9_107_000_000_000n,
  guidPrefix: "fc-mdth",
  tag: "make-do-take-have",
  rootName: "Make, do, take & have (EN → ES)",
  noteTypeName: "Collocation (EN → ES)",
  groups: COLLOCATION_GROUPS,
  text: (count) => ({
    en: {
      summary: `${count} everyday collocations with make, do, take and have, the verbs Spanish speakers mix up most.`,
      description:
        "In Spanish it's «hacer» or «tomar», in English it depends: make a mistake but do homework, take a shower but have lunch. One card gives you a sentence in Spanish and asks you to type the missing English chunk; the other shows the collocation in context and asks what it means. Pronunciation uses your device's voice.",
      languages: "English → Spanish",
      level: "Beginner",
      tags: ["English", "Vocabulary", "Typed answers", "With audio"],
    },
    es: {
      summary: `${count} colocaciones cotidianas con make, do, take y have, los verbos que más confundimos los hispanohablantes.`,
      description:
        "En español es «hacer» o «tomar»; en inglés depende: make a mistake pero do homework, take a shower pero have lunch. Una tarjeta te da una frase en español y te pide escribir el pedazo que falta en inglés; la otra muestra la colocación en contexto y te pregunta qué significa. La pronunciación usa la voz de tu dispositivo.",
      languages: "Inglés → Español",
      level: "Básico",
      tags: ["Inglés", "Vocabulario", "Respuesta escrita", "Con audio"],
    },
  }),
  samples: COLLOCATION_GROUPS.flatMap((group) => group.entries.slice(0, 2).map(([expression]) => expression)).slice(0, 6),
});
