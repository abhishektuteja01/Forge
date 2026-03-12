"use client";

import { useState, useMemo, useCallback } from "react";
import { Plus, Loader2 } from "lucide-react";
import { useRoutines } from "@/hooks/useRoutines";
import { useCheckIns } from "@/hooks/useCheckIns";
import { DateNavigator } from "@/components/scorecard/DateNavigator";
import { ScorecardSummary } from "@/components/scorecard/ScorecardSummary";
import { RoutineGroup } from "@/components/scorecard/RoutineGroup";
import { AddRoutineForm } from "@/components/scorecard/AddRoutineForm";
import { Modal } from "@/components/ui/Modal";
import type { Routine } from "@/types/database";
import type { RoutineData } from "@/lib/validators/routine";

/** Ordered time-of-day groups matching the mockup layout */
const TIME_GROUPS = [
  { key: "morning", label: "Morning" },
  { key: "afternoon", label: "Afternoon" },
  { key: "evening", label: "Evening" },
  { key: "night", label: "Night" },
  { key: "anytime", label: "Anytime" },
] as const;

function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function ScorecardPage() {
  // --------------- State ---------------
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);

  // --------------- Data ---------------
  const {
    routines,
    loading: routinesLoading,
    error: routinesError,
    addRoutine,
    updateRoutine,
    deleteRoutine,
  } = useRoutines();

  const {
    checkIns,
    loading: checkInsLoading,
    error: checkInsError,
    toggleCheckIn,
  } = useCheckIns(selectedDate);

  const isLoading = routinesLoading || checkInsLoading;
  const error = routinesError || checkInsError;

  // --------------- Grouping ---------------
  const groupedRoutines = useMemo(() => {
    const groups = new Map<string, Routine[]>();

    // Initialize all groups to preserve order even if empty
    TIME_GROUPS.forEach(({ key }) => groups.set(key, []));

    routines.forEach((routine) => {
      const key = routine.time_of_day ?? "anytime";
      const group = groups.get(key);
      if (group) {
        group.push(routine);
      } else {
        // Fallback for unexpected values
        const anytime = groups.get("anytime");
        if (anytime) anytime.push(routine);
      }
    });

    return groups;
  }, [routines]);

  // --------------- Handlers ---------------
  const handleToggle = useCallback(
    async (routineId: string) => {
      try {
        await toggleCheckIn(routineId);
      } catch {
        // Error is already logged inside the hook.
        // Could add a toast here in the future.
      }
    },
    [toggleCheckIn]
  );

  const handleOpenAdd = useCallback(() => {
    setEditingRoutine(null);
    setIsModalOpen(true);
  }, []);

  const handleOpenEdit = useCallback((routine: Routine) => {
    setEditingRoutine(routine);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingRoutine(null);
  }, []);

  const handleFormSubmit = useCallback(
    async (data: RoutineData) => {
      if (editingRoutine) {
        await updateRoutine(editingRoutine.id, data);
      } else {
        await addRoutine(data);
      }
    },
    [editingRoutine, updateRoutine, addRoutine]
  );

  const handleDelete = useCallback(
    async (routineId: string) => {
      const confirmed = window.confirm(
        "Are you sure you want to delete this routine? This can't be undone."
      );
      if (!confirmed) return;

      try {
        await deleteRoutine(routineId);
      } catch {
        // Error is already logged inside the hook.
      }
    },
    [deleteRoutine]
  );

  // --------------- Loading state ---------------
  if (isLoading && routines.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="text-sm font-medium">Loading scorecard...</span>
        </div>
      </div>
    );
  }

  // --------------- Error state ---------------
  if (error && routines.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="flex max-w-sm flex-col items-center gap-3 text-center">
          <p className="text-sm font-medium text-negative">{error}</p>
          <p className="text-sm text-gray-500">
            Check your connection and try refreshing.
          </p>
        </div>
      </div>
    );
  }

  // --------------- Render ---------------
  return (
    <div className="mx-auto w-full max-w-lg px-4 py-6">
      {/* Date navigation */}
      <DateNavigator
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />

      {/* Page heading */}
      <h1 className="mb-6 mt-4 font-display text-2xl font-bold tracking-tight text-gray-900">
        Daily Scorecard
      </h1>

      {/* Progress summary */}
      {routines.length > 0 && (
        <div className="mb-8">
          <ScorecardSummary routines={routines} checkIns={checkIns} />
        </div>
      )}

      {/* Routine groups */}
      {routines.length > 0 ? (
        <div className="space-y-6">
          {TIME_GROUPS.map(({ key, label }) => {
            const groupRoutines = groupedRoutines.get(key) ?? [];
            return (
              <RoutineGroup
                key={key}
                label={label}
                routines={groupRoutines}
                checkIns={checkIns}
                onToggle={handleToggle}
                onEdit={handleOpenEdit}
                onDelete={handleDelete}
              />
            );
          })}
        </div>
      ) : (
        /* Empty state */
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 px-6 py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">
            <Plus className="h-7 w-7 text-primary" />
          </div>
          <h3 className="mb-2 font-display text-lg font-bold text-gray-900">
            Start your Scorecard
          </h3>
          <p className="mb-6 max-w-xs text-sm text-gray-500">
            List your daily routines and tag them as positive, negative, or
            neutral. Start with what you already do — not what you wish you did.
          </p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-600"
          >
            <Plus className="h-4 w-4" />
            Add your first routine
          </button>
        </div>
      )}

      {/* Floating action button — visible when routines exist */}
      {routines.length > 0 && (
        <button
          type="button"
          onClick={handleOpenAdd}
          aria-label="Add routine"
          className="fixed bottom-24 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-all hover:bg-indigo-600 hover:shadow-xl active:scale-95 md:bottom-8 md:right-8"
        >
          <Plus className="h-6 w-6" strokeWidth={2.5} />
        </button>
      )}

      {/* Add / Edit modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingRoutine ? "Edit Routine" : "New Routine"}
      >
        <AddRoutineForm
          key={editingRoutine?.id ?? "new"}
          routine={editingRoutine ?? undefined}
          onSubmit={handleFormSubmit}
          onClose={handleCloseModal}
        />
      </Modal>
    </div>
  );
}
