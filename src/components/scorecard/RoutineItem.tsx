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
  isFirst?: boolean;
  isLast?: boolean;
}

const TAG_BADGE_STYLES: Record<
  Tag,
  { bg: string; text: string; label: string }
> = {
  positive: { bg: "bg-green-50", text: "text-positive", label: "+" },
  negative: { bg: "bg-red-50", text: "text-negative", label: "−" },
  neutral: { bg: "bg-surface/50", text: "text-neutral", label: "=" },
};

export function RoutineItem({
  routine,
  completed,
  onToggle,
  onEdit,
  onDelete,
  isFirst,
  isLast,
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

  const tagAccentStyles: Record<Tag, string> = {
    positive: "border-l-emerald-500",
    negative: "border-l-rose-500",
    neutral: "border-l-slate-300",
  };

  return (
    <div
      className={`group relative flex min-h-[72px] items-center gap-5 border-l-[3px] px-6 py-4 transition-all duration-500 ${
        completed ? "bg-slate-50/50 opacity-60" : "bg-white hover:bg-slate-50/80"
      } ${tagAccentStyles[routine.tag]} ${isFirst ? "rounded-t-[1.95rem]" : ""} ${isLast ? "rounded-b-[1.95rem]" : ""}`}
    >
      {/* Premium Satisfying Checkbox */}
      <button
        type="button"
        onClick={() => onToggle(routine.id)}
        aria-label={`Mark ${routine.name} as ${completed ? "not done" : "done"}`}
        className={`group/check relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border-2 transition-all duration-300 ease-out active:scale-90 ${
          completed
            ? "border-primary bg-primary text-white shadow-lg shadow-primary/30 rotate-0"
            : "border-slate-200 bg-white hover:border-primary/50 hover:shadow-md -rotate-3 hover:rotate-0"
        }`}
      >
        <Check
          className={`h-6 w-6 transition-all duration-500 ${
            completed ? "scale-100 opacity-100" : "scale-0 opacity-0"
          }`}
          strokeWidth={3}
        />
        {/* Completion pulse effect */}
        {completed && (
          <div className="absolute inset-0 animate-ping rounded-2xl bg-primary/40 opacity-0" />
        )}
      </button>

      {/* Routine name */}
      <span
        className={`flex-1 font-sans text-lg tracking-tight transition-all duration-500 ${
          completed ? "text-slate-400 line-through decoration-slate-300" : "font-bold text-slate-800"
        }`}
      >
        {routine.name}
      </span>

      {/* Tag badge - more subtle now as we have the left border */}
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black shadow-sm ring-1 ring-black/[0.03] transition-all duration-500 ${
          completed ? "opacity-30 grayscale scale-90" : "opacity-100 scale-100"
        } ${badge.bg} ${badge.text}`}
      >
        {badge.label}
      </span>

      {/* More menu */}
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={`Options for ${routine.name}`}
          className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-300 hover:bg-white hover:shadow-premium hover:text-slate-900 ${
            menuOpen ? "bg-white shadow-premium text-slate-900" : "text-slate-400 opacity-0 group-hover:opacity-100"
          } ${completed ? "group-hover:opacity-50" : ""}`}
        >
          <MoreVertical className="h-5 w-5" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full z-20 mt-1 w-36 overflow-hidden rounded-xl border border-border bg-white shadow-lg">
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onEdit(routine);
              }}
              className="flex w-full items-center px-4 py-3 text-left text-sm font-medium text-foreground transition-colors hover:bg-surface"
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
