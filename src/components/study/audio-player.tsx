"use client";

import { useCallback, useSyncExternalStore, type CSSProperties, type KeyboardEvent, type MouseEvent } from "react";
import { Pause, Play, RotateCcw, Volume2 } from "lucide-react";
import { SpeechClip, type Clip } from "./speech-clip";

export const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5] as const;
const SKIP_SECONDS = 3;

export const AUDIO_MOUNT_CSS = `
.fc-root .fc-audio { display: inline-flex; vertical-align: middle; margin: 0 .125rem; }
`;

// Lives in each inline button's own shadow root, so deck CSS (e.g. global button rules) cannot restyle it.
export const AUDIO_TOGGLE_CSS = `
button { all: unset; box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center; width: 2.75rem; height: 2.75rem; border-radius: 999px; cursor: pointer; color: inherit; opacity: .85; transition: opacity .15s, transform .1s; -webkit-tap-highlight-color: transparent; }
button:hover, button[aria-pressed=true] { opacity: 1; }
button:active { transform: scale(.9); }
button:focus-visible { outline: 2px solid var(--ring, rgba(127,127,127,.5)); outline-offset: 1px; }
svg { width: 1.5rem; height: 1.5rem; }
`;

const subscribeEvents = (audio: Clip, events: string[]) => (callback: () => void) => {
  events.forEach((name) => audio.addEventListener(name, callback));
  return () => events.forEach((name) => audio.removeEventListener(name, callback));
};

// Safari returns a new currentTime on every read while playing; useSyncExternalStore needs a stable
// snapshot or it re-renders forever, so reads come from this cache, refreshed only by the subscription.
const times = new WeakMap<Clip, number>();

function readTime(audio: Clip) {
  if (!times.has(audio)) times.set(audio, audio.currentTime);
  return times.get(audio) ?? 0;
}

// Polls on animation frames while playing so the progress bar moves smoothly on short clips.
const subscribeTime = (audio: Clip) => (notify: () => void) => {
  const callback = () => {
    times.set(audio, audio.currentTime);
    notify();
  };
  let frame = 0;
  const tick = () => {
    callback();
    frame = requestAnimationFrame(tick);
  };
  const start = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(tick);
  };
  const stop = () => {
    cancelAnimationFrame(frame);
    callback();
  };
  const unsubscribe = subscribeEvents(audio, ["timeupdate", "seeked", "loadedmetadata"])(callback);
  audio.addEventListener("play", start);
  audio.addEventListener("pause", stop);
  if (!audio.paused) start();
  return () => {
    cancelAnimationFrame(frame);
    unsubscribe();
    audio.removeEventListener("play", start);
    audio.removeEventListener("pause", stop);
  };
};

function useAudioValue<T>(subscribe: (callback: () => void) => () => void, read: () => T) {
  return useSyncExternalStore(subscribe, read, read);
}

// Media elements are external mutable objects; keep writes out of the component so the compiler treats props as read-only.
function seek(audio: Clip, time: number) {
  const end = Number.isFinite(audio.duration) ? audio.duration : time;
  audio.currentTime = Math.min(Math.max(time, 0), end);
}

