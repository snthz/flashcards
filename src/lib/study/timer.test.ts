import { describe, expect, it } from "vitest";
import { advance, createGoal, createPomodoro, formatClock, parseTimer, progress, remainingMs, skipBreak, togglePause, type TimerState } from "./timer";

const MIN = 60_000;

function run(state: TimerState, from: number, ms: number, visible = true, step = 1000) {
  let current = state;
  const events: string[] = [];
  for (let t = from + step; t <= from + ms; t += step) {
    const result = advance(current, t, visible);
    current = result.state;
    if (result.event) events.push(result.event);
  }
  return { state: current, events };
}

describe("study timer", () => {
  it("counts down a goal and keeps counting after it is reached", () => {
    const start = createGoal(1, 0, "2026-10-27");
    const half = run(start, 0, 30_000).state;
    expect(remainingMs(half)).toBe(30_000);
    expect(progress(half)).toBe(0.5);
    const done = run(half, 30_000, 45_000);
    expect(done.events).toEqual(["goal-reached"]);
    expect(done.state.done).toBe(true);
    expect(done.state.totalWorkMs).toBe(75_000);
  });

  it("doesn't count study time while the page is hidden or after a long gap", () => {
    const start = createGoal(40, 0, "d");
    expect(run(start, 0, 60_000, false).state.totalWorkMs).toBe(0);
    expect(advance(start, 10 * MIN, true).state.totalWorkMs).toBe(5000);
  });

  it("pauses and resumes", () => {
    const paused = togglePause(createGoal(10, 0, "d"), 0);
    expect(run(paused, 0, 30_000).state.totalWorkMs).toBe(0);
    const resumed = togglePause(paused, 30_000);
    expect(run(resumed, 30_000, 10_000).state.totalWorkMs).toBe(10_000);
  });

  it("cycles pomodoro work and breaks, with breaks running even when hidden", () => {
    const start = createPomodoro(0, "d");
    const work = run(start, 0, 25 * MIN, true, 5000);
    expect(work.events).toEqual(["break-started"]);
    expect(work.state.phase).toBe("break");
    expect(remainingMs(work.state)).toBe(5 * MIN);
    const rest = advance(work.state, 25 * MIN + 5 * MIN, false);
    expect(rest.event).toBe("break-ended");
    expect(rest.state.phase).toBe("work");
  });

  it("takes a long break every fourth round and can skip a break", () => {
    const fourth: TimerState = { ...createPomodoro(0, "d"), round: 4, phase: "break" };
    expect(remainingMs(fourth)).toBe(15 * MIN);
    expect(skipBreak(fourth, 0).phase).toBe("work");
  });

  it("formats the clock and forgets yesterday's timer", () => {
    expect(formatClock(25 * MIN)).toBe("25:00");
    expect(formatClock(61_500)).toBe("1:02");
    const saved = JSON.stringify(createGoal(40, 0, "2026-10-26"));
    expect(parseTimer(saved, "2026-10-27")).toBeNull();
    expect(parseTimer(saved, "2026-10-26")?.workMs).toBe(40 * MIN);
    expect(parseTimer("{bad", "2026-10-26")).toBeNull();
  });
});
