"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function ExpandableText({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || expanded) return;
    const observer = new ResizeObserver(() => setOverflowing(el.scrollHeight > el.clientHeight + 1));
    observer.observe(el);
    return () => observer.disconnect();
  }, [expanded, text]);

  return (
    <div className={cn("flex flex-col items-start gap-1", className)}>
      <p ref={ref} className={cn("whitespace-pre-line break-words", !expanded && "line-clamp-3")}>
        {text}
      </p>
      {overflowing ? (
        <button type="button" className="text-xs font-medium text-foreground hover:underline" onClick={() => setExpanded((v) => !v)}>
          {expanded ? "Ver menos" : "Ver más"}
        </button>
      ) : null}
    </div>
  );
}
