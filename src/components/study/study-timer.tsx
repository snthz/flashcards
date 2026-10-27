"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Coffee, Pause, Play, Timer, Trophy, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useMessages } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";
import {
  advance,
  createGoal,
  createPomodoro,
  formatClock,
  GOAL_MINUTES,
  localDay,
  parseTimer,
  POMODORO,
  progress,
  remainingMs,
  skipBreak,
  togglePause,
  type TimerEvent,
  type TimerState,
} from "@/lib/study/timer";
import { focusShortcut, runShortcut } from "@/lib/study/focus";

const STORAGE_KEY = "fc-study-timer";
const TICK_MS = 1000;

function load() {
  try {
    return parseTimer(localStorage.getItem(STORAGE_KEY), localDay(new Date()));
  } catch {
    return null;
  }
}

function save(state: TimerState | null) {
  try {
    if (state) localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    return;
  }
}

function chime() {
  try {
    navigator.vibrate?.([120, 80, 120]);
    const AudioContextClass = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    [660, 880].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.frequency.value = frequency;
      oscillator.type = "sine";
      const start = context.currentTime + index * 0.18;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.18, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.35);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.4);
    });
    window.setTimeout(() => void context.close(), 1200);
  } catch {
    return;
  }
}

export function useStudyTimer() {
  const [state, setState] = useState<TimerState | null>(null);
  const [notice, setNotice] = useState<TimerEvent>(null);
  const stateRef = useRef<TimerState | null>(null);

  const commit = useCallback((next: TimerState | null) => {
    stateRef.current = next;
    setState(next);
    save(next);
  }, []);

  useEffect(() => {
    const restore = window.setTimeout(() => {
      const saved = load();
      stateRef.current = saved;
      setState(saved);
    }, 0);
    const interval = window.setInterval(() => {
      const current = stateRef.current;
      if (!current) return;
      if (current.day !== localDay(new Date())) {
        commit(null);
        return;
      }
      const result = advance(current, Date.now(), document.visibilityState === "visible");
      commit(result.state);
      if (result.event) {
        setNotice(result.event);
        chime();
      }
    }, TICK_MS);
    return () => {
      window.clearTimeout(restore);
      window.clearInterval(interval);
    };
  }, [commit]);

  const active = Boolean(state && !state.paused && state.phase === "work");
  useEffect(() => {
    if (!active || !("wakeLock" in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    let released = false;
    const request = () => {
      if (document.visibilityState !== "visible") return;
      navigator.wakeLock
        .request("screen")
        .then((sentinel) => {
          if (released) void sentinel.release();
          else lock = sentinel;
        })
        .catch(() => null);
    };
    request();
    document.addEventListener("visibilitychange", request);
    return () => {
      released = true;
      document.removeEventListener("visibilitychange", request);
      void lock?.release().catch(() => null);
    };
  }, [active]);

  return {
    state,
    notice,
    dismissNotice: useCallback(() => setNotice(null), []),
    startGoal: useCallback((minutes: number) => commit(createGoal(minutes, Date.now(), localDay(new Date()))), [commit]),
    startPomodoro: useCallback(() => commit(createPomodoro(Date.now(), localDay(new Date()))), [commit]),
    pauseOrResume: useCallback(() => stateRef.current && commit(togglePause(stateRef.current, Date.now())), [commit]),
    skip: useCallback(() => {
      if (stateRef.current) commit(skipBreak(stateRef.current, Date.now()));
      setNotice(null);
    }, [commit]),
    stop: useCallback(() => {
      commit(null);
      setNotice(null);
    }, [commit]),
  };
}

export type StudyTimer = ReturnType<typeof useStudyTimer>;

function Ring({ value, className }: { value: number; className?: string }) {
  const radius = 9;
  const circumference = 2 * Math.PI * radius;
  return (
    <svg viewBox="0 0 24 24" className={cn("size-5 -rotate-90", className)} aria-hidden>
      <circle cx="12" cy="12" r={radius} fill="none" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3" />
      <circle
        cx="12"
        cy="12"
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - value)}
      />
    </svg>
  );
}

