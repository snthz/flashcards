"use client";

import { useCallback, useSyncExternalStore, type CSSProperties, type KeyboardEvent, type MouseEvent } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";

export const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5] as const;
const SKIP_SECONDS = 3;

export const AUDIO_MOUNT_CSS = `
.fc-root .fc-audio { display: inline-flex; vertical-align: middle; max-width: 100%; min-width: 0; margin: .25rem; }
`;

// Lives in the player's own shadow root, so deck CSS (e.g. global button rules) cannot restyle it.
export const AUDIO_PLAYER_CSS = `
.fc-player { position: relative; box-sizing: border-box; display: inline-flex; align-items: center; gap: .125rem; max-width: 100%; height: 2.5rem; padding: 0 .625rem 0 .25rem; overflow: hidden; border: 1px solid var(--border, rgba(127,127,127,.3)); border-radius: 999px; background: var(--card, transparent); color: var(--foreground, inherit); font: 500 .8125rem/1 system-ui, sans-serif; text-align: left; white-space: nowrap; user-select: none; -webkit-user-select: none; }
.fc-player button { all: unset; box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center; flex: none; height: 2rem; min-width: 2rem; border-radius: 999px; cursor: pointer; color: inherit; opacity: .8; transition: opacity .15s; -webkit-tap-highlight-color: transparent; }
.fc-player button:hover { opacity: 1; }
.fc-player button:focus-visible, .fc-player input:focus-visible { outline: 2px solid var(--ring, rgba(127,127,127,.5)); outline-offset: 1px; }
.fc-player button svg { width: 1.125rem; height: 1.125rem; }
.fc-player .fc-play { opacity: 1; }
.fc-player .fc-play svg { fill: currentColor; }
.fc-player .fc-rate { padding: 0 .25rem; font-variant-numeric: tabular-nums; font-weight: 600; font-size: .75rem; }
.fc-player .fc-time { flex: none; padding: 0 .25rem; color: var(--muted-foreground, inherit); font-variant-numeric: tabular-nums; font-size: .75rem; }
.fc-player input[type=range] { -webkit-appearance: none; appearance: none; position: absolute; left: 1.25rem; right: 1.25rem; bottom: 1px; height: 8px; margin: 0; background: transparent; cursor: pointer; }
.fc-player input[type=range]::-webkit-slider-runnable-track { height: 2px; border-radius: 999px; background: linear-gradient(to right, var(--foreground, #222) var(--fc-progress, 0%), var(--border, rgba(127,127,127,.35)) var(--fc-progress, 0%)); }
.fc-player input[type=range]::-moz-range-track { height: 2px; border-radius: 999px; background: var(--border, rgba(127,127,127,.35)); }
.fc-player input[type=range]::-moz-range-progress { height: 2px; border-radius: 999px; background: var(--foreground, #222); }
.fc-player input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 8px; height: 8px; margin-top: -3px; border: 0; border-radius: 50%; background: var(--foreground, #222); }
.fc-player input[type=range]::-moz-range-thumb { width: 8px; height: 8px; border: 0; border-radius: 50%; background: var(--foreground, #222); }
`;

const subscribeEvents = (audio: HTMLAudioElement, events: string[]) => (callback: () => void) => {
  events.forEach((name) => audio.addEventListener(name, callback));
  return () => events.forEach((name) => audio.removeEventListener(name, callback));
};

// Safari returns a new currentTime on every read while playing; useSyncExternalStore needs a stable
// snapshot or it re-renders forever, so reads come from this cache, refreshed only by the subscription.
const times = new WeakMap<HTMLAudioElement, number>();

function readTime(audio: HTMLAudioElement) {
  if (!times.has(audio)) times.set(audio, audio.currentTime);
  return times.get(audio) ?? 0;
}

// Polls on animation frames while playing so the progress bar moves smoothly on short clips.
const subscribeTime = (audio: HTMLAudioElement) => (notify: () => void) => {
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
function seek(audio: HTMLAudioElement, time: number) {
  const end = Number.isFinite(audio.duration) ? audio.duration : time;
  audio.currentTime = Math.min(Math.max(time, 0), end);
}

function toggle(audio: HTMLAudioElement) {
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

interface AudioPlayerProps {
  audio: HTMLAudioElement;
  onRateChange: (rate: number) => void;
}

export function AudioPlayer({ audio, onRateChange }: AudioPlayerProps) {
  const subscribeState = useCallback(
    (callback: () => void) => subscribeEvents(audio, ["play", "pause", "ended", "durationchange", "loadedmetadata", "ratechange"])(callback),
    [audio],
  );
  const subscribeProgress = useCallback((callback: () => void) => subscribeTime(audio)(callback), [audio]);

  const paused = useAudioValue(subscribeState, () => audio.paused);
  const duration = useAudioValue(subscribeState, () => (Number.isFinite(audio.duration) ? audio.duration : 0));
  const rate = useAudioValue(subscribeState, () => audio.playbackRate);
  const currentTime = useAudioValue(subscribeProgress, () => readTime(audio));

  const cycleRate = () => {
    const index = PLAYBACK_RATES.findIndex((value) => value === rate);
    onRateChange(PLAYBACK_RATES[(index + 1) % PLAYBACK_RATES.length]);
  };

  const progress = duration > 0 ? Math.min(currentTime / duration, 1) * 100 : 0;

  // Keep clicks from revealing the card, and keep focus off the buttons so Space/Enter still drive the study session.
  const stop = (event: MouseEvent) => event.stopPropagation();
  const keepFocus = (event: MouseEvent) => event.preventDefault();
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === " " || event.key === "Enter") event.stopPropagation();
  };

  return (
    <span className="fc-player" role="group" aria-label="Reproductor de audio" onClick={stop} onKeyDown={onKeyDown}>
      <button type="button" className="fc-play" onMouseDown={keepFocus} onClick={() => toggle(audio)} aria-label={paused ? "Reproducir" : "Pausar"}>
        {paused ? <Play /> : <Pause />}
      </button>
      {duration > SKIP_SECONDS * 2 ? (
        <button
          type="button"
          onMouseDown={keepFocus}
          onClick={() => seek(audio, audio.currentTime - SKIP_SECONDS)}
          aria-label={`Retroceder ${SKIP_SECONDS} segundos`}
          title={`Retroceder ${SKIP_SECONDS} s`}
        >
          <RotateCcw />
        </button>
      ) : null}
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
        style={{ "--fc-progress": `${progress}%` } as CSSProperties}
      />
      <span className="fc-time">
        {formatTime(currentTime)} / {formatTime(duration)}
      </span>
      <button type="button" className="fc-rate" onMouseDown={keepFocus} onClick={cycleRate} aria-label={`Velocidad ${formatRate(rate)}`} title="Cambiar velocidad">
        {formatRate(rate)}
      </button>
    </span>
  );
}
