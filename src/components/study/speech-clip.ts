import { TTS_PREFIX } from "@/lib/anki/render";

// The parts of a media element the audio controls rely on, so device speech can stand in for a file.
export interface Clip extends EventTarget {
  readonly paused: boolean;
  readonly ended: boolean;
  readonly duration: number;
  currentTime: number;
  playbackRate: number;
  defaultPlaybackRate: number;
  play(): Promise<void>;
  pause(): void;
}

export function isSpeechSrc(src: string) {
  return src.startsWith(TTS_PREFIX);
}

const QUALITY_RE = /premium|enhanced|neural|natural|siri/i;

// Best installed voice for the language: exact region first, then higher-quality and on-device voices.
export function pickVoice(lang: string) {
  if (typeof speechSynthesis === "undefined") return null;
  const target = lang.toLowerCase();
  const base = target.split("-")[0];
  const score = (voice: SpeechSynthesisVoice) => {
    const voiceLang = voice.lang.replace("_", "-").toLowerCase();
    if (voiceLang.split("-")[0] !== base) return -1;
    return (voiceLang === target ? 4 : 2) + (QUALITY_RE.test(voice.name) ? 2 : 0) + (voice.localService ? 1 : 0);
  };
  let best: SpeechSynthesisVoice | null = null;
  for (const voice of speechSynthesis.getVoices()) {
    if (score(voice) >= 0 && (!best || score(voice) > score(best))) best = voice;
  }
  return best;
}

// Speaks a {{tts}} clip with the device voice. Speech has no timeline, so duration stays NaN.
export class SpeechClip extends EventTarget implements Clip {
  paused = true;
  ended = false;
  readonly duration = Number.NaN;
  currentTime = 0;
  defaultPlaybackRate = 1;
  #rate = 1;
  #utterance: SpeechSynthesisUtterance | null = null;

  constructor(
    readonly text: string,
    readonly lang: string,
  ) {
    super();
  }

  static fromSrc(src: string) {
    const rest = src.slice(TTS_PREFIX.length);
    const split = rest.indexOf(":");
    return new SpeechClip(decodeURIComponent(rest.slice(split + 1)), rest.slice(0, split));
  }

  get playbackRate() {
    return this.#rate;
  }

  set playbackRate(rate: number) {
    if (rate === this.#rate) return;
    this.#rate = rate;
    this.dispatchEvent(new Event("ratechange"));
  }

  play() {
    if (typeof speechSynthesis === "undefined") return Promise.reject(new Error("Speech synthesis is not available on this device"));
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(this.text);
    utterance.lang = this.lang;
    utterance.voice = pickVoice(this.lang);
    utterance.rate = this.#rate;
    const finish = (ended: boolean) => {
      // Cancelling fires end/error on the old utterance; ignore it once a newer one took over.
      if (this.#utterance !== utterance) return;
      this.#utterance = null;
      this.paused = true;
      this.ended = ended;
      this.dispatchEvent(new Event("pause"));
      if (ended) this.dispatchEvent(new Event("ended"));
    };
    utterance.onend = () => finish(true);
    utterance.onerror = () => finish(false);
    this.#utterance = utterance;
    this.paused = false;
    this.ended = false;
    this.dispatchEvent(new Event("play"));
    speechSynthesis.speak(utterance);
    return Promise.resolve();
  }

  pause() {
    if (!this.#utterance) return;
    this.#utterance = null;
    speechSynthesis.cancel();
    this.paused = true;
    this.dispatchEvent(new Event("pause"));
  }
}
