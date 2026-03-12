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
    activeClass: "border-neutral bg-surface text-neutral",
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
    <div className="space-y-8">
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
      <div className="space-y-3">
        <label className="text-xs font-black uppercase tracking-widest text-slate-400">
          Habit Impact
        </label>
        <div className="grid grid-cols-3 gap-3">
          {TAG_OPTIONS.map((option) => {
            const isSelected = tag === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setTag(option.value)}
                className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 px-3 py-4 transition-all duration-300 ${
                  isSelected
                    ? option.activeClass + " shadow-lg scale-[1.02]"
                    : "border-slate-100 bg-slate-50/50 text-slate-400 hover:border-slate-200 hover:bg-slate-50"
                }`}
              >
                <span className="text-lg font-black">{option.label.split(" (")[1].replace(")", "")}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest">{option.label.split(" (")[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Time of day selection */}
      <div className="space-y-3">
        <label className="text-xs font-black uppercase tracking-widest text-slate-400">
          Implementation Intention
        </label>
        <div className="flex flex-wrap gap-2">
          {TIME_OPTIONS.map((option) => {
            const isSelected = timeOfDay === option.value;
            return (
              <button
                key={option.label}
                type="button"
                onClick={() => setTimeOfDay(option.value)}
                className={`rounded-xl border-2 px-4 py-2.5 text-sm font-bold transition-all duration-300 ${
                  isSelected
                    ? "border-primary bg-primary text-white shadow-lg shadow-primary/20 scale-105"
                    : "border-slate-100 bg-slate-50/50 text-slate-500 hover:border-slate-200 hover:bg-slate-50"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Error display */}
      {error && name.trim() && (
        <p className="rounded-xl bg-negative/10 p-3 text-center text-sm font-bold text-negative">
          {error}
        </p>
      )}

      {/* Action buttons */}
      <div className="flex gap-3 pt-4">
        <Button variant="ghost" onClick={onClose} fullWidth>
          Cancel
        </Button>
        <Button onClick={handleSubmit} loading={loading} fullWidth>
          {isEditing ? "Save Impact" : "Commit Habit"}
        </Button>
      </div>
    </div>
  );
}
