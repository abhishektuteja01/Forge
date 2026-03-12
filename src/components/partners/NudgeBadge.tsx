"use client";

import { useState, useCallback } from "react";
import { Bell } from "lucide-react";
import type { Nudge } from "@/types/partners";

interface NudgeBadgeProps {
  nudges: Nudge[];
  unreadCount: number;
  onMarkRead: () => Promise<void>;
}

export function NudgeBadge({
  nudges,
  unreadCount,
  onMarkRead,
}: NudgeBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = useCallback(async () => {
    const willOpen = !isOpen;
    setIsOpen(willOpen);

    // Mark all as read when opening the panel
    if (willOpen && unreadCount > 0) {
      try {
        await onMarkRead();
      } catch (err) {
        console.error("Failed to mark nudges as read:", err);
      }
    }
  }, [isOpen, unreadCount, onMarkRead]);

  // Only show the most recent 10 nudges
  const recentNudges = nudges.slice(0, 10);

  return (
    <div className="relative">
      {/* Bell trigger */}
      <button
        type="button"
        onClick={handleToggle}
        aria-label={`Nudges${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-negative px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <>
          {/* Backdrop to close on outside click */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-border bg-white shadow-lg">
            <div className="border-b border-border px-4 py-3">
              <h3 className="text-sm font-bold text-gray-900">Nudges</h3>
            </div>

            {recentNudges.length > 0 ? (
              <div className="max-h-64 overflow-y-auto">
                {recentNudges.map((nudge) => (
                  <div
                    key={nudge.id}
                    className={`border-b border-border px-4 py-3 last:border-b-0 ${
                      !nudge.read ? "bg-indigo-50/50" : ""
                    }`}
                  >
                    <p className="text-sm text-gray-800">{nudge.message}</p>
                    <p className="mt-1 text-[10px] text-gray-400">
                      {new Date(nudge.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-gray-400">No nudges yet</p>
                <p className="mt-1 text-xs text-gray-400">
                  Your partners can send you encouragement here
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
