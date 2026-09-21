"use client";

import { useEffect, useRef } from "react";

interface CardFrameProps {
  html: string;
  css: string;
  ord: number;
  side: "question" | "answer";
  autoplay: string[];
}

const BASE_CSS = `
:host { display: block; color: inherit; }
.fc-root { padding: 1.5rem 1rem; min-height: 8rem; word-break: break-word; overflow-wrap: anywhere; }
.fc-root img { max-width: 100%; height: auto; }
.fc-root .cloze { color: var(--fc-accent, #4f46e5); font-weight: 600; }
.fc-root .fc-audio { display: inline-flex; align-items: center; justify-content: center; cursor: pointer; margin: 0 .25rem; padding: .25rem .5rem; border-radius: .5rem; background: var(--fc-muted, rgba(127,127,127,.15)); font-size: .9em; user-select: none; }
.fc-root .fc-audio:hover { background: var(--fc-muted-hover, rgba(127,127,127,.3)); }
.fc-root details.hint summary { cursor: pointer; color: var(--fc-accent, #4f46e5); }
.fc-root .typeans { font: inherit; width: 100%; max-width: 24rem; padding: .5rem .75rem; border: 1px solid rgba(127,127,127,.4); border-radius: .5rem; background: transparent; color: inherit; }
.fc-root .typeans-answer { margin-top: .5rem; font-weight: 600; }
.fc-root hr#answer { border: 0; border-top: 1px solid rgba(127,127,127,.35); margin: 1rem 0; }
`;

export function CardFrame({ html, css, ord, side, autoplay }: CardFrameProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<ShadowRoot | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    if (!shadowRef.current) shadowRef.current = host.attachShadow({ mode: "open" });
    const root = shadowRef.current;
    root.innerHTML = `<style>${BASE_CSS}${css}</style><div class="fc-root"><div class="card card${ord + 1} ${side}">${html}</div></div>`;

    const play = (src: string) => {
      audioRef.current?.pause();
      const audio = new Audio(src);
      audioRef.current = audio;
      audio.play().catch(() => undefined);
    };

    const onClick = (event: Event) => {
      const target = (event.target as HTMLElement | null)?.closest?.(".fc-audio") as HTMLElement | null;
      if (target?.dataset.src) {
        event.preventDefault();
        play(target.dataset.src);
      }
    };
    root.addEventListener("click", onClick);

    let cancelled = false;
    const queue = [...autoplay];
    const playNext = () => {
      if (cancelled || queue.length === 0) return;
      const src = queue.shift()!;
      audioRef.current?.pause();
      const audio = new Audio(src);
      audioRef.current = audio;
      audio.addEventListener("ended", playNext);
      audio.play().catch(() => undefined);
    };
    playNext();

    return () => {
      cancelled = true;
      root.removeEventListener("click", onClick);
      audioRef.current?.pause();
    };
  }, [html, css, ord, side, autoplay]);

  return <div ref={hostRef} className="text-lg leading-relaxed" />;
}
