"use client";

import { Card } from "@/components/ui/Card";
import { RoutineItem } from "@/components/scorecard/RoutineItem";
import type { Routine, CheckIn } from "@/types/database";

interface RoutineGroupProps {
  label: string;
  routines: Routine[];
  checkIns: Map<string, CheckIn>;
  onToggle: (routineId: string) => void;
  onEdit: (routine: Routine) => void;
  onDelete: (routineId: string) => void;
}

export function RoutineGroup({
  label,
  routines,
  checkIns,
  onToggle,
  onEdit,
  onDelete,
}: RoutineGroupProps) {
  if (routines.length === 0) return null;

  return (
    <div className="space-y-2">
      {/* Section header */}
      <h3 className="px-1 text-xs font-bold uppercase tracking-widest text-gray-400">
        {label}
      </h3>

      {/* Routines card */}
      <Card className="divide-y divide-gray-100 !p-0">
        {routines.map((routine) => {
          const ci = checkIns.get(routine.id);
          const completed = ci?.completed ?? false;

          return (
            <RoutineItem
              key={routine.id}
              routine={routine}
              completed={completed}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          );
        })}
      </Card>
    </div>
  );
}
