import type { Identity, Routine } from "./database";

/** A single day's vote count for the weekly history view */
export interface DailyVoteCount {
  date: string; // YYYY-MM-DD
  count: number;
}

/**
 * An identity enriched with linked routines and computed vote data.
 * Votes are computed — not stored — by joining check_ins with
 * identity_habits where completed = true.
 */
export interface IdentityWithDetails extends Identity {
  linked_routines: Routine[];
  total_votes: number;
  votes_this_week: number;
  votes_today: number;
  vote_history: DailyVoteCount[];
}
