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
    <div className="group/section space-y-4">
      {/* Section header */}
      <div className="flex items-center gap-4 px-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 text-[10px] font-black text-slate-400 transition-colors group-hover/section:bg-primary/10 group-hover/section:text-primary">
          {label[0]}
        </div>
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 transition-colors group-hover/section:text-slate-900">
          {label}
        </h3>
        <div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent opacity-50" />
      </div>

      {/* Routines card */}
      <Card className="divide-y divide-slate-100 !p-0 !overflow-visible">
        {routines.map((routine, index) => {
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
              isFirst={index === 0}
              isLast={index === routines.length - 1}
            />
          );
        })}
      </Card>
    </div>
  );
}
