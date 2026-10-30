export const MAX_SPEECH_CHARS = 300;

const VOICES: Record<string, string> = { "en-gb": "bf_emma", en: "af_heart" };

export const NATURAL_VOICES = [...new Set(Object.values(VOICES))];

export function naturalVoice(lang: string) {
  const key = lang.trim().toLowerCase().replace("_", "-");
  if (VOICES[key]) return VOICES[key];
  return key.startsWith("en-") ? VOICES.en : null;
}
