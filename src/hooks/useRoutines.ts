"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { routineSchema, type RoutineData } from "@/lib/validators/routine";
import type { Routine } from "@/types/database";

interface UseRoutinesReturn {
  routines: Routine[];
  loading: boolean;
  error: string | null;
  addRoutine: (data: RoutineData) => Promise<void>;
  updateRoutine: (id: string, data: Partial<RoutineData>) => Promise<void>;
  deleteRoutine: (id: string) => Promise<void>;
  refreshRoutines: () => Promise<void>;
}

export function useRoutines(): UseRoutinesReturn {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoutines = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setRoutines([]);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("routines")
        .select("*")
        .eq("user_id", user.id)
        .is("archived_at", null)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });

      if (fetchError) throw fetchError;
      setRoutines(data ?? []);
    } catch (err) {
      // If Supabase isn't configured or user isn't authenticated,
      // gracefully show empty state instead of an error
      const message =
        err instanceof Error ? err.message : "Failed to fetch routines";
      const isConnectionIssue =
        message.includes("URL") ||
        message.includes("API key") ||
        message.includes("fetch");

      if (isConnectionIssue) {
        console.warn(
          "useRoutines: Supabase not configured, showing empty state"
        );
        setRoutines([]);
      } else {
        setError(message);
        console.error("useRoutines fetch error:", err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoutines();
  }, [fetchRoutines]);

  const addRoutine = useCallback(
    async (data: RoutineData) => {
      const parsed = routineSchema.parse(data);
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      const { error: insertError } = await supabase.from("routines").insert({
        user_id: user.id,
        name: parsed.name,
        tag: parsed.tag,
        time_of_day: parsed.time_of_day ?? null,
        sort_order: routines.length,
      });

      if (insertError) throw insertError;
      await fetchRoutines();
    },
    [routines.length, fetchRoutines]
  );

  const updateRoutine = useCallback(
    async (id: string, data: Partial<RoutineData>) => {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      const updatePayload: Record<string, unknown> = {};
      if (data.name !== undefined) updatePayload.name = data.name.trim();
      if (data.tag !== undefined) updatePayload.tag = data.tag;
      if (data.time_of_day !== undefined)
        updatePayload.time_of_day = data.time_of_day;

      const { error: updateError } = await supabase
        .from("routines")
        .update(updatePayload)
        .eq("id", id)
        .eq("user_id", user.id);

      if (updateError) throw updateError;
      await fetchRoutines();
    },
    [fetchRoutines]
  );

  const deleteRoutine = useCallback(
    async (id: string) => {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      const { error: deleteError } = await supabase
        .from("routines")
        .update({ archived_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", user.id);

      if (deleteError) throw deleteError;
      await fetchRoutines();
    },
    [fetchRoutines]
  );

  return {
    routines,
    loading,
    error,
    addRoutine,
    updateRoutine,
    deleteRoutine,
    refreshRoutines: fetchRoutines,
  };
}
