import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getLocalDateString,
  getLast7Days,
  buildIdentitiesWithDetails,
} from "../useIdentities";
import type {
  Identity,
  IdentityHabit,
  Routine,
  CheckIn,
} from "@/types/database";

// ─── Factories ───────────────────────────────────────────

function makeRoutine(overrides: Partial<Routine> = {}): Routine {
  return {
    id: "r1",
    user_id: "u1",
    name: "Test Routine",
    tag: "positive",
    time_of_day: "morning",
    sort_order: 0,
    archived_at: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

function makeIdentity(overrides: Partial<Identity> = {}): Identity {
  return {
    id: "i1",
    user_id: "u1",
    statement: "I am a reader",
    archived_at: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

function makeIdentityHabit(overrides: Partial<IdentityHabit> = {}): IdentityHabit {
  return {
    id: "ih1",
    identity_id: "i1",
    routine_id: "r1",
    user_id: "u1",
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

describe("getLocalDateString", () => {
  it("formats a date as YYYY-MM-DD", () => {
    const date = new Date(2026, 2, 11); // March 11, 2026 (month is 0-indexed)
    expect(getLocalDateString(date)).toBe("2026-03-11");
  });

  it("pads single-digit month and day", () => {
    const date = new Date(2026, 0, 5); // Jan 5
    expect(getLocalDateString(date)).toBe("2026-01-05");
  });
});

// ─── getLast7Days ────────────────────────────────────────

describe("getLast7Days", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 2, 11)); // March 11, 2026
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 7 dates", () => {
    const days = getLast7Days();
    expect(days).toHaveLength(7);
  });

  it("ends with today", () => {
    const days = getLast7Days();
    expect(days[6]).toBe("2026-03-11");
  });

  it("starts 6 days ago", () => {
    const days = getLast7Days();
    expect(days[0]).toBe("2026-03-05");
  });

  it("returns dates in ascending order", () => {
    const days = getLast7Days();
    for (let i = 1; i < days.length; i++) {
      expect(days[i] > days[i - 1]).toBe(true);
    }
  });
});

// ─── buildIdentitiesWithDetails ─────────────────────────

describe("buildIdentitiesWithDetails", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 2, 11)); // March 11, 2026
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns enriched identities with linked routines", () => {
    const identities = [makeIdentity({ id: "i1" })];
    const links = [makeIdentityHabit({ identity_id: "i1", routine_id: "r1" })];
    const routines = [makeRoutine({ id: "r1", name: "Read" })];
    const checkIns: CheckIn[] = [];

    const result = buildIdentitiesWithDetails(identities, links, routines, checkIns);

    expect(result).toHaveLength(1);
    expect(result[0].linked_routines).toHaveLength(1);
    expect(result[0].linked_routines[0].name).toBe("Read");
  });

  it("computes total_votes from completed check-ins", () => {
    const identities = [makeIdentity({ id: "i1" })];
    const links = [makeIdentityHabit({ identity_id: "i1", routine_id: "r1" })];
    const routines = [makeRoutine({ id: "r1" })];
    const checkIns = [
      makeCheckIn({ id: "c1", routine_id: "r1", date: "2026-03-10", completed: true }),
      makeCheckIn({ id: "c2", routine_id: "r1", date: "2026-03-11", completed: true }),
      makeCheckIn({ id: "c3", routine_id: "r1", date: "2026-03-09", completed: true }),
    ];

    const result = buildIdentitiesWithDetails(identities, links, routines, checkIns);
    expect(result[0].total_votes).toBe(3);
  });

  it("does not count incomplete check-ins as votes", () => {
    const identities = [makeIdentity({ id: "i1" })];
    const links = [makeIdentityHabit({ identity_id: "i1", routine_id: "r1" })];
    const routines = [makeRoutine({ id: "r1" })];
    const checkIns = [
      makeCheckIn({ id: "c1", routine_id: "r1", date: "2026-03-11", completed: true }),
      makeCheckIn({ id: "c2", routine_id: "r1", date: "2026-03-10", completed: false }),
    ];

    const result = buildIdentitiesWithDetails(identities, links, routines, checkIns);
    expect(result[0].total_votes).toBe(1);
  });

  it("computes votes_today for today only", () => {
    const identities = [makeIdentity({ id: "i1" })];
    const links = [makeIdentityHabit({ identity_id: "i1", routine_id: "r1" })];
    const routines = [makeRoutine({ id: "r1" })];
    const checkIns = [
      makeCheckIn({ id: "c1", routine_id: "r1", date: "2026-03-11", completed: true }),
      makeCheckIn({ id: "c2", routine_id: "r1", date: "2026-03-10", completed: true }),
    ];

    const result = buildIdentitiesWithDetails(identities, links, routines, checkIns);
    expect(result[0].votes_today).toBe(1);
  });

  it("computes votes_this_week from week start", () => {
    const identities = [makeIdentity({ id: "i1" })];
    const links = [makeIdentityHabit({ identity_id: "i1", routine_id: "r1" })];
    const routines = [makeRoutine({ id: "r1" })];
    // March 11 2026 is a Wednesday. Week starts March 5 (Thursday in last7Days logic).
    const checkIns = [
      makeCheckIn({ id: "c1", routine_id: "r1", date: "2026-03-11", completed: true }),
      makeCheckIn({ id: "c2", routine_id: "r1", date: "2026-03-09", completed: true }),
      makeCheckIn({ id: "c3", routine_id: "r1", date: "2026-03-05", completed: true }),
      makeCheckIn({ id: "c4", routine_id: "r1", date: "2026-03-01", completed: true }), // outside week
    ];

    const result = buildIdentitiesWithDetails(identities, links, routines, checkIns);
    // votes_this_week counts check-ins from the first of the last 7 days onward
    expect(result[0].votes_this_week).toBe(3);
  });

  it("builds vote_history for last 7 days", () => {
    const identities = [makeIdentity({ id: "i1" })];
    const links = [makeIdentityHabit({ identity_id: "i1", routine_id: "r1" })];
    const routines = [makeRoutine({ id: "r1" })];
    const checkIns = [
      makeCheckIn({ id: "c1", routine_id: "r1", date: "2026-03-11", completed: true }),
      makeCheckIn({ id: "c2", routine_id: "r1", date: "2026-03-09", completed: true }),
    ];

    const result = buildIdentitiesWithDetails(identities, links, routines, checkIns);
    expect(result[0].vote_history).toHaveLength(7);

    // Today should have 1 vote
    const todayEntry = result[0].vote_history.find((d) => d.date === "2026-03-11");
    expect(todayEntry?.count).toBe(1);

    // March 9 should have 1 vote
    const mar9Entry = result[0].vote_history.find((d) => d.date === "2026-03-09");
    expect(mar9Entry?.count).toBe(1);

    // Other days should be 0
    const mar10Entry = result[0].vote_history.find((d) => d.date === "2026-03-10");
    expect(mar10Entry?.count).toBe(0);
  });

  it("handles identity with no linked routines", () => {
    const identities = [makeIdentity({ id: "i1" })];
    const links: IdentityHabit[] = [];
    const routines = [makeRoutine({ id: "r1" })];
    const checkIns = [
      makeCheckIn({ id: "c1", routine_id: "r1", date: "2026-03-11", completed: true }),
    ];

    const result = buildIdentitiesWithDetails(identities, links, routines, checkIns);
    expect(result[0].linked_routines).toHaveLength(0);
    expect(result[0].total_votes).toBe(0);
    expect(result[0].votes_today).toBe(0);
  });

  it("handles multiple identities independently", () => {
    const identities = [
      makeIdentity({ id: "i1", statement: "I am a reader" }),
      makeIdentity({ id: "i2", statement: "I am fit" }),
    ];
    const links = [
      makeIdentityHabit({ id: "ih1", identity_id: "i1", routine_id: "r1" }),
      makeIdentityHabit({ id: "ih2", identity_id: "i2", routine_id: "r2" }),
    ];
    const routines = [
      makeRoutine({ id: "r1", name: "Read" }),
      makeRoutine({ id: "r2", name: "Exercise" }),
    ];
    const checkIns = [
      makeCheckIn({ id: "c1", routine_id: "r1", date: "2026-03-11", completed: true }),
    ];

    const result = buildIdentitiesWithDetails(identities, links, routines, checkIns);
    expect(result[0].total_votes).toBe(1); // reader has a vote
    expect(result[1].total_votes).toBe(0); // fit has no vote
  });

  it("skips archived/missing routines in linked_routines", () => {
    const identities = [makeIdentity({ id: "i1" })];
    const links = [
      makeIdentityHabit({ id: "ih1", identity_id: "i1", routine_id: "r1" }),
      makeIdentityHabit({ id: "ih2", identity_id: "i1", routine_id: "r_missing" }),
    ];
    const routines = [makeRoutine({ id: "r1", name: "Read" })];
    const checkIns: CheckIn[] = [];

    const result = buildIdentitiesWithDetails(identities, links, routines, checkIns);
    expect(result[0].linked_routines).toHaveLength(1);
    expect(result[0].linked_routines[0].name).toBe("Read");
  });
});
