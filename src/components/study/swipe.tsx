"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent, type RefObject } from "react";
import { Hand } from "lucide-react";
import { cn } from "@/lib/utils";

export type SwipeDirection = "left" | "right";

const START_DISTANCE = 10;
const COMMIT_RATIO = 0.22;
const MIN_COMMIT = 70;
const FLY_MS = 160;
const HINT_KEY = "fc-swipe-hint-seen";
const HINT_MS = 4200;

function commitDistance(width: number) {
  return Math.max(MIN_COMMIT, width * COMMIT_RATIO);
}

function reducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function shouldShowSwipeHint() {
  if (typeof window === "undefined" || !window.matchMedia("(pointer: coarse)").matches) return false;
  try {
    return localStorage.getItem(HINT_KEY) !== "1";
  } catch {
    return false;
  }
}

export function markSwipeHintSeen() {
  try {
    localStorage.setItem(HINT_KEY, "1");
  } catch {
    return;
  }
}

export function useSwipe(enabled: boolean, onCommit: (direction: SwipeDirection) => void) {
  const start = useRef<{ x: number; y: number; id: number; mode: "pending" | "x" | "off" } | null>(null);
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [width, setWidth] = useState(320);

  const onPointerDown = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      if (!enabled || event.pointerType === "mouse") return;
      setWidth(event.currentTarget.clientWidth);
      start.current = { x: event.clientX, y: event.clientY, id: event.pointerId, mode: "pending" };
    },
    [enabled],
  );

  const onPointerMove = useCallback((event: PointerEvent<HTMLElement>) => {
    const state = start.current;
    if (!state || state.id !== event.pointerId || state.mode === "off") return;
    const dx = event.clientX - state.x;
    const dy = event.clientY - state.y;
    if (state.mode === "pending") {
      if (Math.abs(dy) > START_DISTANCE && Math.abs(dy) > Math.abs(dx)) {
        state.mode = "off";
        return;
      }
      if (Math.abs(dx) < START_DISTANCE) return;
      state.mode = "x";
      setDragging(true);
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    setOffset(dx);
  }, []);

  const finish = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      const state = start.current;
      start.current = null;
      if (!state || state.mode !== "x") return;
      setDragging(false);
      const dx = event.clientX - state.x;
      const cardWidth = event.currentTarget.clientWidth;
      if (Math.abs(dx) < commitDistance(cardWidth)) {
        setOffset(0);
        return;
      }
      const direction: SwipeDirection = dx > 0 ? "right" : "left";
      setOffset((dx > 0 ? 1 : -1) * cardWidth * 1.3);
      window.setTimeout(() => {
        onCommit(direction);
        setOffset(0);
      }, FLY_MS);
    },
    [onCommit],
  );

  const progress = Math.min(1, Math.abs(offset) / commitDistance(width));
  return {
    handlers: { onPointerDown, onPointerMove, onPointerUp: finish, onPointerCancel: finish },
    style: {
      transform: offset ? `translateX(${offset}px) rotate(${offset * 0.03}deg)` : undefined,
      transition: dragging ? "none" : `transform ${FLY_MS}ms ease-out`,
      touchAction: enabled ? ("pan-y" as const) : undefined,
    },
    direction: offset > 0 ? ("right" as const) : offset < 0 ? ("left" as const) : null,
    progress,
  };
}

export function SwipeTint({ direction, progress, rightLabel, leftLabel }: { direction: SwipeDirection | null; progress: number; rightLabel: string; leftLabel: string }) {
  if (!direction || progress === 0) return null;
  const right = direction === "right";
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-10">
      <div className={cn("absolute inset-0 rounded-2xl", right ? "bg-success" : "bg-danger")} style={{ opacity: progress * 0.14 }} />
      <span
        className={cn(
          "absolute top-5 rounded-lg border-2 bg-card px-3 py-1 text-sm font-bold uppercase tracking-wide shadow-sm",
          right ? "left-5 -rotate-6 border-success text-success" : "right-5 rotate-6 border-danger text-danger",
        )}
        style={{ opacity: Math.min(1, progress * 1.5) }}
      >
        {right ? rightLabel : leftLabel}
      </span>
    </div>
  );
}

export function SwipeHint({ target, text, onDone }: { target: RefObject<HTMLElement | null>; text: string; onDone: () => void }) {
  const handRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const animations: Animation[] = [];
    if (!reducedMotion()) {
      const card = target.current?.animate(
        [
          { transform: "translateX(0) rotate(0deg)" },
          { transform: "translateX(36px) rotate(1.5deg)", offset: 0.25 },
          { transform: "translateX(0) rotate(0deg)", offset: 0.5 },
          { transform: "translateX(-36px) rotate(-1.5deg)", offset: 0.75 },
          { transform: "translateX(0) rotate(0deg)" },
        ],
        { duration: 1600, iterations: 2, easing: "ease-in-out", delay: 250 },
      );
      if (card) animations.push(card);
      const hand = handRef.current?.animate(
        [
          { transform: "translateX(0)" },
          { transform: "translateX(28px)", offset: 0.25 },
          { transform: "translateX(0)", offset: 0.5 },
          { transform: "translateX(-28px)", offset: 0.75 },
          { transform: "translateX(0)" },
        ],
        { duration: 1600, iterations: Infinity, easing: "ease-in-out", delay: 250 },
      );
      if (hand) animations.push(hand);
    }
    const timer = window.setTimeout(onDone, HINT_MS);
    return () => {
      window.clearTimeout(timer);
      animations.forEach((animation) => animation.cancel());
    };
  }, [target, onDone]);

  return (
    <div role="status" className="pointer-events-none absolute inset-x-0 bottom-5 z-20 flex justify-center px-4 animate-in">
      <div className="flex items-center gap-3 rounded-full bg-foreground/90 px-4 py-2.5 text-sm font-medium text-background shadow-lg">
        <span ref={handRef} className="flex">
          <Hand className="size-5" aria-hidden />
        </span>
        <span>{text}</span>
      </div>
    </div>
  );
}
