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
    <div className="flex items-center justify-between">
      {/* Previous day */}
      <button
        type="button"
        onClick={() => onDateChange(shiftDate(selectedDate, -1))}
        aria-label="Previous day"
        className="flex h-10 w-10 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {/* Date display + today jump */}
      <div className="flex items-center gap-3">
        <span className="font-display text-lg font-bold tracking-tight text-gray-900">
          {formatDisplayDate(selectedDate)}
        </span>
        {!isToday && (
          <button
            type="button"
            onClick={() => onDateChange(today)}
            className="text-primary rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-bold transition-colors hover:bg-indigo-100"
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
        className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
          isFuture
            ? "cursor-not-allowed text-gray-200"
            : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        }`}
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
