"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import type {
  Identity,
  IdentityHabit,
  Routine,
  CheckIn,
} from "@/types/database";
import type { IdentityWithDetails, DailyVoteCount } from "@/types/identity";

interface UseIdentitiesReturn {
  identities: IdentityWithDetails[];
  routines: Routine[];
  loading: boolean;
  error: string | null;
  addIdentity: (statement: string, routineIds: string[]) => Promise<void>;
  updateIdentity: (id: string, statement: string) => Promise<void>;
  deleteIdentity: (id: string) => Promise<void>;
  updateLinks: (identityId: string, newRoutineIds: string[]) => Promise<void>;
  refreshIdentities: () => Promise<void>;
}

/** Get YYYY-MM-DD for today in local timezone */
export function getLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Get an array of YYYY-MM-DD strings for the last 7 days (today inclusive) */
export function getLast7Days(): string[] {
  const days: string[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    days.push(getLocalDateString(d));
  }
  return days;
}

/**
 * Compute enriched identity data by joining identities, identity_habits,
 * routines, and check_ins in JavaScript.
 */
export function buildIdentitiesWithDetails(
  rawIdentities: Identity[],
  identityHabits: IdentityHabit[],
  routines: Routine[],
  checkIns: CheckIn[]
): IdentityWithDetails[] {
  const routineMap = new Map<string, Routine>();
  routines.forEach((r) => routineMap.set(r.id, r));

  // Group identity_habits by identity_id
  const linksByIdentity = new Map<string, IdentityHabit[]>();
  identityHabits.forEach((ih) => {
    const existing = linksByIdentity.get(ih.identity_id) ?? [];
    existing.push(ih);
    linksByIdentity.set(ih.identity_id, existing);
  });

  // Build a lookup: routine_id → completed check-in dates
  // Only include completed check-ins
  const completedByRoutine = new Map<string, Set<string>>();
  checkIns.forEach((ci) => {
    if (!ci.completed) return;
    const existing = completedByRoutine.get(ci.routine_id) ?? new Set();
    existing.add(ci.date);
    completedByRoutine.set(ci.routine_id, existing);
  });

  const today = getLocalDateString(new Date());
  const last7Days = getLast7Days();
  const weekStart = last7Days[0];

  return rawIdentities.map((identity) => {
    const links = linksByIdentity.get(identity.id) ?? [];
    const linkedRoutineIds = links.map((l) => l.routine_id);

    // Resolve linked routines (skip archived/deleted ones)
    const linked_routines = linkedRoutineIds
      .map((id) => routineMap.get(id))
      .filter((r): r is Routine => r !== undefined);

    // Compute votes
    let total_votes = 0;
    let votes_this_week = 0;
    let votes_today = 0;

    // Track votes per date for history
    const votesByDate = new Map<string, number>();
    last7Days.forEach((d) => votesByDate.set(d, 0));

    linkedRoutineIds.forEach((routineId) => {
      const completedDates = completedByRoutine.get(routineId);
      if (!completedDates) return;

      completedDates.forEach((date) => {
        total_votes++;

        if (date === today) {
          votes_today++;
        }

        if (date >= weekStart) {
          votes_this_week++;
        }

        // Track in the 7-day history
        const current = votesByDate.get(date);
        if (current !== undefined) {
          votesByDate.set(date, current + 1);
        }
      });
    });

    // Build vote history array (ordered, last 7 days)
    const vote_history: DailyVoteCount[] = last7Days.map((date) => ({
      date,
      count: votesByDate.get(date) ?? 0,
    }));

    return {
      ...identity,
      linked_routines,
      total_votes,
      votes_this_week,
      votes_today,
      vote_history,
    };
  });
}

