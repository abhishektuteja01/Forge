"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { CheckIn } from "@/types/database";

interface UseCheckInsReturn {
  checkIns: Map<string, CheckIn>;
  loading: boolean;
  error: string | null;
  toggleCheckIn: (routineId: string) => Promise<void>;
  getCompletionStats: (totalRoutines: number) => {
    completed: number;
    total: number;
    percentage: number;
  };
  refreshCheckIns: () => Promise<void>;
}

export function useCheckIns(date: string): UseCheckInsReturn {
  const [checkIns, setCheckIns] = useState<Map<string, CheckIn>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCheckIns = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setCheckIns(new Map());
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("check_ins")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", date);

      if (fetchError) throw fetchError;

      const checkInMap = new Map<string, CheckIn>();
      (data ?? []).forEach((ci) => {
        checkInMap.set(ci.routine_id, ci);
      });
      setCheckIns(checkInMap);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch check-ins";
      const isConnectionIssue =
        message.includes("URL") ||
        message.includes("API key") ||
        message.includes("fetch");

      if (isConnectionIssue) {
        console.warn("useCheckIns: Supabase not configured, showing empty state");
        setCheckIns(new Map());
      } else {
        setError(message);
        console.error("useCheckIns fetch error:", err);
      }
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchCheckIns();
  }, [fetchCheckIns]);

  const toggleCheckIn = useCallback(
    async (routineId: string) => {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      const existing = checkIns.get(routineId);
      const newCompleted = existing ? !existing.completed : true;

      // Optimistic update
      setCheckIns((prev) => {
        const next = new Map(prev);
        if (existing) {
          next.set(routineId, { ...existing, completed: newCompleted });
        } else {
          next.set(routineId, {
            id: crypto.randomUUID(),
            user_id: user.id,
            routine_id: routineId,
            date,
            completed: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
        return next;
      });

      try {
        if (existing) {
          const { error: updateError } = await supabase
            .from("check_ins")
            .update({ completed: newCompleted })
            .eq("id", existing.id)
            .eq("user_id", user.id);

          if (updateError) throw updateError;
        } else {
          const { error: insertError } = await supabase
            .from("check_ins")
            .insert({
              user_id: user.id,
              routine_id: routineId,
              date,
              completed: true,
            });

          if (insertError) throw insertError;
        }

        // Re-fetch to sync with server state
        await fetchCheckIns();
      } catch (err) {
        // Revert optimistic update on failure
        setCheckIns((prev) => {
          const next = new Map(prev);
          if (existing) {
            next.set(routineId, existing);
          } else {
            next.delete(routineId);
          }
          return next;
        });
        console.error("toggleCheckIn error:", err);
        throw err;
      }
    },
    [checkIns, date, fetchCheckIns]
  );

  const getCompletionStats = useCallback(
    (totalRoutines: number) => {
      let completed = 0;
      checkIns.forEach((ci) => {
        if (ci.completed) completed++;
      });
      const percentage =
        totalRoutines > 0 ? Math.round((completed / totalRoutines) * 100) : 0;
      return { completed, total: totalRoutines, percentage };
    },
    [checkIns]
  );

  return {
    checkIns,
    loading,
    error,
    toggleCheckIn,
    getCompletionStats,
    refreshCheckIns: fetchCheckIns,
  };
}
