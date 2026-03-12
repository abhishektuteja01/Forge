"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile, Routine, CheckIn, HabitStack } from "@/types/database";
import type {
  Partnership,
  PartnershipWithProfile,
  Nudge,
  PartnerSnapshot,
} from "@/types/partners";

// ─── Helpers ────────────────────────────────────────────

/** YYYY-MM-DD in local timezone */
export function getLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Generate a crypto-random token for invite links */
function generateToken(): string {
  return crypto.randomUUID();
}

/** Get the start-of-week date string (Monday) for the current week */
export function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
  const monday = new Date(now);
  monday.setDate(diff);
  return getLocalDateString(monday);
}

/**
 * Compute streak data from check-ins and routines.
 * A "streak day" = at least one completed check-in on that date.
 */
export function computeStreaks(
  checkIns: CheckIn[],
  routines: Routine[]
): {
  currentStreak: number;
  longestStreak: number;
  completionRateThisWeek: number;
} {
  // Collect unique dates with at least one completed check-in
  const completedDates = new Set<string>();
  checkIns.forEach((ci) => {
    if (ci.completed) completedDates.add(ci.date);
  });

  const sortedDates = Array.from(completedDates).sort().reverse();

  // Current streak: count consecutive days backwards from today
  let currentStreak = 0;
  const cursor = new Date();

  for (let i = 0; i < 365; i++) {
    const dateStr = getLocalDateString(cursor);
    if (completedDates.has(dateStr)) {
      currentStreak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      // If today has no check-ins yet, check if yesterday starts a streak
      if (i === 0) {
        cursor.setDate(cursor.getDate() - 1);
        continue;
      }
      break;
    }
  }

  // Longest streak: walk all sorted dates forward
  let longestStreak = 0;
  let runLength = 0;
  let prevDate: Date | null = null;

  // Sort ascending for forward walk
  const ascending = Array.from(completedDates).sort();
  ascending.forEach((dateStr) => {
    const current = new Date(dateStr + "T00:00:00");
    if (prevDate) {
      const diffMs = current.getTime() - prevDate.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        runLength++;
      } else {
        runLength = 1;
      }
    } else {
      runLength = 1;
    }
    longestStreak = Math.max(longestStreak, runLength);
    prevDate = current;
  });

  // Completion rate this week: completed / (routines × days so far this week)
  const weekStart = getWeekStart();
  const today = getLocalDateString(new Date());
  const todayDate = new Date();
  const weekStartDate = new Date(weekStart + "T00:00:00");
  const daysThisWeek =
    Math.floor(
      (todayDate.getTime() - weekStartDate.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;

  const activeRoutineCount = routines.filter((r) => !r.archived_at).length;
  const maxPossible = activeRoutineCount * daysThisWeek;

  const completedThisWeek = checkIns.filter(
    (ci) => ci.completed && ci.date >= weekStart && ci.date <= today
  ).length;

  const completionRateThisWeek =
    maxPossible > 0 ? Math.round((completedThisWeek / maxPossible) * 100) : 0;

  return { currentStreak, longestStreak, completionRateThisWeek };
}

// ─── Hook Return Type ───────────────────────────────────

interface UsePartnersReturn {
  /** Active partnerships */
  partnerships: PartnershipWithProfile[];
  /** Invites sent TO the current user (pending, awaiting accept/decline) */
  pendingInvites: PartnershipWithProfile[];
  /** Invites sent BY the current user that haven't been accepted yet */
  sentInvites: Partnership[];
  /** Unread nudge count */
  unreadNudgeCount: number;
  /** Recent nudges for the current user */
  nudges: Nudge[];
  loading: boolean;
  error: string | null;

  /** Create an invite link. Returns the full URL to share. */
  generateInviteLink: () => Promise<string>;
  /** Accept a pending invite */
  acceptInvite: (partnershipId: string) => Promise<void>;
  /** Decline a pending invite */
  declineInvite: (partnershipId: string) => Promise<void>;
  /** Remove an active partnership (hard delete) */
  removePartner: (partnershipId: string) => Promise<void>;
  /** Send a nudge to a partner */
  sendNudge: (
    partnershipId: string,
    receiverId: string,
    message: string
  ) => Promise<void>;
  /** Mark all unread nudges as read */
  markNudgesRead: () => Promise<void>;
  /** Fetch a read-only snapshot of a partner's data */
  fetchPartnerSnapshot: (partnerUserId: string) => Promise<PartnerSnapshot>;
  /** Re-fetch all partnership data */
  refreshPartners: () => Promise<void>;
}

// ─── Hook ───────────────────────────────────────────────

export function usePartners(): UsePartnersReturn {
  const [rawPartnerships, setRawPartnerships] = useState<Partnership[]>([]);
  const [partnerProfiles, setPartnerProfiles] = useState<
    Map<string, Pick<Profile, "id" | "display_name">>
  >(new Map());
  const [nudges, setNudges] = useState<Nudge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // ─── Fetch All ──────────────────────────────────────

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setRawPartnerships([]);
        setNudges([]);
        return;
      }

      setUserId(user.id);

      // Fetch partnerships and nudges in parallel
      const [partnershipsRes, nudgesRes] = await Promise.all([
        supabase
          .from("partnerships")
          .select("*")
          .or(`requester_id.eq.${user.id},partner_id.eq.${user.id}`)
          .neq("status", "declined")
          .order("created_at", { ascending: false }),
        supabase
          .from("nudges")
          .select("*")
          .eq("receiver_id", user.id)
          .order("created_at", { ascending: false })
          .limit(50),
      ]);

      if (partnershipsRes.error) throw partnershipsRes.error;
      if (nudgesRes.error) throw nudgesRes.error;

      const partnerships = (partnershipsRes.data ?? []) as Partnership[];
      setRawPartnerships(partnerships);
      setNudges((nudgesRes.data ?? []) as Nudge[]);

      // Collect unique partner user IDs to fetch their profiles
      const partnerUserIds = new Set<string>();
      partnerships.forEach((p) => {
        if (p.requester_id !== user.id && p.requester_id) {
          partnerUserIds.add(p.requester_id);
        }
        if (p.partner_id && p.partner_id !== user.id) {
          partnerUserIds.add(p.partner_id);
        }
      });

      // Fetch partner profiles
      if (partnerUserIds.size > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, display_name")
          .in("id", Array.from(partnerUserIds));

        if (profilesError) throw profilesError;

        const profileMap = new Map<
          string,
          Pick<Profile, "id" | "display_name">
        >();
        (profiles ?? []).forEach((p) => profileMap.set(p.id, p));
        setPartnerProfiles(profileMap);
      } else {
        setPartnerProfiles(new Map());
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch partners";
      const isConnectionIssue =
        message.includes("URL") ||
        message.includes("API key") ||
        message.includes("fetch");

      if (isConnectionIssue) {
        console.warn(
          "usePartners: Supabase not configured, showing empty state"
        );
        setRawPartnerships([]);
        setNudges([]);
      } else {
        setError(message);
        console.error("usePartners fetch error:", err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ─── Derived Data ─────────────────────────────────────

  /** Active partnerships enriched with partner profiles */
  const partnerships = useMemo<PartnershipWithProfile[]>(() => {
    if (!userId) return [];

    return rawPartnerships
      .filter((p) => p.status === "active" && p.partner_id)
      .map((p) => {
        const otherUserId =
          p.requester_id === userId ? p.partner_id! : p.requester_id;
        const profile = partnerProfiles.get(otherUserId) ?? {
          id: otherUserId,
          display_name: null,
        };
        return { ...p, partner_profile: profile };
      });
  }, [rawPartnerships, partnerProfiles, userId]);

  /** Pending invites sent TO the current user */
  const pendingInvites = useMemo<PartnershipWithProfile[]>(() => {
    if (!userId) return [];

    return rawPartnerships
      .filter((p) => p.status === "pending" && p.partner_id === userId)
      .map((p) => {
        const profile = partnerProfiles.get(p.requester_id) ?? {
          id: p.requester_id,
          display_name: null,
        };
        return { ...p, partner_profile: profile };
      });
  }, [rawPartnerships, partnerProfiles, userId]);

  /** Invites sent BY the current user still waiting */
  const sentInvites = useMemo<Partnership[]>(() => {
    if (!userId) return [];
    return rawPartnerships.filter(
      (p) => p.status === "pending" && p.requester_id === userId
    );
  }, [rawPartnerships, userId]);

  /** Unread nudge count */
  const unreadNudgeCount = useMemo(
    () => nudges.filter((n) => !n.read).length,
    [nudges]
  );

  // ─── Actions ──────────────────────────────────────────

  const generateInviteLink = useCallback(async (): Promise<string> => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Not authenticated");

    const token = generateToken();

    const { error: insertError } = await supabase.from("partnerships").insert({
      requester_id: user.id,
      invite_token: token,
      status: "pending",
    });

    if (insertError) throw insertError;

    await fetchAll();
    return `${window.location.origin}/invite/${token}`;
  }, [fetchAll]);

  const acceptInvite = useCallback(
    async (partnershipId: string) => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      const { error: updateError } = await supabase
        .from("partnerships")
        .update({ partner_id: user.id, status: "active" })
        .eq("id", partnershipId);

      if (updateError) throw updateError;
      await fetchAll();
    },
    [fetchAll]
  );

  const declineInvite = useCallback(
    async (partnershipId: string) => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      const { error: updateError } = await supabase
        .from("partnerships")
        .update({ status: "declined" })
        .eq("id", partnershipId);

      if (updateError) throw updateError;
      await fetchAll();
    },
    [fetchAll]
  );

  const removePartner = useCallback(
    async (partnershipId: string) => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      const { error: deleteError } = await supabase
        .from("partnerships")
        .delete()
        .eq("id", partnershipId);

      if (deleteError) throw deleteError;
      await fetchAll();
    },
    [fetchAll]
  );

  const sendNudge = useCallback(
    async (partnershipId: string, receiverId: string, message: string) => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      const { error: insertError } = await supabase.from("nudges").insert({
        partnership_id: partnershipId,
        sender_id: user.id,
        receiver_id: receiverId,
        message,
      });

      if (insertError) throw insertError;
      // Don't need to refresh all — nudge doesn't affect partnership state
    },
    []
  );

  const markNudgesRead = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Not authenticated");

    const unreadIds = nudges.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length === 0) return;

    const { error: updateError } = await supabase
      .from("nudges")
      .update({ read: true })
      .in("id", unreadIds)
      .eq("receiver_id", user.id);

    if (updateError) throw updateError;

    // Optimistically update local state
    setNudges((prev) =>
      prev.map((n) => (unreadIds.includes(n.id) ? { ...n, read: true } : n))
    );
  }, [nudges]);

  // ─── Snapshot ─────────────────────────────────────────

  const fetchPartnerSnapshot = useCallback(
    async (partnerUserId: string): Promise<PartnerSnapshot> => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      // Verify active partnership exists
      const { data: partnership, error: partnershipError } = await supabase
        .from("partnerships")
        .select("id")
        .eq("status", "active")
        .or(
          `and(requester_id.eq.${user.id},partner_id.eq.${partnerUserId}),and(requester_id.eq.${partnerUserId},partner_id.eq.${user.id})`
        )
        .limit(1)
        .single();

      if (partnershipError || !partnership) {
        throw new Error("No active partnership found");
      }

      // Fetch partner's data in parallel — RLS partner read policies allow this
      const [profileRes, routinesRes, checkInsRes, stacksRes] =
        await Promise.all([
          supabase
            .from("profiles")
            .select("id, display_name")
            .eq("id", partnerUserId)
            .single(),
          supabase
            .from("routines")
            .select("*")
            .eq("user_id", partnerUserId)
            .is("archived_at", null)
            .order("sort_order", { ascending: true }),
          supabase.from("check_ins").select("*").eq("user_id", partnerUserId),
          supabase
            .from("habit_stacks")
            .select("*")
            .eq("user_id", partnerUserId)
            .order("created_at", { ascending: true }),
        ]);

      if (profileRes.error) throw profileRes.error;
      if (routinesRes.error) throw routinesRes.error;
      if (checkInsRes.error) throw checkInsRes.error;
      if (stacksRes.error) throw stacksRes.error;

      const routines = (routinesRes.data ?? []) as Routine[];
      const checkIns = (checkInsRes.data ?? []) as CheckIn[];

      const { currentStreak, longestStreak, completionRateThisWeek } =
        computeStreaks(checkIns, routines);

      return {
        profile: profileRes.data as Pick<Profile, "id" | "display_name">,
        routines,
        checkIns,
        stacks: (stacksRes.data ?? []) as HabitStack[],
        currentStreak,
        longestStreak,
        completionRateThisWeek,
      };
    },
    []
  );

  // ─── Return ───────────────────────────────────────────

  return {
    partnerships,
    pendingInvites,
    sentInvites,
    unreadNudgeCount,
    nudges,
    loading,
    error,
    generateInviteLink,
    acceptInvite,
    declineInvite,
    removePartner,
    sendNudge,
    markNudgesRead,
    fetchPartnerSnapshot,
    refreshPartners: fetchAll,
  };
}
