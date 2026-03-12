import { Tag, TimeOfDay } from "./common";
import type { PartnershipStatus } from "./partners";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string; // uuid
          display_name: string | null;
          onboarding_complete: boolean;
          created_at: string; // timestamptz
          updated_at: string; // timestamptz
        };
        Insert: {
          id: string;
          display_name?: string | null;
          onboarding_complete?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          onboarding_complete?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      routines: {
        Row: {
          id: string; // uuid
          user_id: string; // uuid
          name: string;
          tag: Tag;
          time_of_day: TimeOfDay | null;
          sort_order: number;
          archived_at: string | null; // timestamptz
          created_at: string; // timestamptz
          updated_at: string; // timestamptz
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          tag: Tag;
          time_of_day?: TimeOfDay | null;
          sort_order?: number;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          tag?: Tag;
          time_of_day?: TimeOfDay | null;
          sort_order?: number;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      check_ins: {
        Row: {
          id: string; // uuid
          user_id: string; // uuid
          routine_id: string; // uuid
          date: string; // date
          completed: boolean;
          created_at: string; // timestamptz
          updated_at: string; // timestamptz
        };
        Insert: {
          id?: string;
          user_id: string;
          routine_id: string;
          date: string;
          completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          routine_id?: string;
          date?: string;
          completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      habit_stacks: {
        Row: {
          id: string; // uuid
          user_id: string; // uuid
          anchor_routine_id: string; // uuid
          stacked_routine_id: string; // uuid
          position: number;
          created_at: string; // timestamptz
        };
        Insert: {
          id?: string;
          user_id: string;
          anchor_routine_id: string;
          stacked_routine_id: string;
          position?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          anchor_routine_id?: string;
          stacked_routine_id?: string;
          position?: number;
          created_at?: string;
        };
      };
      identities: {
        Row: {
          id: string; // uuid
          user_id: string; // uuid
          statement: string;
          archived_at: string | null; // timestamptz
          created_at: string; // timestamptz
          updated_at: string; // timestamptz
        };
        Insert: {
          id?: string;
          user_id: string;
          statement: string;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          statement?: string;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      identity_habits: {
        Row: {
          id: string; // uuid
          identity_id: string; // uuid
          routine_id: string; // uuid
          user_id: string; // uuid
        };
        Insert: {
          id?: string;
          identity_id: string;
          routine_id: string;
          user_id: string;
        };
        Update: {
          id?: string;
          identity_id?: string;
          routine_id?: string;
          user_id?: string;
        };
      };
      partnerships: {
        Row: {
          id: string; // uuid
          requester_id: string; // uuid
          partner_id: string | null; // uuid, null while pending
          invite_token: string;
          invite_email: string | null;
          status: PartnershipStatus;
          created_at: string; // timestamptz
          updated_at: string; // timestamptz
        };
        Insert: {
          id?: string;
          requester_id: string;
          partner_id?: string | null;
          invite_token: string;
          invite_email?: string | null;
          status?: PartnershipStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          requester_id?: string;
          partner_id?: string | null;
          invite_token?: string;
          invite_email?: string | null;
          status?: PartnershipStatus;
          created_at?: string;
          updated_at?: string;
        };
      };
      nudges: {
        Row: {
          id: string; // uuid
          partnership_id: string; // uuid
          sender_id: string; // uuid
          receiver_id: string; // uuid
          message: string;
          read: boolean;
          created_at: string; // timestamptz
        };
        Insert: {
          id?: string;
          partnership_id: string;
          sender_id: string;
          receiver_id: string;
          message?: string;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          partnership_id?: string;
          sender_id?: string;
          receiver_id?: string;
          message?: string;
          read?: boolean;
          created_at?: string;
        };
      };
    };
  };
}

// Convenience Type Aliases
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Routine = Database["public"]["Tables"]["routines"]["Row"];
export type CheckIn = Database["public"]["Tables"]["check_ins"]["Row"];
export type HabitStack = Database["public"]["Tables"]["habit_stacks"]["Row"];
export type Identity = Database["public"]["Tables"]["identities"]["Row"];
export type IdentityHabit =
  Database["public"]["Tables"]["identity_habits"]["Row"];
export type PartnershipRow =
  Database["public"]["Tables"]["partnerships"]["Row"];
export type NudgeRow = Database["public"]["Tables"]["nudges"]["Row"];
