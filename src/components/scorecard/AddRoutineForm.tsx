"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { Routine } from "@/types/database";
import type { Tag, TimeOfDay } from "@/types/common";
import type { RoutineData } from "@/lib/validators/routine";

interface AddRoutineFormProps {
  routine?: Routine;
  onSubmit: (data: RoutineData) => Promise<void>;
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

const TIME_OPTIONS: {
  value: TimeOfDay | null;
  label: string;
}[] = [
  { value: "morning", label: "Morning" },
  { value: "afternoon", label: "Afternoon" },
  { value: "evening", label: "Evening" },
  { value: "night", label: "Night" },
  { value: null, label: "No time" },
];

export function AddRoutineForm({
  routine,
  onSubmit,
  onClose,
}: AddRoutineFormProps) {
  const [name, setName] = useState(routine?.name ?? "");
  const [tag, setTag] = useState<Tag>(routine?.tag ?? "neutral");
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay | null>(
    routine?.time_of_day ?? null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!routine;

  async function handleSubmit() {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await onSubmit({
        name: name.trim(),
        tag,
        time_of_day: timeOfDay,
      });

      onClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Name input */}
      <Input
        label="Routine name"
        placeholder="e.g., Brush teeth, Walk to class"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={error && !name.trim() ? error : undefined}
        autoFocus
      />

      {/* Tag selection */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-900">
          How does this habit affect you?
        </label>
        <div className="flex gap-2">
          {TAG_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setTag(option.value)}
              className={`flex-1 rounded-xl border-2 px-3 py-3 text-center text-sm font-semibold transition-all ${
                tag === option.value
                  ? option.activeClass
                  : "border-gray-200 text-gray-500 hover:border-gray-300"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Time of day selection */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-900">
          When do you usually do this?
        </label>
        <div className="flex flex-wrap gap-2">
          {TIME_OPTIONS.map((option) => (
            <button
              key={option.label}
              type="button"
              onClick={() => setTimeOfDay(option.value)}
              className={`rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition-all ${
                timeOfDay === option.value
                  ? "border-primary text-primary bg-indigo-50"
                  : "border-gray-200 text-gray-500 hover:border-gray-300"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error display */}
      {error && name.trim() && (
        <p className="text-negative text-sm font-medium">{error}</p>
      )}

      {/* Action buttons */}
      <div className="flex gap-3 pt-2">
        <Button variant="secondary" onClick={onClose} fullWidth>
          Cancel
        </Button>
        <Button onClick={handleSubmit} loading={loading} fullWidth>
          {isEditing ? "Save Changes" : "Add Routine"}
        </Button>
      </div>
    </div>
  );
}
