// s: separable ("pick it up"), i: inseparable ("look after her"), n: no object ("wake up").
export type PhrasalKind = "s" | "i" | "n";

export type PhrasalVerb = [
  verb: string,
  translation: string,
  definition: string,
  example: string,
  exampleTranslation: string,
  synonyms: string,
  kind: PhrasalKind,
  note?: string,
];

export interface ParticleGroup {
  name: string;
  verbs: PhrasalVerb[];
}
