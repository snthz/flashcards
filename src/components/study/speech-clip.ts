import { TTS_PREFIX } from "@/lib/anki/render";
import { naturalSpeechUrl, readySpeechUrl } from "@/lib/tts/client";

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

export function parseSpeechSrc(src: string) {
  const rest = src.slice(TTS_PREFIX.length);
  const split = rest.indexOf(":");
  return { lang: rest.slice(0, split), text: decodeURIComponent(rest.slice(split + 1)) };
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

const NATURAL_WAIT_MS = 700;

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T) {
  return Promise.race([promise, new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms))]);
}

// Speaks a {{tts}} clip, with the server's natural voice when it is ready and the device voice otherwise. Speech has no timeline, so duration stays NaN.
export class SpeechClip extends EventTarget implements Clip {
  paused = true;
  ended = false;
  natural = false;
  readonly duration = Number.NaN;
  currentTime = 0;
  defaultPlaybackRate = 1;
  #rate = 1;
  #attempt = 0;
  #utterance: SpeechSynthesisUtterance | null = null;
  #audio: HTMLAudioElement | null = null;

  constructor(
    readonly text: string,
    readonly lang: string,
  ) {
    super();
    void naturalSpeechUrl(text, lang);
  }

  static fromSrc(src: string) {
    const { text, lang } = parseSpeechSrc(src);
    return new SpeechClip(text, lang);
  }

  get playbackRate() {
    return this.#rate;
  }

  set playbackRate(rate: number) {
    if (rate === this.#rate) return;
    this.#rate = rate;
    if (this.#audio) this.#audio.playbackRate = rate;
    this.dispatchEvent(new Event("ratechange"));
  }

  play() {
    this.#stop();
    const attempt = ++this.#attempt;
    this.paused = false;
    this.ended = false;
    this.dispatchEvent(new Event("play"));
    const ready = readySpeechUrl(this.text, this.lang);
    if (ready) {
      this.#playNatural(ready, attempt);
      return Promise.resolve();
    }
    void withTimeout(naturalSpeechUrl(this.text, this.lang), NATURAL_WAIT_MS, null).then((url) => {
      if (attempt !== this.#attempt || this.paused) return;
      if (url) this.#playNatural(url, attempt);
      else this.#speak(attempt);
    });
    return Promise.resolve();
  }

  pause() {
    if (this.paused) return;
    this.#attempt += 1;
    this.#stop();
    this.paused = true;
    this.dispatchEvent(new Event("pause"));
  }

  #stop() {
    if (this.#audio) {
      this.#audio.onended = null;
      this.#audio.onerror = null;
      this.#audio.pause();
      this.#audio = null;
    }
    if (this.#utterance) {
      this.#utterance = null;
      if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
    }
  }

  #finish(attempt: number, ended: boolean) {
    if (attempt !== this.#attempt) return;
    this.#audio = null;
    this.#utterance = null;
    this.paused = true;
    this.ended = ended;
    this.dispatchEvent(new Event("pause"));
    if (ended) this.dispatchEvent(new Event("ended"));
  }

  #playNatural(url: string, attempt: number) {
    const audio = new Audio(url);
    audio.playbackRate = this.#rate;
    audio.preservesPitch = true;
    audio.onended = () => this.#finish(attempt, true);
    audio.onerror = () => {
      if (attempt === this.#attempt) this.#speak(attempt);
    };
    this.#audio = audio;
    this.natural = true;
    this.dispatchEvent(new Event("voicechange"));
    audio.play().catch(() => {
      if (attempt !== this.#attempt || this.#audio !== audio) return;
      this.#audio = null;
      this.#speak(attempt);
    });
  }

  #speak(attempt: number) {
    if (typeof speechSynthesis === "undefined") {
      this.#finish(attempt, false);
      return;
    }
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(this.text);
    utterance.lang = this.lang;
    utterance.voice = pickVoice(this.lang);
    utterance.rate = this.#rate;
    // Cancelling fires end/error on the old utterance; ignore it once a newer one took over.
    utterance.onend = () => this.#utterance === utterance && this.#finish(attempt, true);
    utterance.onerror = () => this.#utterance === utterance && this.#finish(attempt, false);
    this.#utterance = utterance;
    if (this.natural) {
      this.natural = false;
      this.dispatchEvent(new Event("voicechange"));
    }
    speechSynthesis.speak(utterance);
  }
}

let current: SpeechClip | null = null;

export function speakText(text: string, lang: string, rate = 1) {
  current?.pause();
  const clip = new SpeechClip(text, lang);
  clip.playbackRate = rate;
  current = clip;
  void clip.play();
  return clip;
}
