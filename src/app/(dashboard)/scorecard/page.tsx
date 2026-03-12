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
    <div className="flex flex-col gap-10">
      {/* Date navigation */}
      <DateNavigator
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />

      {/* Page heading */}
      <div className="space-y-4">
        <h1 className="font-display text-5xl font-black tracking-tight text-slate-900 sm:text-6xl">
          Intelligence <span className="text-primary italic">Scorecard</span>
        </h1>
        <p className="text-lg leading-relaxed text-slate-500 max-w-xl">
           Ruthlessly inventory your daily mechanics. Tag your routines to see the <span className="font-bold text-slate-900 underline decoration-primary/30">identity</span> you are forging.
        </p>
      </div>

      {/* Progress summary */}
      {routines.length > 0 && (
        <ScorecardSummary routines={routines} checkIns={checkIns} />
      )}

      {/* Routine groups */}
      {routines.length > 0 ? (
        <div className="space-y-12">
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
        /* Empty state - Redesigned to be warmer and more inviting */
        <div className="relative overflow-hidden rounded-[2.5rem] border border-black/[0.03] bg-white p-12 text-center shadow-premium">
          {/* Subtle background decorative element */}
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-indigo-50 blur-3xl" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-slate-50 shadow-inner ring-1 ring-black/[0.03]">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20">
                <Plus className="h-8 w-8 text-white" />
              </div>
            </div>
            
            <h3 className="mb-4 font-display text-3xl font-black tracking-tight text-slate-900">
              Forging Starts Here
            </h3>
            <p className="mx-auto mb-10 max-w-sm text-lg font-medium leading-relaxed text-slate-500">
              Your scorecard is empty. Start by listing the behaviors that already define your day. 
              <span className="mt-2 block italic text-slate-400">"The first step to changing your identity is changing what you do."</span>
            </p>
            
            <button
              type="button"
              onClick={handleOpenAdd}
              className="group relative inline-flex items-center gap-3 overflow-hidden rounded-2xl bg-slate-900 px-10 py-5 text-lg font-bold text-white shadow-xl transition-all hover:scale-105 hover:bg-slate-800 active:scale-95"
            >
              <Plus className="h-5 w-5" strokeWidth={3} />
              Add First Habit
            </button>
          </div>
        </div>
      )}

      {/* Floating action button — visible when routines exist */}
      {routines.length > 0 && (
        <button
          type="button"
          onClick={handleOpenAdd}
          aria-label="Add routine"
          className="fixed bottom-24 right-5 z-40 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white shadow-2xl shadow-primary/40 transition-all hover:scale-110 hover:bg-indigo-700 active:scale-90 md:bottom-10 md:right-10"
        >
          <Plus className="h-8 w-8" strokeWidth={3} />
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
