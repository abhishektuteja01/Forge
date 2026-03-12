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
    <div className="space-y-5 rounded-[2rem] bg-slate-50/50 p-6 ring-1 ring-black/[0.02]">
      {/* Main vote display */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Votes</span>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-6xl font-black tracking-tight text-slate-900">
              {totalVotes}
            </span>
            <span className="text-sm font-black uppercase tracking-widest text-slate-400">
              {totalVotes === 1 ? "vote" : "votes"}
            </span>
          </div>
        </div>
        {votesToday > 0 && (
          <div className="flex h-12 flex-col items-center justify-center rounded-2xl bg-emerald-50 px-4 ring-1 ring-emerald-100 shadow-sm">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-600">
              +{votesToday} today
            </span>
          </div>
        )}
      </div>

      {/* Weekly mini bar chart */}
      <div className="space-y-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Last 7 days
        </p>
        <div className="flex items-end gap-3">
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
                className="flex flex-1 flex-col items-center gap-2"
              >
                {/* Bar */}
                <div className="relative flex h-16 w-full items-end justify-center">
                  <div
                    className={`w-full rounded-lg transition-all duration-500 hover:scale-x-105 ${
                      day.count > 0
                        ? isToday
                          ? "bg-primary shadow-lg shadow-primary/30"
                          : "bg-slate-200"
                        : "bg-slate-100/50"
                    }`}
                    style={{
                      height:
                        day.count > 0
                          ? `${Math.max(heightPercent, 20)}%`
                          : "6px",
                    }}
                  />
                  {/* Vote count label on non-empty bars */}
                  {day.count > 0 && (
                    <span className={`absolute -top-5 text-[10px] font-black ${isToday ? "text-primary" : "text-slate-400"}`}>
                      {day.count}
                    </span>
                  )}
                </div>
                {/* Day label */}
                <span
                  className={`text-[10px] font-black tracking-widest ${
                    isToday ? "text-primary" : "text-slate-300"
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
