import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  computeStreaks,
  getWeekStart,
  getLocalDateString,
} from "../usePartners";
import type { CheckIn, Routine } from "@/types/database";

// ─── Factories ───────────────────────────────────────────

function makeRoutine(overrides: Partial<Routine> = {}): Routine {
  return {
    id: "r1",
    user_id: "u1",
    name: "Test",
    tag: "positive",
    time_of_day: null,
    sort_order: 0,
    archived_at: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

function makeCheckIn(overrides: Partial<CheckIn> = {}): CheckIn {
  return {
    id: "ci1",
    user_id: "u1",
    routine_id: "r1",
    date: "2026-03-11",
    completed: true,
    created_at: "2026-03-11T08:00:00Z",
    updated_at: "2026-03-11T08:00:00Z",
    ...overrides,
  };
}

// ─── getLocalDateString ──────────────────────────────────

describe("getLocalDateString (partners)", () => {
  it("formats date as YYYY-MM-DD", () => {
    const date = new Date(2026, 2, 11);
    expect(getLocalDateString(date)).toBe("2026-03-11");
  });

  it("pads single digits", () => {
    const date = new Date(2026, 0, 3);
    expect(getLocalDateString(date)).toBe("2026-01-03");
  });
});

// ─── getWeekStart ────────────────────────────────────────

describe("getWeekStart", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns Monday for a Wednesday", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 2, 11)); // Wednesday March 11
    expect(getWeekStart()).toBe("2026-03-09"); // Monday March 9
  });

  it("returns same day for a Monday", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 2, 9)); // Monday March 9
    expect(getWeekStart()).toBe("2026-03-09");
  });

  it("returns previous Monday for a Sunday", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 2, 15)); // Sunday March 15
    expect(getWeekStart()).toBe("2026-03-09"); // Monday March 9
  });
});

// ─── computeStreaks ──────────────────────────────────────

describe("computeStreaks", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 2, 11)); // March 11, 2026 (Wednesday)
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const routines = [makeRoutine({ id: "r1" })];

  it("computes current streak counting backwards from today", () => {
    const checkIns = [
      makeCheckIn({ id: "c1", date: "2026-03-11", completed: true }),
      makeCheckIn({ id: "c2", date: "2026-03-10", completed: true }),
      makeCheckIn({ id: "c3", date: "2026-03-09", completed: true }),
    ];

    const result = computeStreaks(checkIns, routines);
    expect(result.currentStreak).toBe(3);
  });

  it("gives grace period when today has no check-ins", () => {
    // Yesterday and day before have check-ins, today does not
    const checkIns = [
      makeCheckIn({ id: "c1", date: "2026-03-10", completed: true }),
      makeCheckIn({ id: "c2", date: "2026-03-09", completed: true }),
    ];

    const result = computeStreaks(checkIns, routines);
    expect(result.currentStreak).toBe(2);
  });

  it("returns 0 when no completed check-ins", () => {
    const result = computeStreaks([], routines);
    expect(result.currentStreak).toBe(0);
    expect(result.longestStreak).toBe(0);
  });

  it("breaks streak on gap day", () => {
    const checkIns = [
      makeCheckIn({ id: "c1", date: "2026-03-11", completed: true }),
      // gap on March 10
      makeCheckIn({ id: "c2", date: "2026-03-09", completed: true }),
    ];

    const result = computeStreaks(checkIns, routines);
    expect(result.currentStreak).toBe(1); // only today
  });

  it("computes longest streak across all history", () => {
    const checkIns = [
      // Old 4-day streak
      makeCheckIn({ id: "c1", date: "2026-03-01", completed: true }),
      makeCheckIn({ id: "c2", date: "2026-03-02", completed: true }),
      makeCheckIn({ id: "c3", date: "2026-03-03", completed: true }),
      makeCheckIn({ id: "c4", date: "2026-03-04", completed: true }),
      // gap
      // current 2-day streak
      makeCheckIn({ id: "c5", date: "2026-03-10", completed: true }),
      makeCheckIn({ id: "c6", date: "2026-03-11", completed: true }),
    ];

    const result = computeStreaks(checkIns, routines);
    expect(result.longestStreak).toBe(4);
    expect(result.currentStreak).toBe(2);
  });

  it("longest equals current when current is the longest", () => {
    const checkIns = [
      makeCheckIn({ id: "c1", date: "2026-03-09", completed: true }),
      makeCheckIn({ id: "c2", date: "2026-03-10", completed: true }),
      makeCheckIn({ id: "c3", date: "2026-03-11", completed: true }),
    ];

    const result = computeStreaks(checkIns, routines);
    expect(result.currentStreak).toBe(3);
    expect(result.longestStreak).toBe(3);
  });

  it("ignores incomplete check-ins for streaks", () => {
    const checkIns = [
      makeCheckIn({ id: "c1", date: "2026-03-11", completed: true }),
      makeCheckIn({ id: "c2", date: "2026-03-10", completed: false }), // not completed
      makeCheckIn({ id: "c3", date: "2026-03-09", completed: true }),
    ];

    const result = computeStreaks(checkIns, routines);
    expect(result.currentStreak).toBe(1); // only today, gap yesterday
  });

  it("computes completion rate this week", () => {
    // Week starts Monday March 9, today is Wednesday March 11 = 3 days
    // 1 routine × 3 days = 3 max possible
    const checkIns = [
      makeCheckIn({ id: "c1", date: "2026-03-09", completed: true }),
      makeCheckIn({ id: "c2", date: "2026-03-11", completed: true }),
    ];

    const result = computeStreaks(checkIns, routines);
    // 2 completed out of 3 possible = 67%
    expect(result.completionRateThisWeek).toBe(67);
  });

  it("returns 0% completion with zero routines", () => {
    const checkIns = [
      makeCheckIn({ id: "c1", date: "2026-03-11", completed: true }),
    ];
    const emptyRoutines: Routine[] = [];

    const result = computeStreaks(checkIns, emptyRoutines);
    expect(result.completionRateThisWeek).toBe(0);
  });

  it("excludes archived routines from completion rate", () => {
    const mixedRoutines = [
      makeRoutine({ id: "r1", archived_at: null }),
      makeRoutine({ id: "r2", archived_at: "2026-03-01T00:00:00Z" }), // archived
    ];
    // 3 days this week, 1 active routine = 3 max
    const checkIns = [
      makeCheckIn({
        id: "c1",
        routine_id: "r1",
        date: "2026-03-11",
        completed: true,
      }),
      makeCheckIn({
        id: "c2",
        routine_id: "r1",
        date: "2026-03-10",
        completed: true,
      }),
      makeCheckIn({
        id: "c3",
        routine_id: "r1",
        date: "2026-03-09",
        completed: true,
      }),
    ];

    const result = computeStreaks(checkIns, mixedRoutines);
    expect(result.completionRateThisWeek).toBe(100);
  });

  it("handles single completed day", () => {
    const checkIns = [
      makeCheckIn({ id: "c1", date: "2026-03-11", completed: true }),
    ];

    const result = computeStreaks(checkIns, routines);
    expect(result.currentStreak).toBe(1);
    expect(result.longestStreak).toBe(1);
  });
});
