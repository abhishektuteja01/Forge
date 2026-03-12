"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { Routine } from "@/types/database";
import type { Tag, TimeOfDay } from "@/types/common";
import type { RoutineData } from "@/lib/validators/routine";

/** Discriminated union: either stack two existing routines, or create a new routine to stack */
export type StackBuilderResult =
  | {
      mode: "existing";
      anchorRoutineId: string;
      stackedRoutineId: string;
    }
  | {
      mode: "new";
      anchorRoutineId: string;
      newRoutine: RoutineData;
    };

interface StackBuilderProps {
  routines: Routine[];
  onSubmit: (result: StackBuilderResult) => Promise<void>;
  onClose: () => void;
}

const TAG_OPTIONS: { value: Tag; label: string; activeClass: string }[] = [
  {
    value: "positive",
    label: "Positive (+)",
    activeClass: "border-positive bg-green-50 text-positive",
  },
  {
    value: "negative",
    label: "Negative (−)",
    activeClass: "border-negative bg-red-50 text-negative",
  },
  {
    value: "neutral",
    label: "Neutral (=)",
    activeClass: "border-neutral bg-surface text-neutral",
  },
];

const TIME_OPTIONS: { value: TimeOfDay | null; label: string }[] = [
  { value: "morning", label: "Morning" },
  { value: "afternoon", label: "Afternoon" },
  { value: "evening", label: "Evening" },
  { value: "night", label: "Night" },
  { value: null, label: "No time" },
];

