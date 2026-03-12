"use client";

import { Card } from "@/components/ui/Card";
import type { Routine, CheckIn } from "@/types/database";
import type { Tag } from "@/types/common";

interface ScorecardSummaryProps {
  routines: Routine[];
  checkIns: Map<string, CheckIn>;
}

const TAG_DOT_COLORS: Record<Tag, string> = {
  positive: "bg-positive",
  negative: "bg-negative",
  neutral: "bg-neutral",
};

export function ScorecardSummary({
  routines,
  checkIns,
}: ScorecardSummaryProps) {
  const total = routines.length;

  let completedCount = 0;
  let positiveCount = 0;
  let negativeCount = 0;
  let neutralCount = 0;

  routines.forEach((routine) => {
    const ci = checkIns.get(routine.id);
    if (ci?.completed) {
      completedCount++;
    }

    // Tag breakdown counts all routines, not just completed
    if (routine.tag === "positive") positiveCount++;
    else if (routine.tag === "negative") negativeCount++;
    else neutralCount++;
  });

  const percentage = total > 0 ? (completedCount / total) * 100 : 0;

  return (
    <Card className="flex flex-col gap-8 p-8">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
            Current Performance
          </h2>
          <p className="mt-1 font-display text-4xl font-black tracking-tight text-slate-900">
            {Math.round(percentage)}%
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-2 ring-1 ring-black/[0.03]">
            <span className="font-display text-xl font-black text-slate-900">
              {completedCount}
            </span>
            <span className="text-sm font-bold uppercase tracking-widest text-slate-400">
              / {total} done
            </span>
          </div>
        </div>
      </div>

      {/* Premium Tactile Progress bar */}
      <div className="relative h-6 w-full overflow-hidden rounded-2xl bg-slate-100 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] ring-1 ring-black/[0.02]">
        <div
          className="absolute bottom-0 left-0 top-0 rounded-2xl bg-gradient-to-r from-primary via-indigo-500 to-indigo-400 shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all duration-1000 ease-out"
          style={{ width: `${percentage}%` }}
        >
          {/* Shine effect on the progress bar */}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.2)_0%,transparent_100%)] opacity-50" />
        </div>
      </div>

      {/* Tag legend */}
      <div className="flex flex-wrap items-center gap-x-8 gap-y-4 pt-2 border-t border-slate-50">
        {(
          [
            { tag: "positive" as Tag, count: positiveCount, label: "positive" },
            { tag: "negative" as Tag, count: negativeCount, label: "negative" },
            { tag: "neutral" as Tag, count: neutralCount, label: "neutral" },
          ] as const
        ).map(({ tag, count, label }) => (
          <div key={tag} className="flex items-center gap-3">
            <div
              className={`h-4 w-4 rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.1)] ring-2 ring-white transition-transform hover:scale-125 ${TAG_DOT_COLORS[tag]}`}
            />
            <span className="text-sm font-bold text-slate-900">
              {count}{" "}
              <span className="font-medium uppercase tracking-widest text-slate-400">
                {label}
              </span>
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
