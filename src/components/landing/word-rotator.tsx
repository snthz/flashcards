"use client";

import { useEffect, useState } from "react";

export function WordRotator({ words, interval = 2400 }: { words: string[]; interval?: number }) {
  const [index, setIndex] = useState(0);
  const count = words.length;
  const active = index % count;

  useEffect(() => {
    if (count < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setIndex((value) => (value + 1) % count), interval);
    return () => window.clearInterval(id);
  }, [count, interval]);

  return (
    <span className="rotator">
      {words.map((word, position) => (
        <span
          key={word}
          data-state={position === active ? "active" : position === (active - 1 + count) % count ? "leaving" : "idle"}
        >
          {word}
        </span>
      ))}
    </span>
  );
}
