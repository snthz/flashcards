export type TimerMode = "goal" | "pomodoro";
export type TimerPhase = "work" | "break";
export type TimerEvent = "goal-reached" | "break-started" | "break-ended" | null;

export interface TimerState {
  version: 1;
  day: string;
  mode: TimerMode;
  workMs: number;
  breakMs: number;
  longBreakMs: number;
  phase: TimerPhase;
  phaseElapsedMs: number;
  totalWorkMs: number;
  round: number;
  paused: boolean;
  lastTickAt: number | null;
  done: boolean;
}

export const GOAL_MINUTES = [10, 20, 30, 40, 60];
export const POMODORO = { work: 25, short: 5, long: 15, roundsPerLong: 4 };
export const MAX_WORK_TICK_MS = 5000;
const MINUTE = 60_000;

export function localDay(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function base(mode: TimerMode, workMs: number, now: number, day: string): TimerState {
  return {
    version: 1,
    day,
    mode,
    workMs,
    breakMs: POMODORO.short * MINUTE,
    longBreakMs: POMODORO.long * MINUTE,
    phase: "work",
    phaseElapsedMs: 0,
    totalWorkMs: 0,
    round: 0,
    paused: false,
    lastTickAt: now,
    done: false,
  };
}

export function createGoal(minutes: number, now: number, day: string) {
  return base("goal", Math.max(1, minutes) * MINUTE, now, day);
}

export function createPomodoro(now: number, day: string) {
  return base("pomodoro", POMODORO.work * MINUTE, now, day);
}

export function phaseLength(state: TimerState) {
  if (state.phase === "work") return state.workMs;
  return state.round > 0 && state.round % POMODORO.roundsPerLong === 0 ? state.longBreakMs : state.breakMs;
}

export function remainingMs(state: TimerState) {
  return Math.max(0, phaseLength(state) - state.phaseElapsedMs);
}

export function progress(state: TimerState) {
  return Math.min(1, state.phaseElapsedMs / phaseLength(state));
}

export function advance(state: TimerState, now: number, visible: boolean): { state: TimerState; event: TimerEvent } {
  if (state.paused || state.lastTickAt == null) return { state: { ...state, lastTickAt: now }, event: null };
  const raw = Math.max(0, now - state.lastTickAt);
  const delta = state.phase === "work" ? (visible ? Math.min(raw, MAX_WORK_TICK_MS) : 0) : raw;
  const next: TimerState = {
    ...state,
    lastTickAt: now,
    phaseElapsedMs: state.phaseElapsedMs + delta,
    totalWorkMs: state.totalWorkMs + (state.phase === "work" ? delta : 0),
  };
  if (next.mode === "goal") {
    if (!next.done && next.phaseElapsedMs >= next.workMs) return { state: { ...next, done: true }, event: "goal-reached" };
    return { state: next, event: null };
  }
  if (next.phase === "work" && next.phaseElapsedMs >= next.workMs) {
    return { state: { ...next, phase: "break", phaseElapsedMs: 0, round: next.round + 1 }, event: "break-started" };
  }
  if (next.phase === "break" && next.phaseElapsedMs >= phaseLength(next)) {
    return { state: { ...next, phase: "work", phaseElapsedMs: 0 }, event: "break-ended" };
  }
  return { state: next, event: null };
}

export function togglePause(state: TimerState, now: number): TimerState {
  return { ...state, paused: !state.paused, lastTickAt: now };
}

export function skipBreak(state: TimerState, now: number): TimerState {
  return state.phase === "break" ? { ...state, phase: "work", phaseElapsedMs: 0, lastTickAt: now } : state;
}

export function formatClock(ms: number) {
  const total = Math.ceil(ms / 1000);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function parseTimer(raw: string | null, today: string): TimerState | null {
  if (!raw) return null;
  try {
    const state = JSON.parse(raw) as TimerState;
    if (state.version !== 1 || state.day !== today) return null;
    return state;
  } catch {
    return null;
  }
}
