"use client";

import type { DailyVoteCount } from "@/types/identity";

interface VoteCounterProps {
  totalVotes: number;
  votesToday: number;
  voteHistory: DailyVoteCount[];
}

/** Get short day label (M, T, W...) from a YYYY-MM-DD string */
function getDayLabel(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return ["S", "M", "T", "W", "T", "F", "S"][date.getDay()];
}

export function VoteCounter({
  totalVotes,
  votesToday,
  voteHistory,
}: VoteCounterProps) {
  // Find the max vote count in the history for scaling bar heights
  const maxCount = Math.max(...voteHistory.map((d) => d.count), 1);

  return (
    <div className="space-y-4">
      {/* Main vote display */}
      <div className="flex items-end justify-between">
        <div>
          <span className="font-display text-4xl font-bold tracking-tight text-gray-900 transition-all duration-300">
            {totalVotes}
          </span>
          <span className="ml-2 text-sm font-medium text-gray-500">
            {totalVotes === 1 ? "vote" : "votes"}
          </span>
        </div>
        {votesToday > 0 && (
          <span className="text-positive rounded-full bg-green-50 px-3 py-1 text-xs font-bold">
            +{votesToday} today
          </span>
        )}
      </div>

      {/* Weekly mini bar chart */}
      <div>
        <p className="mb-2 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
          Last 7 days
        </p>
        <div className="flex items-end gap-1.5">
          {voteHistory.map((day) => {
            const heightPercent =
              maxCount > 0 ? (day.count / maxCount) * 100 : 0;
            const isToday =
              day.date ===
              (() => {
                const now = new Date();
                const y = now.getFullYear();
                const m = String(now.getMonth() + 1).padStart(2, "0");
                const d = String(now.getDate()).padStart(2, "0");
                return `${y}-${m}-${d}`;
              })();

            return (
              <div
                key={day.date}
                className="flex flex-1 flex-col items-center gap-1"
              >
                {/* Bar */}
                <div className="relative flex h-12 w-full items-end justify-center">
                  <div
                    className={`w-full rounded-t transition-all duration-300 ${
                      day.count > 0
                        ? isToday
                          ? "bg-primary"
                          : "bg-indigo-200"
                        : "bg-gray-100"
                    }`}
                    style={{
                      height:
                        day.count > 0
                          ? `${Math.max(heightPercent, 15)}%`
                          : "4px",
                    }}
                  />
                  {/* Vote count label on non-empty bars */}
                  {day.count > 0 && (
                    <span className="absolute -top-4 text-[10px] font-bold text-gray-500">
                      {day.count}
                    </span>
                  )}
                </div>
                {/* Day label */}
                <span
                  className={`text-[10px] font-medium ${
                    isToday ? "text-primary font-bold" : "text-gray-400"
                  }`}
                >
                  {getDayLabel(day.date)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