function toggle(audio: Clip) {
  if (!audio.paused) return audio.pause();
  if (audio.ended) audio.currentTime = 0;
  audio.play().catch(() => undefined);
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

function formatRate(rate: number) {
  return `${String(rate).replace(".", ",")}×`;
}

interface AudioControlsProps {
  audio: Clip;
}

function useAudioState(audio: Clip) {
  const subscribeState = useCallback(
    (callback: () => void) => subscribeEvents(audio, ["play", "pause", "ended", "durationchange", "loadedmetadata", "ratechange"])(callback),
    [audio],
  );
  const paused = useAudioValue(subscribeState, () => audio.paused);
  const duration = useAudioValue(subscribeState, () => (Number.isFinite(audio.duration) ? audio.duration : 0));
  const rate = useAudioValue(subscribeState, () => audio.playbackRate);
  return { paused, duration, rate };
}

// Keep clicks from revealing the card, and keep focus off the buttons so Space/Enter still drive the study session.
const stopClick = (event: MouseEvent) => event.stopPropagation();
const keepFocus = (event: MouseEvent) => event.preventDefault();
const stopKeys = (event: KeyboardEvent) => {
  if (event.key === " " || event.key === "Enter") event.stopPropagation();
};

// The small speaker button that replaces [sound:…] inside the card, sized for touch like Anki's replay button.
export function AudioToggle({ audio }: AudioControlsProps) {
  const { paused } = useAudioState(audio);
  return (
    <button
      type="button"
      onMouseDown={keepFocus}
      onClick={(event) => {
        stopClick(event);
        toggle(audio);
      }}
      onKeyDown={stopKeys}
      aria-label={paused ? "Reproducir audio" : "Pausar audio"}
      aria-pressed={!paused}
    >
      {paused ? <Volume2 /> : <Pause fill="currentColor" />}
    </button>
  );
}

const dockButton =
  "flex size-11 shrink-0 items-center justify-center rounded-full text-foreground transition-[opacity,transform] hover:opacity-100 active:scale-90";

// Full controls for the clip that played last, docked under the card where there is room for touch targets.
export function AudioDock({ audio, onRateChange }: AudioControlsProps & { onRateChange: (rate: number) => void }) {
  const { paused, duration, rate } = useAudioState(audio);

  const cycleRate = () => {
    const index = PLAYBACK_RATES.findIndex((value) => value === rate);
    onRateChange(PLAYBACK_RATES[(index + 1) % PLAYBACK_RATES.length]);
  };

  return (
    <div
      role="group"
      aria-label="Reproductor de audio"
      className="sticky bottom-0 z-10 flex items-center gap-0.5 border-t bg-card/90 px-1.5 py-1 backdrop-blur-xl"
      onClick={stopClick}
      onKeyDown={stopKeys}
    >
      <button type="button" className={dockButton} onMouseDown={keepFocus} onClick={() => toggle(audio)} aria-label={paused ? "Reproducir" : "Pausar"}>
        {paused ? <Play className="size-5 fill-current" /> : <Pause className="size-5 fill-current" />}
      </button>
      {audio instanceof SpeechClip ? (
        <span className="min-w-0 flex-1 truncate px-2 text-xs text-muted-foreground">Voz del dispositivo</span>
      ) : (
        <SeekControls audio={audio} duration={duration} />
      )}
      <button
        type="button"
        className="flex h-11 min-w-11 shrink-0 items-center justify-center rounded-full px-2 text-sm font-semibold tabular-nums text-foreground active:scale-90"
        onMouseDown={keepFocus}
        onClick={cycleRate}
        aria-label={`Velocidad ${formatRate(rate)}`}
        title="Cambiar velocidad"
      >
        {formatRate(rate)}
      </button>
    </div>
  );
}

function SeekControls({ audio, duration }: { audio: Clip; duration: number }) {
  const subscribeProgress = useCallback((callback: () => void) => subscribeTime(audio)(callback), [audio]);
  const currentTime = useAudioValue(subscribeProgress, () => readTime(audio));
  const progress = duration > 0 ? Math.min(currentTime / duration, 1) * 100 : 0;

  return (
    <>
      <button
        type="button"
        className={`${dockButton} opacity-70`}
        onMouseDown={keepFocus}
        onClick={() => seek(audio, audio.currentTime - SKIP_SECONDS)}
        aria-label={`Retroceder ${SKIP_SECONDS} segundos`}
        title={`Retroceder ${SKIP_SECONDS} s`}
      >
        <RotateCcw className="size-5" />
      </button>
      <span className="w-9 shrink-0 text-right text-xs tabular-nums text-muted-foreground">{formatTime(currentTime)}</span>
      <input
        type="range"
        min={0}
        max={duration || 1}
        step={0.01}
        value={Math.min(currentTime, duration || 1)}
        onChange={(event) => seek(audio, Number(event.target.value))}
        onPointerUp={(event) => event.currentTarget.blur()}
        aria-label="Posición"
        aria-valuetext={`${formatTime(currentTime)} de ${formatTime(duration)}`}
        className="fc-range mx-2 min-w-0 flex-1"
        style={{ "--fc-progress": `${progress}%` } as CSSProperties}
      />
      <span className="w-9 shrink-0 text-xs tabular-nums text-muted-foreground">{formatTime(duration)}</span>
    </>
  );
}
