"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePrefersDark } from "@/lib/hooks/use-is-client";
import { AUDIO_MOUNT_CSS, AUDIO_TOGGLE_CSS, AudioDock, AudioToggle, PLAYBACK_RATES } from "./audio-player";

interface CardFrameProps {
  html: string;
  css: string;
  ord: number;
  side: "question" | "answer";
  autoplay: string[];
}

interface Player {
  mount: HTMLElement;
  target: ShadowRoot;
  audio: HTMLAudioElement;
}

const RATE_KEY = "fc-audio-rate";

function readRate() {
  try {
    const value = Number(localStorage.getItem(RATE_KEY));
    return (PLAYBACK_RATES as readonly number[]).includes(value) ? value : 1;
  } catch {
    return 1;
  }
}

function saveRate(rate: number) {
  try {
    localStorage.setItem(RATE_KEY, String(rate));
  } catch {
    // Storage unavailable (private mode); the rate still applies to this card.
  }
}

const BASE_CSS = `
:host { display: flex; flex-direction: column; flex: 1; color: inherit; }
.fc-root { display: flex; flex: 1; flex-direction: column; overflow-wrap: break-word; }
.fc-root > .card { flex: 1; padding: 1.5rem 1rem; }
.fc-root img { max-width: 100%; height: auto; }
.fc-root .cloze { color: var(--fc-accent, #4f46e5); font-weight: 600; }
.fc-root details.hint summary { cursor: pointer; color: var(--fc-accent, #4f46e5); }
.fc-root .typeans { font: inherit; font-size: max(16px, 1em); width: 100%; max-width: 24rem; padding: .5rem .75rem; border: 1px solid rgba(127,127,127,.4); border-radius: .5rem; background: transparent; color: inherit; }
.fc-root .typeans-answer { margin-top: .5rem; font-weight: 600; }
.fc-root hr#answer { border: 0; border-top: 1px solid rgba(127,127,127,.35); margin: 1rem 0; }
${AUDIO_MOUNT_CSS}`;

export function CardFrame({ html, css, ord, side, autoplay }: CardFrameProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<ShadowRoot | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [active, setActive] = useState(0);
  const dark = usePrefersDark();

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    if (!shadowRef.current) shadowRef.current = host.attachShadow({ mode: "open" });
    const root = shadowRef.current;
    root.innerHTML = `<style>${BASE_CSS}${css}</style><div class="fc-root"><div class="card card${ord + 1} ${side}${dark ? " nightMode night_mode" : ""}">${html}</div></div>`;

    const rate = readRate();
    const items: Player[] = Array.from(root.querySelectorAll<HTMLElement>(".fc-audio[data-src]"), (mount) => {
      const audio = new Audio(mount.dataset.src);
      audio.preload = "auto";
      audio.defaultPlaybackRate = rate;
      audio.playbackRate = rate;
      const target = mount.shadowRoot ?? mount.attachShadow({ mode: "open" });
      target.innerHTML = `<style>${AUDIO_TOGGLE_CSS}</style>`;
      return { mount, target, audio };
    });

    let cancelled = false;
    let current: HTMLAudioElement | null = null;
    const used = new Set<HTMLAudioElement>();
    const queue = autoplay.flatMap((src) => {
      const match = items.find((item) => !used.has(item.audio) && item.mount.dataset.src === src);
      if (!match) return [];
      used.add(match.audio);
      return [match.audio];
    });

    const playNext = () => {
      if (cancelled) return;
      current = queue.shift() ?? null;
      current?.play().catch(() => undefined);
    };

    const listeners = items.map(({ audio }, index) => {
      const onPlay = () => {
        setActive(index);
        // Only one clip at a time; playing anything by hand stops the autoplay sequence.
        if (audio !== current) cancelled = true;
        items.forEach((other) => other.audio !== audio && other.audio.pause());
      };
      const onEnded = () => {
        if (audio === current) playNext();
      };
      audio.addEventListener("play", onPlay);
      audio.addEventListener("ended", onEnded);
      return () => {
        audio.removeEventListener("play", onPlay);
        audio.removeEventListener("ended", onEnded);
      };
    });

    setPlayers(items);
    setActive(0);
    playNext();

    return () => {
      cancelled = true;
      listeners.forEach((remove) => remove());
      items.forEach(({ audio }) => {
        audio.pause();
        audio.removeAttribute("src");
        audio.load();
      });
    };
  }, [html, css, ord, side, autoplay, dark]);

  const changeRate = useCallback(
    (rate: number) => {
      saveRate(rate);
      players.forEach(({ audio }) => {
        audio.defaultPlaybackRate = rate;
        audio.playbackRate = rate;
      });
    },
    [players],
  );

  const docked = players[active] ?? players[0];

  return (
    <>
      <div ref={hostRef} className="flex flex-1 flex-col text-lg leading-relaxed">
        {players.map(({ target, audio }, index) => createPortal(<AudioToggle audio={audio} />, target, String(index)))}
      </div>
      {docked ? <AudioDock key={active} audio={docked.audio} onRateChange={changeRate} /> : null}
    </>
  );
}
