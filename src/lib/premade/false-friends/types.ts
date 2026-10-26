// lookalike is the Spanish word the English one resembles; lookalikeInEnglish is how that Spanish word is really said.
export type FalseFriend = [
  word: string,
  meaning: string,
  lookalike: string,
  lookalikeInEnglish: string,
  example: string,
  exampleTranslation: string,
  lookalikeExample: string,
  lookalikeExampleTranslation: string,
  note?: string,
];
