import type { HabitStack, Routine } from "./database";

/** A habit stack enriched with full routine details for both anchor and stacked */
export interface StackWithRoutines extends HabitStack {
  anchor_routine: Routine;
  stacked_routine: Routine;
}

/** A single step in a chain — the stack record plus the stacked routine details */
export interface ChainStep {
  stack: HabitStack;
  routine: Routine;
}

/**
 * A full chain starting from one anchor routine.
 * Multiple stacks sharing the same anchor_routine_id are grouped
 * into one chain, sorted by position.
 *
 * Example: "After coffee → journal → stretch"
 *   anchor = coffee routine
 *   steps = [
 *     { stack: stack_coffee_journal, routine: journal },
 *     { stack: stack_coffee_stretch, routine: stretch },
 *   ]
 */
export interface StackChain {
  anchor: Routine;
  steps: ChainStep[];
}
