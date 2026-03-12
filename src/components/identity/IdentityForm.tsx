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
    <div className="space-y-6">
      {/* Statement input */}
      {showStatement && (
        <Input
          label="Identity statement"
          placeholder='e.g., "I am someone who reads daily"'
          value={statement}
          onChange={(e) => setStatement(e.target.value)}
          error={error && !statement.trim() ? error : undefined}
          autoFocus
        />
      )}

      {/* Routine multi-select */}
      {showRoutines && (
        <div className="space-y-3">
          <div>
            <label className="text-sm font-semibold text-gray-900">
              Link habits to this identity
            </label>
            <p className="mt-0.5 text-xs text-gray-500">
              Each time you complete a linked habit, it counts as a vote.
            </p>
          </div>

          <div className="max-h-52 space-y-2 overflow-y-auto">
            {routines.length > 0 ? (
              routines.map((routine) => {
                const isSelected = selectedRoutineIds.has(routine.id);

                return (
                  <button
                    key={routine.id}
                    type="button"
                    onClick={() => toggleRoutine(routine.id)}
                    className={`flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all ${
                      isSelected
                        ? "border-primary bg-indigo-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {/* Checkbox indicator */}
                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 text-xs transition-all ${
                        isSelected
                          ? "border-primary bg-primary text-white"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {isSelected && "✓"}
                    </div>

                    {/* Tag indicator */}
                    <span
                      className={`text-sm font-bold ${TAG_COLORS[routine.tag]}`}
                    >
                      {TAG_LABELS[routine.tag]}
                    </span>

                    {/* Routine name */}
                    <span
                      className={`flex-1 text-sm font-medium ${
                        isSelected ? "text-primary" : "text-gray-900"
                      }`}
                    >
                      {routine.name}
                    </span>
                  </button>
                );
              })
            ) : (
              <p className="rounded-xl border border-dashed border-gray-200 px-4 py-6 text-center text-sm text-gray-400">
                No routines yet. Add some on the Scorecard first.
              </p>
            )}
          </div>

          {routines.length > 0 && (
            <p className="text-xs text-gray-400">
              {selectedRoutineIds.size} habit
              {selectedRoutineIds.size !== 1 ? "s" : ""} selected
            </p>
          )}
        </div>
      )}

      {/* Error */}
      {error && statement.trim() && (
        <p className="text-sm font-medium text-negative">{error}</p>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button variant="secondary" onClick={onClose} fullWidth>
          Cancel
        </Button>
        <Button onClick={handleSubmit} loading={loading} fullWidth>
          {buttonLabel}
        </Button>
      </div>
    </div>
  );
}
