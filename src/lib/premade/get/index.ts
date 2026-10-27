import { defineChunkDeck, type ChunkGroup } from "../chunks";
import { arriving } from "./data/arriving";
import { becoming } from "./data/becoming";
import { causing } from "./data/causing";
import { expressions } from "./data/expressions";
import { obtaining } from "./data/obtaining";
import { passive } from "./data/passive";
import { phrasal } from "./data/phrasal";
import { understanding } from "./data/understanding";

export const GET_GROUPS: ChunkGroup[] = [
  { name: "Conseguir y recibir", tag: "conseguir", entries: obtaining },
  { name: "Llegar y moverse", tag: "llegar", entries: arriving },
  { name: "Ponerse y volverse", tag: "ponerse", entries: becoming },
  { name: "Entender", tag: "entender", entries: understanding },
  { name: "Get + participio", tag: "participio", entries: passive },
  { name: "Hacer que algo pase", tag: "causar", entries: causing },
  { name: "Frases hechas", tag: "frases", entries: expressions },
  { name: "Phrasal verbs", tag: "phrasal", entries: phrasal },
];

export const getDeck = defineChunkDeck({
  slug: "get",
  title: "Uses of get",
  idBase: 9_105_000_000_000n,
  guidPrefix: "fc-get",
  tag: "get",
  rootName: "Uses of get (EN → ES)",
  noteTypeName: "Use of get (EN → ES)",
  groups: GET_GROUPS,
  text: (count) => ({
    en: {
      summary: `${count} everyday uses of «get», the most versatile verb in English, with typed answers and audio.`,
      description:
        "«Get» changes meaning with every word around it: get a job, get home, get tired, get it, get fired, get your hair cut, get used to, get along. The deck groups its uses by meaning. One card gives you a sentence in Spanish and asks you to type the missing English chunk (got married, getting dark); the other shows the expression in context and asks what it means. Pronunciation uses your device's voice.",
      languages: "English → Spanish",
      level: "Intermediate",
      tags: ["English", "Grammar", "Typed answers", "With audio"],
    },
    es: {
      summary: `${count} usos cotidianos de «get», el verbo más versátil del inglés, con respuesta escrita y audio.`,
      description:
        "«Get» cambia de significado con cada palabra que lo acompaña: get a job, get home, get tired, get it, get fired, get your hair cut, get used to, get along. El mazo agrupa sus usos por significado. Una tarjeta te da una frase en español y te pide escribir el pedazo que falta en inglés (got married, getting dark); la otra muestra la expresión en contexto y te pregunta qué significa. La pronunciación usa la voz de tu dispositivo.",
      languages: "Inglés → Español",
      level: "Intermedio",
      tags: ["Inglés", "Gramática", "Respuesta escrita", "Con audio"],
    },
  }),
  samples: ["get a job", "get home", "get nervous", "get the joke", "get fired", "get used to"],
});
