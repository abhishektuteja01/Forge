"use client";

import { Check, MoreVertical } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import type { Routine } from "@/types/database";
import type { Tag } from "@/types/common";

interface RoutineItemProps {
  routine: Routine;
  completed: boolean;
  onToggle: (routineId: string) => void;
  onEdit: (routine: Routine) => void;
  onDelete: (routineId: string) => void;
}

const TAG_BADGE_STYLES: Record<
  Tag,
  { bg: string; text: string; label: string }
> = {
  positive: { bg: "bg-green-50", text: "text-positive", label: "+" },
  negative: { bg: "bg-red-50", text: "text-negative", label: "−" },
  neutral: { bg: "bg-gray-100", text: "text-neutral", label: "=" },
};

export function RoutineItem({
  routine,
  completed,
  onToggle,
  onEdit,
  onDelete,
}: RoutineItemProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const badge = TAG_BADGE_STYLES[routine.tag];

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <div className="flex min-h-[56px] items-center gap-3 px-4 py-3">
      {/* Checkbox */}
      <button
        type="button"
        onClick={() => onToggle(routine.id)}
        aria-label={`Mark ${routine.name} as ${completed ? "not done" : "done"}`}
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 transition-all duration-200 ${
          completed
            ? "border-primary bg-primary text-white"
            : "hover:border-primary border-gray-300 bg-white"
        }`}
      >
        {completed && <Check className="h-4 w-4" strokeWidth={3} />}
      </button>

      {/* Routine name */}
      <span
        className={`flex-1 text-base transition-all duration-200 ${
          completed
            ? "text-gray-400 line-through decoration-gray-300"
            : "font-medium text-gray-900"
        }`}
      >
        {routine.name}
      </span>

      {/* Tag badge */}
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${badge.bg} ${badge.text}`}
      >
        {badge.label}
      </span>

      {/* More menu */}
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={`Options for ${routine.name}`}
          className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        >
          <MoreVertical className="h-4 w-4" />
        </button>

        {menuOpen && (
          <div className="border-border absolute top-full right-0 z-20 mt-1 w-36 overflow-hidden rounded-xl border bg-white shadow-lg">
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onEdit(routine);
              }}
              className="flex w-full items-center px-4 py-3 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onDelete(routine.id);
              }}
              className="flex w-full items-center px-4 py-3 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
