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
    <Card className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold tracking-widest text-gray-500 uppercase">
          Today&apos;s Progress
        </span>
        <span className="text-primary rounded-full bg-indigo-50 px-3 py-1 text-sm font-bold">
          {completedCount}/{total} done
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className="bg-primary h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Tag legend */}
      <div className="flex items-center gap-5 text-sm text-gray-500">
        {(
          [
            { tag: "positive" as Tag, count: positiveCount, label: "positive" },
            { tag: "negative" as Tag, count: negativeCount, label: "negative" },
            { tag: "neutral" as Tag, count: neutralCount, label: "neutral" },
          ] as const
        ).map(({ tag, count, label }) => (
          <div key={tag} className="flex items-center gap-1.5">
            <div
              className={`h-2.5 w-2.5 rounded-full ${TAG_DOT_COLORS[tag]}`}
            />
            <span className="font-medium">
              {count} {label}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