export function StudyTimerButton({ timer }: { timer: StudyTimer }) {
  const t = useMessages().timer;
  const [open, setOpen] = useState(false);
  const { state } = timer;

  const start = (begin: () => void) => {
    begin();
    setOpen(false);
    const shortcut = focusShortcut("on");
    if (shortcut) runShortcut(shortcut);
  };

  const label = !state
    ? t.open
    : state.phase === "break"
      ? t.breakLabel(formatClock(remainingMs(state)))
      : state.done
        ? t.doneLabel(Math.round(state.totalWorkMs / 60_000))
        : t.remainingLabel(formatClock(remainingMs(state)));

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={label}
        title={label}
        className={cn(
          "flex h-9 items-center gap-1.5 rounded-lg px-2 text-xs font-medium tabular-nums transition-colors hover:bg-muted",
          state ? "text-foreground" : "text-muted-foreground hover:text-foreground",
          state?.paused && "opacity-60",
        )}
      >
        {!state ? (
          <Timer className="size-4" />
        ) : state.phase === "break" ? (
          <>
            <Coffee className="size-4 text-info" />
            {formatClock(remainingMs(state))}
          </>
        ) : state.done ? (
          <>
            <Trophy className="size-4 text-success" />
            {Math.round(state.totalWorkMs / 60_000)}m
          </>
        ) : (
          <>
            <Ring value={progress(state)} className={state.mode === "pomodoro" ? "text-danger" : "text-success"} />
            {formatClock(remainingMs(state))}
          </>
        )}
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} title={t.title} description={state ? undefined : t.description}>
        {!state ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium">{t.goal}</p>
              <div className="grid grid-cols-5 gap-2">
                {GOAL_MINUTES.map((minutes) => (
                  <Button key={minutes} variant="outline" onClick={() => start(() => timer.startGoal(minutes))}>
                    {minutes}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">{t.goalHint}</p>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium">{t.pomodoro}</p>
              <Button variant="secondary" onClick={() => start(timer.startPomodoro)}>
                <Timer className="size-4" />
                {t.pomodoroStart(POMODORO.work, POMODORO.short)}
              </Button>
              <p className="text-xs text-muted-foreground">{t.pomodoroHint(POMODORO.long, POMODORO.roundsPerLong)}</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col items-center gap-1 py-2">
              <p className="text-4xl font-semibold tabular-nums">{state.done ? `+${formatClock(state.phaseElapsedMs - state.workMs)}` : formatClock(remainingMs(state))}</p>
              <p className="text-sm text-muted-foreground">
                {state.mode === "pomodoro" ? t.round(state.round + (state.phase === "work" ? 1 : 0), state.phase === "break") : t.goalOf(Math.round(state.workMs / 60_000))}
              </p>
              <p className="text-xs text-muted-foreground">{t.studiedToday(Math.floor(state.totalWorkMs / 60_000))}</p>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="ghost" className="text-danger" onClick={() => { timer.stop(); setOpen(false); const shortcut = focusShortcut("off"); if (shortcut) runShortcut(shortcut); }}>
                <X className="size-4" />
                {t.stop}
              </Button>
              {state.phase === "break" ? (
                <Button variant="secondary" onClick={timer.skip}>
                  {t.skipBreak}
                </Button>
              ) : null}
              <Button onClick={timer.pauseOrResume}>
                {state.paused ? <Play className="size-4" /> : <Pause className="size-4" />}
                {state.paused ? t.resume : t.pause}
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
}

export function TimerBreak({ timer }: { timer: StudyTimer }) {
  const t = useMessages().timer;
  const { state } = timer;
  if (!state || state.phase !== "break") return null;
  const long = state.round % POMODORO.roundsPerLong === 0;
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 rounded-2xl border bg-card p-8 text-center animate-in">
      <Coffee className="size-12 text-info" />
      <div className="flex flex-col gap-1">
        <p className="text-lg font-semibold">{long ? t.longBreakTitle : t.breakTitle}</p>
        <p className="max-w-sm text-sm text-muted-foreground">{t.breakBody}</p>
      </div>
      <p className="text-5xl font-semibold tabular-nums">{formatClock(remainingMs(state))}</p>
      <div className="h-1.5 w-48 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-info transition-[width] duration-1000 ease-linear" style={{ width: `${progress(state) * 100}%` }} />
      </div>
      <Button variant="outline" onClick={timer.skip}>
        {t.skipBreak}
      </Button>
    </div>
  );
}

export function TimerNotice({ timer, onFinish }: { timer: StudyTimer; onFinish: () => void }) {
  const t = useMessages().timer;
  const { notice, state } = timer;
  if (notice !== "goal-reached" && notice !== "break-ended") return null;
  const goal = notice === "goal-reached";
  const offShortcut = goal ? focusShortcut("off") : null;
  return (
    <div role="status" className="absolute inset-x-3 top-14 z-30 flex flex-col gap-3 rounded-xl border bg-background p-4 shadow-xl">
      <div className="flex items-start gap-3">
        {goal ? <Trophy className="size-6 shrink-0 text-success" /> : <Play className="size-6 shrink-0 text-danger" />}
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="text-sm font-semibold">{goal ? t.goalReachedTitle : t.backToWorkTitle}</p>
          <p className="text-sm text-muted-foreground">{goal ? t.goalReachedBody(Math.round((state?.workMs ?? 0) / 60_000)) : t.backToWorkBody}</p>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        {goal ? (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              timer.dismissNotice();
              if (offShortcut) runShortcut(offShortcut);
              onFinish();
            }}
          >
            {t.finish}
          </Button>
        ) : null}
        <Button size="sm" variant={goal ? "secondary" : "primary"} onClick={timer.dismissNotice}>
          {goal ? t.keepGoing : t.ok}
        </Button>
      </div>
    </div>
  );
}