export function useIdentities(): UseIdentitiesReturn {
  const [rawIdentities, setRawIdentities] = useState<Identity[]>([]);
  const [identityHabits, setIdentityHabits] = useState<IdentityHabit[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setRawIdentities([]);
        setIdentityHabits([]);
        setRoutines([]);
        setCheckIns([]);
        return;
      }

      // Fetch all four tables in parallel
      const [identitiesRes, linksRes, routinesRes, checkInsRes] =
        await Promise.all([
          supabase
            .from("identities")
            .select("*")
            .eq("user_id", user.id)
            .is("archived_at", null)
            .order("created_at", { ascending: true }),
          supabase.from("identity_habits").select("*").eq("user_id", user.id),
          supabase
            .from("routines")
            .select("*")
            .eq("user_id", user.id)
            .is("archived_at", null),
          supabase
            .from("check_ins")
            .select("*")
            .eq("user_id", user.id)
            .eq("completed", true),
        ]);

      if (identitiesRes.error) throw identitiesRes.error;
      if (linksRes.error) throw linksRes.error;
      if (routinesRes.error) throw routinesRes.error;
      if (checkInsRes.error) throw checkInsRes.error;

      setRawIdentities(identitiesRes.data ?? []);
      setIdentityHabits(linksRes.data ?? []);
      setRoutines(routinesRes.data ?? []);
      setCheckIns(checkInsRes.data ?? []);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch identities";
      const isConnectionIssue =
        message.includes("URL") ||
        message.includes("API key") ||
        message.includes("fetch");

      if (isConnectionIssue) {
        console.warn(
          "useIdentities: Supabase not configured, showing empty state"
        );
        setRawIdentities([]);
        setIdentityHabits([]);
        setRoutines([]);
        setCheckIns([]);
      } else {
        setError(message);
        console.error("useIdentities fetch error:", err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Derive enriched identities from raw state
  const identities = useMemo(
    () =>
      buildIdentitiesWithDetails(
        rawIdentities,
        identityHabits,
        routines,
        checkIns
      ),
    [rawIdentities, identityHabits, routines, checkIns]
  );

  const addIdentity = useCallback(
    async (statement: string, routineIds: string[]) => {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      // Insert the identity and get its ID
      const { data: newIdentity, error: identityError } = await supabase
        .from("identities")
        .insert({
          user_id: user.id,
          statement: statement.trim(),
        })
        .select("id")
        .single();

      if (identityError) throw identityError;
      if (!newIdentity) throw new Error("Failed to create identity");

      // Bulk-insert the links if any routines were selected
      if (routineIds.length > 0) {
        const links = routineIds.map((routineId) => ({
          identity_id: newIdentity.id,
          routine_id: routineId,
          user_id: user.id,
        }));

        const { error: linksError } = await supabase
          .from("identity_habits")
          .insert(links);

        if (linksError) throw linksError;
      }

      await fetchAll();
    },
    [fetchAll]
  );

  const updateIdentity = useCallback(
    async (id: string, statement: string) => {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      const { error: updateError } = await supabase
        .from("identities")
        .update({ statement: statement.trim() })
        .eq("id", id)
        .eq("user_id", user.id);

      if (updateError) throw updateError;
      await fetchAll();
    },
    [fetchAll]
  );

  const deleteIdentity = useCallback(
    async (id: string) => {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      // Soft-delete
      const { error: deleteError } = await supabase
        .from("identities")
        .update({ archived_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", user.id);

      if (deleteError) throw deleteError;
      await fetchAll();
    },
    [fetchAll]
  );

  const updateLinks = useCallback(
    async (identityId: string, newRoutineIds: string[]) => {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      // Find current links for this identity
      const currentLinks = identityHabits.filter(
        (ih) => ih.identity_id === identityId
      );
      const currentRoutineIds = new Set(currentLinks.map((l) => l.routine_id));
      const newRoutineIdSet = new Set(newRoutineIds);

      // Determine additions and removals
      const toAdd = newRoutineIds.filter((id) => !currentRoutineIds.has(id));
      const toRemove = currentLinks.filter(
        (l) => !newRoutineIdSet.has(l.routine_id)
      );

      // Add new links
      if (toAdd.length > 0) {
        const links = toAdd.map((routineId) => ({
          identity_id: identityId,
          routine_id: routineId,
          user_id: user.id,
        }));

        const { error: addError } = await supabase
          .from("identity_habits")
          .insert(links);

        if (addError) throw addError;
      }

      // Remove old links
      if (toRemove.length > 0) {
        const removeIds = toRemove.map((l) => l.id);

        const { error: removeError } = await supabase
          .from("identity_habits")
          .delete()
          .in("id", removeIds)
          .eq("user_id", user.id);

        if (removeError) throw removeError;
      }

      await fetchAll();
    },
    [identityHabits, fetchAll]
  );

  return {
    identities,
    routines,
    loading,
    error,
    addIdentity,
    updateIdentity,
    deleteIdentity,
    updateLinks,
    refreshIdentities: fetchAll,
  };
}
