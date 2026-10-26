// n: noun, v: verb, adj: adjective, adv: adverb, prep: preposition, pron: pronoun, conj: conjunction,
// det: determiner, num: number, modal: modal verb, interj: interjection. The main use goes first.
export type WordKind = "n" | "v" | "adj" | "adv" | "prep" | "pron" | "conj" | "det" | "num" | "modal" | "interj";

export type EnglishWord = [
  word: string,
  translation: string,
  kinds: WordKind[],
  example: string,
  exampleTranslation: string,
  note?: string,
];
