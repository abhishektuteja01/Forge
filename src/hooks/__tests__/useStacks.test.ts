import { describe, it, expect } from "vitest";
import {
  buildStacksWithRoutines,
  buildChains,
} from "../useStacks";
import type { HabitStack, Routine } from "@/types/database";

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

function makeStack(overrides: Partial<HabitStack> = {}): HabitStack {
  return {
    id: "s1",
    user_id: "u1",
    anchor_routine_id: "r1",
    stacked_routine_id: "r2",
    position: 0,
    created_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

// ─── buildStacksWithRoutines ─────────────────────────────

describe("buildStacksWithRoutines", () => {
  it("enriches raw stacks with routine data", () => {
    const routines = [
      makeRoutine({ id: "r1", name: "Coffee" }),
      makeRoutine({ id: "r2", name: "Journal" }),
    ];
    const stacks = [makeStack({ id: "s1", anchor_routine_id: "r1", stacked_routine_id: "r2" })];

    const result = buildStacksWithRoutines(stacks, routines);

    expect(result).toHaveLength(1);
    expect(result[0].anchor_routine.name).toBe("Coffee");
    expect(result[0].stacked_routine.name).toBe("Journal");
  });

  it("skips stacks where anchor routine is missing", () => {
    const routines = [makeRoutine({ id: "r2", name: "Journal" })];
    const stacks = [makeStack({ anchor_routine_id: "r1", stacked_routine_id: "r2" })];

    const result = buildStacksWithRoutines(stacks, routines);
    expect(result).toHaveLength(0);
  });

  it("skips stacks where stacked routine is missing", () => {
    const routines = [makeRoutine({ id: "r1", name: "Coffee" })];
    const stacks = [makeStack({ anchor_routine_id: "r1", stacked_routine_id: "r2" })];

    const result = buildStacksWithRoutines(stacks, routines);
    expect(result).toHaveLength(0);
  });

  it("returns empty array when stacks are empty", () => {
    const routines = [makeRoutine({ id: "r1" })];
    const result = buildStacksWithRoutines([], routines);
    expect(result).toHaveLength(0);
  });

  it("returns empty array when routines are empty", () => {
    const stacks = [makeStack()];
    const result = buildStacksWithRoutines(stacks, []);
    expect(result).toHaveLength(0);
  });

  it("handles multiple stacks correctly", () => {
    const routines = [
      makeRoutine({ id: "r1", name: "Coffee" }),
      makeRoutine({ id: "r2", name: "Journal" }),
      makeRoutine({ id: "r3", name: "Stretch" }),
    ];
    const stacks = [
      makeStack({ id: "s1", anchor_routine_id: "r1", stacked_routine_id: "r2", position: 0 }),
      makeStack({ id: "s2", anchor_routine_id: "r1", stacked_routine_id: "r3", position: 1 }),
    ];

    const result = buildStacksWithRoutines(stacks, routines);
    expect(result).toHaveLength(2);
    expect(result[0].stacked_routine.name).toBe("Journal");
    expect(result[1].stacked_routine.name).toBe("Stretch");
  });
});

// ─── buildChains ─────────────────────────────────────────

describe("buildChains", () => {
  it("groups stacks by anchor into a single chain", () => {
    const routines = [
      makeRoutine({ id: "r1", name: "Coffee" }),
      makeRoutine({ id: "r2", name: "Journal" }),
      makeRoutine({ id: "r3", name: "Stretch" }),
    ];
    const stacks = [
      makeStack({ id: "s1", anchor_routine_id: "r1", stacked_routine_id: "r2", position: 0 }),
      makeStack({ id: "s2", anchor_routine_id: "r1", stacked_routine_id: "r3", position: 1 }),
    ];
    const enriched = buildStacksWithRoutines(stacks, routines);
    const chains = buildChains(enriched);

    expect(chains).toHaveLength(1);
    expect(chains[0].anchor.name).toBe("Coffee");
    expect(chains[0].steps).toHaveLength(2);
    expect(chains[0].steps[0].routine.name).toBe("Journal");
    expect(chains[0].steps[1].routine.name).toBe("Stretch");
  });

  it("sorts steps within a chain by position", () => {
    const routines = [
      makeRoutine({ id: "r1", name: "Coffee" }),
      makeRoutine({ id: "r2", name: "Journal" }),
      makeRoutine({ id: "r3", name: "Stretch" }),
    ];
    // Insert in reverse position order
    const stacks = [
      makeStack({ id: "s2", anchor_routine_id: "r1", stacked_routine_id: "r3", position: 1 }),
      makeStack({ id: "s1", anchor_routine_id: "r1", stacked_routine_id: "r2", position: 0 }),
    ];
    const enriched = buildStacksWithRoutines(stacks, routines);
    const chains = buildChains(enriched);

    expect(chains[0].steps[0].routine.name).toBe("Journal");
    expect(chains[0].steps[1].routine.name).toBe("Stretch");
  });

  it("creates separate chains for different anchors", () => {
    const routines = [
      makeRoutine({ id: "r1", name: "Coffee" }),
      makeRoutine({ id: "r2", name: "Journal" }),
      makeRoutine({ id: "r3", name: "Lunch" }),
      makeRoutine({ id: "r4", name: "Walk" }),
    ];
    const stacks = [
      makeStack({ id: "s1", anchor_routine_id: "r1", stacked_routine_id: "r2", position: 0 }),
      makeStack({ id: "s2", anchor_routine_id: "r3", stacked_routine_id: "r4", position: 0 }),
    ];
    const enriched = buildStacksWithRoutines(stacks, routines);
    const chains = buildChains(enriched);

    expect(chains).toHaveLength(2);
  });

  it("handles single-step chain", () => {
    const routines = [
      makeRoutine({ id: "r1", name: "Coffee" }),
      makeRoutine({ id: "r2", name: "Journal" }),
    ];
    const stacks = [
      makeStack({ id: "s1", anchor_routine_id: "r1", stacked_routine_id: "r2", position: 0 }),
    ];
    const enriched = buildStacksWithRoutines(stacks, routines);
    const chains = buildChains(enriched);

    expect(chains).toHaveLength(1);
    expect(chains[0].steps).toHaveLength(1);
  });

  it("returns empty array for empty input", () => {
    const chains = buildChains([]);
    expect(chains).toHaveLength(0);
  });
});
