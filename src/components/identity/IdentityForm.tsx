"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { Routine } from "@/types/database";
import type { IdentityWithDetails } from "@/types/identity";
import type { Tag } from "@/types/common";

type FormMode = "create" | "edit" | "links";

interface IdentityFormProps {
  mode: FormMode;
  identity?: IdentityWithDetails;
  routines: Routine[];
  onSubmitCreate?: (statement: string, routineIds: string[]) => Promise<void>;
  onSubmitEdit?: (id: string, statement: string) => Promise<void>;
  onSubmitLinks?: (identityId: string, routineIds: string[]) => Promise<void>;
  onClose: () => void;
}

const TAG_COLORS: Record<Tag, string> = {
  positive: "text-positive",
  negative: "text-negative",
  neutral: "text-neutral",
};

const TAG_LABELS: Record<Tag, string> = {
  positive: "+",
  negative: "−",
  neutral: "=",
};

export function IdentityForm({
  mode,
  identity,
  routines,
  onSubmitCreate,
  onSubmitEdit,
  onSubmitLinks,
  onClose,
}: IdentityFormProps) {
  const [statement, setStatement] = useState(identity?.statement ?? "");
  const [selectedRoutineIds, setSelectedRoutineIds] = useState<Set<string>>(
    () => new Set(identity?.linked_routines.map((r) => r.id) ?? [])
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const showStatement = mode === "create" || mode === "edit";
  const showRoutines = mode === "create" || mode === "links";

  function toggleRoutine(routineId: string) {
    setSelectedRoutineIds((prev) => {
      const next = new Set(prev);
      if (next.has(routineId)) {
        next.delete(routineId);
      } else {
        next.add(routineId);
      }
      return next;
    });
  }

  async function handleSubmit() {
    try {
      setLoading(true);
      setError(null);

      if (mode === "create") {
        if (!statement.trim()) {
          setError("Identity statement is required");
          return;
        }
        await onSubmitCreate?.(
          statement.trim(),
          Array.from(selectedRoutineIds)
        );
      } else if (mode === "edit" && identity) {
        if (!statement.trim()) {
          setError("Identity statement is required");
          return;
        }
        await onSubmitEdit?.(identity.id, statement.trim());
      } else if (mode === "links" && identity) {
        await onSubmitLinks?.(identity.id, Array.from(selectedRoutineIds));
      }

      onClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  const buttonLabel = {
    create: "Create Identity",
    edit: "Save Changes",
    links: "Update Links",
  }[mode];

  return (
    <div className="space-y-8">
      {/* Statement input */}
      {showStatement && (
        <Input
          label="Identity statement"
          placeholder='e.g., "I am someone who never misses a workout"'
          value={statement}
          onChange={(e) => setStatement(e.target.value)}
          error={error && !statement.trim() ? error : undefined}
          autoFocus
        />
      )}

      {/* Routine multi-select */}
      {showRoutines && (
        <div className="space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-black uppercase tracking-widest text-slate-900">
              Link habits to this identity
            </label>
            <p className="text-xs font-medium text-slate-400">
              Each time you complete a linked habit, it counts as a vote.
            </p>
          </div>

          <div className="max-h-64 space-y-3 overflow-y-auto pr-2">
            {routines.length > 0 ? (
              routines.map((routine) => {
                const isSelected = selectedRoutineIds.has(routine.id);
                const tagColors: Record<Tag, string> = {
                  positive: "text-emerald-500",
                  negative: "text-rose-500",
                  neutral: "text-slate-400",
                };

                return (
                  <button
                    key={routine.id}
                    type="button"
                    onClick={() => toggleRoutine(routine.id)}
                    className={`flex w-full items-center gap-4 rounded-2xl border-2 px-5 py-4 text-left transition-all duration-300 ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-premium ring-1 ring-primary/20 scale-[1.02]"
                        : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {/* Checkbox indicator */}
                    <div
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition-all duration-300 ${
                        isSelected
                          ? "border-primary bg-primary text-white shadow-lg shadow-primary/20 scale-110"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      {isSelected && <span className="text-xs font-black">✓</span>}
                    </div>

                    <div className="flex flex-1 items-center gap-3">
                      <span
                        className={`font-display text-lg font-black ${tagColors[routine.tag]}`}
                      >
                        {TAG_LABELS[routine.tag]}
                      </span>
                      <span
                        className={`font-display text-lg font-bold tracking-tight ${
                          isSelected ? "text-slate-900" : "text-slate-600"
                        }`}
                      >
                        {routine.name}
                      </span>
                    </div>
                  </button>
                );
              })
            ) : (
              <p className="rounded-[2rem] border-2 border-dashed border-slate-100 bg-slate-50/50 px-8 py-10 text-center text-sm font-bold text-slate-400">
                No routines yet. Add some routines on the Scorecard first.
              </p>
            )}
          </div>

          {routines.length > 0 && (
            <div className="flex justify-end">
              <p className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
                {selectedRoutineIds.size} habit
                {selectedRoutineIds.size !== 1 ? "s" : ""} selected
              </p>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && statement.trim() && (
        <p className="rounded-xl bg-negative/10 px-4 py-3 text-center text-sm font-bold text-negative">
          {error}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-4 pt-4">
        <Button variant="ghost" onClick={onClose} fullWidth>
          Cancel
        </Button>
        <Button onClick={handleSubmit} loading={loading} fullWidth>
          {buttonLabel}
        </Button>
      </div>
    </div>
  );
}
