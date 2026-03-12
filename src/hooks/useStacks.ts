"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import type { HabitStack, Routine } from "@/types/database";
import type { StackWithRoutines, StackChain } from "@/types/stacks";
import type { StackData } from "@/lib/validators/stack";

interface UseStacksReturn {
  stacks: StackWithRoutines[];
  chains: StackChain[];
  routines: Routine[];
  loading: boolean;
  error: string | null;
  addStack: (data: StackData) => Promise<void>;
  deleteStack: (id: string) => Promise<void>;
  refreshStacks: () => Promise<void>;
}

/**
 * Build enriched stacks by joining raw habit_stacks with routines in JS.
 * Safer than relying on Supabase PostgREST multi-FK joins.
 */
export function buildStacksWithRoutines(
  rawStacks: HabitStack[],
  routines: Routine[]
): StackWithRoutines[] {
  const routineMap = new Map<string, Routine>();
  routines.forEach((r) => routineMap.set(r.id, r));

  const enriched: StackWithRoutines[] = [];

  rawStacks.forEach((stack) => {
    const anchor = routineMap.get(stack.anchor_routine_id);
    const stacked = routineMap.get(stack.stacked_routine_id);

    // Skip stacks where either routine has been archived/deleted
    if (!anchor || !stacked) return;

    enriched.push({
      ...stack,
      anchor_routine: anchor,
      stacked_routine: stacked,
    });
  });

  return enriched;
}

/**
 * Group enriched stacks into chains by anchor_routine_id.
 * Each chain has one anchor and one or more ordered steps.
 */
export function buildChains(stacks: StackWithRoutines[]): StackChain[] {
  const chainMap = new Map<
    string,
    { anchor: Routine; steps: { stack: HabitStack; routine: Routine }[] }
  >();

  stacks.forEach((s) => {
    const anchorId = s.anchor_routine_id;
    const existing = chainMap.get(anchorId);

    if (existing) {
      existing.steps.push({ stack: s, routine: s.stacked_routine });
    } else {
      chainMap.set(anchorId, {
        anchor: s.anchor_routine,
        steps: [{ stack: s, routine: s.stacked_routine }],
      });
    }
  });

  // Sort steps within each chain by position
  const chains: StackChain[] = [];
  chainMap.forEach((chain) => {
    chain.steps.sort((a, b) => a.stack.position - b.stack.position);
    chains.push(chain);
  });

  return chains;
}

export function useStacks(): UseStacksReturn {
  const [rawStacks, setRawStacks] = useState<HabitStack[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStacks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setRawStacks([]);
        setRoutines([]);
        return;
      }

      // Fetch stacks and routines in parallel
      const [stacksResult, routinesResult] = await Promise.all([
        supabase
          .from("habit_stacks")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true }),
        supabase
          .from("routines")
          .select("*")
          .eq("user_id", user.id)
          .is("archived_at", null),
      ]);

      if (stacksResult.error) throw stacksResult.error;
      if (routinesResult.error) throw routinesResult.error;

      setRawStacks(stacksResult.data ?? []);
      setRoutines(routinesResult.data ?? []);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch stacks";
      const isConnectionIssue =
        message.includes("URL") ||
        message.includes("API key") ||
        message.includes("fetch");

      if (isConnectionIssue) {
        console.warn("useStacks: Supabase not configured, showing empty state");
        setRawStacks([]);
        setRoutines([]);
      } else {
        setError(message);
        console.error("useStacks fetch error:", err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStacks();
  }, [fetchStacks]);

  // Derive enriched data from raw state
  const stacks = useMemo(
    () => buildStacksWithRoutines(rawStacks, routines),
    [rawStacks, routines]
  );

  const chains = useMemo(() => buildChains(stacks), [stacks]);

  const addStack = useCallback(
    async (data: StackData) => {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      // Auto-calculate position: count existing stacks with this anchor
      const existingForAnchor = rawStacks.filter(
        (s) => s.anchor_routine_id === data.anchor_routine_id
      );
      const position = data.position ?? existingForAnchor.length;

      const { error: insertError } = await supabase
        .from("habit_stacks")
        .insert({
          user_id: user.id,
          anchor_routine_id: data.anchor_routine_id,
          stacked_routine_id: data.stacked_routine_id,
          position,
        });

      if (insertError) throw insertError;
      await fetchStacks();
    },
    [rawStacks, fetchStacks]
  );

  const deleteStack = useCallback(
    async (id: string) => {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      // Hard delete — habit_stacks has no archived_at
      const { error: deleteError } = await supabase
        .from("habit_stacks")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (deleteError) throw deleteError;
      await fetchStacks();
    },
    [fetchStacks]
  );

  return {
    stacks,
    chains,
    routines,
    loading,
    error,
    addStack,
    deleteStack,
    refreshStacks: fetchStacks,
  };
}
