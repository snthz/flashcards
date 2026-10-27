import { defineChunkDeck, type ChunkGroup } from "../chunks";
import { everyday } from "./data/everyday";
import { feelings } from "./data/feelings";
import { situations } from "./data/situations";
import { workMoney } from "./data/work-money";

export const IDIOM_GROUPS: ChunkGroup[] = [
  { name: "Conversación diaria", tag: "conversacion", entries: everyday },
  { name: "Emociones y personas", tag: "emociones", entries: feelings },
  { name: "Situaciones y decisiones", tag: "situaciones", entries: situations },
  { name: "Trabajo y dinero", tag: "trabajo", entries: workMoney },
];

export const idiomsDeck = defineChunkDeck({
  slug: "idioms",
  title: "Idioms and expressions",
  idBase: 9_109_000_000_000n,
  guidPrefix: "fc-idiom",
  tag: "idioms",
  rootName: "Idioms and expressions (EN → ES)",
  noteTypeName: "Idiom (EN → ES)",
  groups: IDIOM_GROUPS,
  text: (count) => ({
    en: {
      summary: `${count} idioms and expressions native speakers use every day, with their Mexican equivalents.`,
      description:
        "Break the ice, call it a day, over the moon, once in a blue moon, it's on me: the expressions you hear in series, meetings and conversations but won't find word for word in a dictionary. One card gives you a sentence in Spanish and asks you to type the missing idiom; the other shows it in context and asks what it means. Pronunciation uses your device's voice.",
      languages: "English → Spanish",
      level: "Intermediate",
      tags: ["English", "Vocabulary", "Typed answers", "With audio"],
    },
    es: {
      summary: `${count} modismos y expresiones que los nativos usan a diario, con su equivalente mexicano.`,
      description:
        "Break the ice, call it a day, over the moon, once in a blue moon, it's on me: las expresiones que oyes en series, juntas y pláticas pero no encuentras palabra por palabra en el diccionario. Una tarjeta te da una frase en español y te pide escribir el modismo que falta; la otra lo muestra en contexto y te pregunta qué significa. La pronunciación usa la voz de tu dispositivo.",
      languages: "Inglés → Español",
      level: "Intermedio",
      tags: ["Inglés", "Vocabulario", "Respuesta escrita", "Con audio"],
    },
  }),
  samples: IDIOM_GROUPS.flatMap((group) => group.entries.slice(0, 2).map(([expression]) => expression)).slice(0, 6),
});
