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
    activeClass: "border-neutral bg-gray-50 text-neutral",
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
    positive: "text-positive",
    negative: "text-negative",
    neutral: "text-neutral",
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
      className={`flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all ${
        selected
          ? "border-primary bg-indigo-50"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <span
        className={`text-sm font-bold ${tagColors[routine.tag]}`}
      >
        {tagLabels[routine.tag]}
      </span>
      <span
        className={`flex-1 text-sm font-medium ${
          selected ? "text-primary" : "text-gray-900"
        }`}
      >
        {routine.name}
      </span>
    </button>
  );
}

export function StackBuilder({ routines, onSubmit, onClose }: StackBuilderProps) {
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
    (stackedMode === "existing" ? stackedId !== null : newName.trim().length > 0);

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
    <div className="space-y-6">
      {/* Step 1: Pick anchor */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-gray-900">
          1. Choose your anchor habit
        </label>
        <p className="text-xs text-gray-500">
          This is the existing habit that triggers the new one.
        </p>
        <div className="max-h-40 space-y-2 overflow-y-auto">
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
            <p className="rounded-xl border border-dashed border-gray-200 px-4 py-6 text-center text-sm text-gray-400">
              No routines yet. Add some on the Scorecard first.
            </p>
          )}
        </div>
      </div>

      {/* Step 2: Define stacked habit (only visible after anchor is selected) */}
      {anchorId && (
        <div className="space-y-3">
          <label className="text-sm font-semibold text-gray-900">
            2. Stack a habit on top
          </label>

          {/* Mode toggle */}
          <div className="flex rounded-xl border border-gray-200">
            <button
              type="button"
              onClick={() => setStackedMode("existing")}
              className={`flex-1 rounded-l-xl px-3 py-2 text-sm font-medium transition-colors ${
                stackedMode === "existing"
                  ? "bg-primary text-white"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Pick existing
            </button>
            <button
              type="button"
              onClick={() => setStackedMode("new")}
              className={`flex-1 rounded-r-xl px-3 py-2 text-sm font-medium transition-colors ${
                stackedMode === "new"
                  ? "bg-primary text-white"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Create new
            </button>
          </div>

          {stackedMode === "existing" ? (
            <div className="max-h-40 space-y-2 overflow-y-auto">
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
                <p className="rounded-xl border border-dashed border-gray-200 px-4 py-6 text-center text-sm text-gray-400">
                  No other routines available. Create a new one instead.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <Input
                label="Habit name"
                placeholder="e.g., Journal 2 min, Do 10 pushups"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900">
                  Tag
                </label>
                <div className="flex gap-2">
                  {TAG_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setNewTag(option.value)}
                      className={`flex-1 rounded-xl border-2 px-2 py-2 text-center text-xs font-semibold transition-all ${
                        newTag === option.value
                          ? option.activeClass
                          : "border-gray-200 text-gray-500 hover:border-gray-300"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900">
                  Time of day
                </label>
                <div className="flex flex-wrap gap-2">
                  {TIME_OPTIONS.map((option) => (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => setNewTimeOfDay(option.value)}
                      className={`rounded-xl border-2 px-3 py-2 text-xs font-medium transition-all ${
                        newTimeOfDay === option.value
                          ? "border-primary bg-indigo-50 text-primary"
                          : "border-gray-200 text-gray-500 hover:border-gray-300"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
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
          <div className="rounded-xl bg-indigo-50 px-4 py-3">
            <p className="text-sm font-medium text-primary">
              &ldquo;After I{" "}
              <span className="font-bold">
                {anchorRoutine?.name ?? "..."}
              </span>
              , I will{" "}
              <span className="font-bold">
                {stackedMode === "existing"
                  ? stackedRoutine?.name ?? "..."
                  : newName.trim() || "..."}
              </span>
              .&rdquo;
            </p>
          </div>
        )}

      {/* Error */}
      {error && <p className="text-sm font-medium text-negative">{error}</p>}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button variant="secondary" onClick={onClose} fullWidth>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          loading={loading}
          disabled={!canSubmit}
          fullWidth
        >
          Create Stack
        </Button>
      </div>
    </div>
  );
}
