import { cn } from "@/lib/utils";
import { cssVars } from "./motion";

interface MarqueeWord {
  front: string;
  back: string;
}

export function WordMarquee({ words, seconds, reverse = false }: { words: MarqueeWord[]; seconds: number; reverse?: boolean }) {
  return (
    <div className="group flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
      {[0, 1].map((copy) => (
        <ul
          key={copy}
          className={cn(
            "flex shrink-0 animate-marquee gap-3 pr-3 group-hover:[animation-play-state:paused]",
            reverse && "[animation-direction:reverse]",
          )}
          style={cssVars({ "--duration": `${seconds}s` })}
        >
          {words.map((word) => (
            <li
              key={word.front}
              className="flex items-center gap-2 whitespace-nowrap rounded-full border bg-card px-3.5 py-1.5 text-sm shadow-xs"
            >
              <span lang="en" className="font-medium">
                {word.front}
              </span>
              <span className="text-muted-foreground">{word.back}</span>
            </li>
          ))}
        </ul>
      ))}
    </div>
  );
}
