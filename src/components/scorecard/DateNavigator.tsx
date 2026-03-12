"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface DateNavigatorProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

function formatDisplayDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.getTime() === today.getTime()) return "Today";
  if (date.getTime() === yesterday.getTime()) return "Yesterday";

  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function shiftDate(dateStr: string, days: number): string {
  const date = new Date(dateStr + "T00:00:00");
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function DateNavigator({
  selectedDate,
  onDateChange,
}: DateNavigatorProps) {
  const today = getTodayString();
  const isToday = selectedDate === today;
  const isFuture = selectedDate >= today;

  return (
    <div className="flex items-center justify-between gap-4">
      {/* Previous day */}
      <button
        type="button"
        onClick={() => onDateChange(shiftDate(selectedDate, -1))}
        aria-label="Previous day"
        className="text-slate-400 hover:bg-white hover:shadow-premium-hover flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-black/[0.03] bg-white shadow-premium transition-all hover:scale-105 active:scale-95 hover:text-slate-900"
      >
        <ChevronLeft className="h-6 w-6" strokeWidth={2.5} />
      </button>

      {/* Date display + today jump */}
      <div className="flex flex-1 items-center justify-center gap-4">
        <h2 className="font-display text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
          {formatDisplayDate(selectedDate)}
        </h2>
        {!isToday && (
          <button
            type="button"
            onClick={() => onDateChange(today)}
            className="rounded-full bg-primary/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-primary transition-all hover:bg-primary hover:text-white hover:shadow-lg hover:shadow-primary/20"
          >
            Today
          </button>
        )}
      </div>

      {/* Next day */}
      <button
        type="button"
        onClick={() => onDateChange(shiftDate(selectedDate, 1))}
        disabled={isFuture}
        aria-label="Next day"
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-black/[0.03] transition-all ${
          isFuture
            ? "cursor-not-allowed opacity-30 bg-slate-100"
            : "bg-white text-slate-400 shadow-premium hover:shadow-premium-hover hover:scale-105 active:scale-95 hover:text-slate-900"
        }`}
      >
        <ChevronRight className="h-6 w-6" strokeWidth={2.5} />
      </button>
    </div>
  );
}