function RoutinePickerItem({
  routine,
  selected,
  onSelect,
}: {
  routine: Routine;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const tagColors: Record<Tag, string> = {
    positive: "text-emerald-500",
    negative: "text-rose-500",
    neutral: "text-slate-400",
  };

  const tagLabels: Record<Tag, string> = {
    positive: "+",
    negative: "−",
    neutral: "=",
  };

  return (
    <button
      type="button"
      onClick={() => onSelect(routine.id)}
      className={`flex w-full items-center gap-4 rounded-2xl border-2 px-5 py-4 text-left transition-all duration-300 ${
        selected
          ? "border-primary bg-primary/5 shadow-premium ring-1 ring-primary/20 scale-[1.02]"
          : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50"
      }`}
    >
      <span className={`text-lg font-black ${tagColors[routine.tag]}`}>
        {tagLabels[routine.tag]}
      </span>
      <span
        className={`flex-1 font-display text-lg font-bold tracking-tight ${
          selected ? "text-slate-900" : "text-slate-600"
        }`}
      >
        {routine.name}
      </span>
    </button>
  );
}

export function StackBuilder({
  routines,
  onSubmit,
  onClose,
}: StackBuilderProps) {
  // Anchor selection
  const [anchorId, setAnchorId] = useState<string | null>(null);

  // Stacked mode: pick existing or create new
  const [stackedMode, setStackedMode] = useState<"existing" | "new">(
    "existing"
  );

  // Existing stacked selection
  const [stackedId, setStackedId] = useState<string | null>(null);

  // New routine fields
  const [newName, setNewName] = useState("");
  const [newTag, setNewTag] = useState<Tag>("positive");
  const [newTimeOfDay, setNewTimeOfDay] = useState<TimeOfDay | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter out the anchor from the stacked picker to prevent self-stacking
  const stackableRoutines = useMemo(
    () => routines.filter((r) => r.id !== anchorId),
    [routines, anchorId]
  );

  // Resolve selected routines for the preview
  const anchorRoutine = useMemo(
    () => routines.find((r) => r.id === anchorId),
    [routines, anchorId]
  );

  const stackedRoutine = useMemo(
    () => routines.find((r) => r.id === stackedId),
    [routines, stackedId]
  );

  // Validation
  const canSubmit =
    anchorId !== null &&
    (stackedMode === "existing"
      ? stackedId !== null
      : newName.trim().length > 0);

  async function handleSubmit() {
    if (!anchorId) return;

    try {
      setLoading(true);
      setError(null);

      if (stackedMode === "existing" && stackedId) {
        await onSubmit({
          mode: "existing",
          anchorRoutineId: anchorId,
          stackedRoutineId: stackedId,
        });
      } else if (stackedMode === "new" && newName.trim()) {
        await onSubmit({
          mode: "new",
          anchorRoutineId: anchorId,
          newRoutine: {
            name: newName.trim(),
            tag: newTag,
            time_of_day: newTimeOfDay,
          },
        });
      }

      onClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create stack";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Step 1: Pick anchor */}
      <div className="space-y-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-black uppercase tracking-widest text-slate-900">
            1. Choose your anchor habit
          </label>
          <p className="text-xs font-medium text-slate-400">
            This is the existing habit that triggers the new one.
          </p>
        </div>
        <div className="max-h-56 space-y-3 overflow-y-auto pr-2">
          {routines.length > 0 ? (
            routines.map((routine) => (
              <RoutinePickerItem
                key={routine.id}
                routine={routine}
                selected={anchorId === routine.id}
                onSelect={(id) => {
                  setAnchorId(id);
                  // Clear stacked if it matches new anchor
                  if (stackedId === id) setStackedId(null);
                }}
              />
            ))
          ) : (
            <p className="rounded-[2rem] border-2 border-dashed border-slate-100 bg-slate-50/50 px-8 py-10 text-center text-sm font-bold text-slate-400">
              No routines yet. Add some routines on the Scorecard first.
            </p>
          )}
        </div>
      </div>

      {/* Step 2: Define stacked habit (only visible after anchor is selected) */}
      {anchorId && (
        <div className="space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-black uppercase tracking-widest text-slate-900">
              2. Stack a habit on top
            </label>
          </div>

          {/* Mode toggle */}
          <div className="flex rounded-2xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setStackedMode("existing")}
              className={`flex-1 rounded-xl px-4 py-2 text-sm font-bold transition-all duration-300 ${
                stackedMode === "existing"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Pick existing
            </button>
            <button
              type="button"
              onClick={() => setStackedMode("new")}
              className={`flex-1 rounded-xl px-4 py-2 text-sm font-bold transition-all duration-300 ${
                stackedMode === "new"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Create new
            </button>
          </div>

          {stackedMode === "existing" ? (
            <div className="max-h-56 space-y-3 overflow-y-auto pr-2">
              {stackableRoutines.length > 0 ? (
                stackableRoutines.map((routine) => (
                  <RoutinePickerItem
                    key={routine.id}
                    routine={routine}
                    selected={stackedId === routine.id}
                    onSelect={setStackedId}
                  />
                ))
              ) : (
                <p className="rounded-[2rem] border-2 border-dashed border-slate-100 bg-slate-50/50 px-8 py-10 text-center text-sm font-bold text-slate-400">
                  No other routines available to stack. Create a new one.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-6 rounded-[2rem] bg-slate-50/50 p-6 ring-1 ring-black/[0.03]">
              <Input
                label="New Habit name"
                placeholder="e.g., Journal for 2 min"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Impact
                </label>
                <div className="flex gap-2">
                  {TAG_OPTIONS.map((option) => {
                    const isSelected = newTag === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setNewTag(option.value)}
                        className={`flex-1 rounded-2xl border-2 px-3 py-3 text-center text-xs font-black transition-all duration-300 ${
                          isSelected
                            ? option.activeClass + " shadow-md"
                            : "border-white bg-white text-slate-400 hover:border-slate-200"
                        }`}
                      >
                        {option.label.split(" (")[0]}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Time
                </label>
                <div className="flex flex-wrap gap-2">
                  {TIME_OPTIONS.map((option) => {
                    const isSelected = newTimeOfDay === option.value;
                    return (
                      <button
                        key={option.label}
                        type="button"
                        onClick={() => setNewTimeOfDay(option.value)}
                        className={`rounded-xl border-2 px-4 py-2 text-xs font-black transition-all duration-300 ${
                          isSelected
                            ? "border-primary bg-primary text-white shadow-md"
                            : "border-white bg-white text-slate-400 hover:border-slate-200"
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Preview */}
      {anchorId &&
        ((stackedMode === "existing" && stackedId) ||
          (stackedMode === "new" && newName.trim())) && (
          <div className="rounded-2xl bg-primary px-6 py-5 shadow-2xl shadow-primary/20 transition-all duration-500">
            <p className="font-display text-lg font-bold leading-relaxed text-white">
              <span className="opacity-60 italic font-medium pr-2">After I</span>
              {anchorRoutine?.name ?? "..."}
              <span className="opacity-60 italic font-medium px-2">I will</span>
              {stackedMode === "existing"
                ? (stackedRoutine?.name ?? "...")
                : newName.trim() || "..."}
            </p>
          </div>
        )}

      {/* Error */}
      {error && (
        <p className="rounded-xl bg-negative/10 px-4 py-3 text-center text-sm font-bold text-negative">
          {error}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-4 pt-4">
        <Button variant="ghost" onClick={onClose} fullWidth>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          loading={loading}
          disabled={!canSubmit}
          fullWidth
        >
          Confirm Stack
        </Button>
      </div>
    </div>
  );
}
