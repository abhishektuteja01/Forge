import { describe, it, expect } from "vitest";
import { buildStacksWithRoutines, buildChains } from "../useStacks";
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

// ─── Tests ───────────────────────────────────────────────

describe("useStacks Logic", () => {
  describe("buildStacksWithRoutines", () => {
    it("joins stacks with routines correctly", () => {
      const routines = [
        makeRoutine({ id: "r1", name: "Anchor" }),
        makeRoutine({ id: "r2", name: "Stacked" }),
      ];
      const stacks = [
        makeStack({ anchor_routine_id: "r1", stacked_routine_id: "r2" }),
      ];

      const result = buildStacksWithRoutines(stacks, routines);
      expect(result).toHaveLength(1);
      expect(result[0].anchor_routine.name).toBe("Anchor");
      expect(result[0].stacked_routine.name).toBe("Stacked");
    });

    it("skips stacks with missing routines (archived/deleted)", () => {
      const routines = [makeRoutine({ id: "r1", name: "Anchor" })];
      const stacks = [
        makeStack({ anchor_routine_id: "r1", stacked_routine_id: "r_missing" }),
      ];

      const result = buildStacksWithRoutines(stacks, routines);
      expect(result).toHaveLength(0);
    });

    it("handles multiple stacks", () => {
      const routines = [
        makeRoutine({ id: "r1" }),
        makeRoutine({ id: "r2" }),
        makeRoutine({ id: "r3" }),
      ];
      const stacks = [
        makeStack({
          id: "s1",
          anchor_routine_id: "r1",
          stacked_routine_id: "r2",
        }),
        makeStack({
          id: "s2",
          anchor_routine_id: "r1",
          stacked_routine_id: "r3",
        }),
      ];

      const result = buildStacksWithRoutines(stacks, routines);
      expect(result).toHaveLength(2);
    });
  });

  describe("buildChains", () => {
    it("groups stacks into chains by anchor", () => {
      const routines = [
        makeRoutine({ id: "r1", name: "A1" }),
        makeRoutine({ id: "r2", name: "S1" }),
        makeRoutine({ id: "r3", name: "S2" }),
      ];
      const rawStacks = [
        makeStack({
          id: "s1",
          anchor_routine_id: "r1",
          stacked_routine_id: "r2",
          position: 1,
        }),
        makeStack({
          id: "s2",
          anchor_routine_id: "r1",
          stacked_routine_id: "r3",
          position: 0,
        }),
      ];

      const enriched = buildStacksWithRoutines(rawStacks, routines);
      const result = buildChains(enriched);

      expect(result).toHaveLength(1);
      expect(result[0].anchor.id).toBe("r1");
      expect(result[0].steps).toHaveLength(2);
      // Verify sort order by position
      expect(result[0].steps[0].routine.id).toBe("r3"); // position 0
      expect(result[0].steps[1].routine.id).toBe("r2"); // position 1
    });

    it("handles multiple independent chains", () => {
      const routines = [
        makeRoutine({ id: "r1" }),
        makeRoutine({ id: "r2" }),
        makeRoutine({ id: "r3" }),
        makeRoutine({ id: "r4" }),
      ];
      const rawStacks = [
        makeStack({
          id: "s1",
          anchor_routine_id: "r1",
          stacked_routine_id: "r2",
        }),
        makeStack({
          id: "s2",
          anchor_routine_id: "r3",
          stacked_routine_id: "r4",
        }),
      ];

      const enriched = buildStacksWithRoutines(rawStacks, routines);
      const result = buildChains(enriched);

      expect(result).toHaveLength(2);
    });
  });
});
