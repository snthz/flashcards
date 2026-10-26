// Variant spellings share a field, separated by " / " (learned / learnt); only the first one is spoken.
export type IrregularVerb = [
  base: string,
  past: string,
  participle: string,
  translation: string,
  example: string,
  exampleTranslation: string,
  note?: string,
];

export interface PatternGroup {
  name: string;
  tag: string;
  verbs: IrregularVerb[];
}
