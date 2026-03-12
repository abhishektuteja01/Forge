import type { Profile, Routine, CheckIn, HabitStack } from "./database";

/** Partnership status progression: pending → active or declined */
export type PartnershipStatus = "pending" | "active" | "declined";

/** Raw partnership row from the database */
export interface Partnership {
  id: string;
  requester_id: string;
  partner_id: string | null;
  invite_token: string;
  invite_email: string | null;
  status: PartnershipStatus;
  created_at: string;
  updated_at: string;
}

/** Partnership enriched with the partner's profile info */
export interface PartnershipWithProfile extends Partnership {
  partner_profile: Pick<Profile, "id" | "display_name">;
}

/** Nudge row from the database */
export interface Nudge {
  id: string;
  partnership_id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  read: boolean;
  created_at: string;
}

/** Predefined nudge messages — no free-text to keep it simple */
export const NUDGE_MESSAGES = [
  "Keep going! 💪",
  "Don't break the chain! 🔥",
  "Your future self will thank you 🙌",
  "Just one small step today ✨",
  "I believe in you! 🌟",
] as const;

export type NudgeMessage = (typeof NUDGE_MESSAGES)[number];

/** What the partner sees — read-only snapshot of another user's data */
export interface PartnerSnapshot {
  profile: Pick<Profile, "id" | "display_name">;
  routines: Routine[];
  checkIns: CheckIn[];
  stacks: HabitStack[];
  currentStreak: number;
  longestStreak: number;
  completionRateThisWeek: number;
}
