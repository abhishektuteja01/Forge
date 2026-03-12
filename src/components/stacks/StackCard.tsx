"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowDown, MoreVertical } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { StackChain } from "@/types/stacks";
import type { Routine } from "@/types/database";
import type { Tag } from "@/types/common";

interface StackCardProps {
  chain: StackChain;
  onDelete: (stackId: string) => void;
}

const TAG_ICON_STYLES: Record<
  Tag,
  { bg: string; text: string; label: string; ring: string }
> = {
  positive: {
    bg: "bg-positive/10",
    text: "text-positive",
    label: "+",
    ring: "ring-positive/20",
  },
  negative: {
    bg: "bg-negative/10",
    text: "text-negative",
    label: "−",
    ring: "ring-negative/20",
  },
  neutral: {
    bg: "bg-neutral/10",
    text: "text-neutral",
    label: "=",
    ring: "ring-neutral/20",
  },
};

function RoutineNode({
  routine,
  role,
}: {
  routine: Routine;
  role: "ANCHOR" | "STACKED";
}) {
  const icon = TAG_ICON_STYLES[routine.tag];
  const tagAccentStyles: Record<Tag, string> = {
    positive: "border-l-emerald-500",
    negative: "border-l-rose-500",
    neutral: "border-l-slate-300",
  };

  return (
    <div className={`group flex items-center gap-5 border-l-[3px] py-4 pl-6 pr-4 transition-all duration-300 hover:bg-slate-50/50 ${tagAccentStyles[routine.tag]}`}>
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl font-black shadow-sm ring-1 ring-white ${icon.bg} ${icon.text}`}
      >
        {icon.label}
      </div>
      <div>
        <div className="mb-1 flex items-center gap-2">
          <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${role === "ANCHOR" ? "rounded-lg bg-slate-100 px-2 py-0.5 text-slate-900" : "text-slate-400"}`}>
            {role}
          </span>
        </div>
        <span className="block font-display text-xl font-bold tracking-tight text-slate-800 transition-colors group-hover:text-primary">
          {routine.name}
        </span>
      </div>
    </div>
  );
}

function Connector() {
  return (
    <div className="flex items-center gap-4 py-4 pl-9">
      <div className="flex flex-col items-center">
        <div className="h-6 w-1 rounded-full bg-gradient-to-b from-primary/20 to-primary/40" />
        <ArrowDown className="h-6 w-6 text-primary/60" strokeWidth={2.5} />
      </div>
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40">
        Then I will
      </span>
    </div>
  );
}

export function StackCard({ chain, onDelete }: StackCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
    <Card className="relative overflow-visible !p-0">
      {/* Menu button */}
      <div className="absolute right-4 top-5 z-10" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Stack options"
          className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-300 hover:bg-white hover:shadow-premium hover:text-slate-900 ${
            menuOpen ? "bg-white shadow-premium text-slate-900" : "text-slate-400"
          }`}
        >
          <MoreVertical className="h-5 w-5" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full z-20 mt-1 w-48 overflow-hidden rounded-xl border border-black/[0.03] bg-white shadow-premium animate-in fade-in zoom-in-95">
            {chain.steps.map((step) => (
              <button
                key={step.stack.id}
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(step.stack.id);
                }}
                className="flex w-full items-center px-4 py-3 text-left text-sm font-bold text-rose-600 transition-colors hover:bg-rose-50"
              >
                {chain.steps.length > 1
                  ? `Remove "${step.routine.name}"`
                  : "Delete stack"}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="divide-y divide-slate-50">
        <div className="overflow-hidden rounded-t-[1.95rem]">
          <RoutineNode routine={chain.anchor} role="ANCHOR" />
        </div>

        {chain.steps.map((step, idx) => (
          <div 
            key={step.stack.id} 
            className={`bg-slate-50/30 ${idx === chain.steps.length - 1 ? "rounded-b-[1.95rem]" : ""}`}
          >
            <Connector />
            <RoutineNode routine={step.routine} role="STACKED" />
          </div>
        ))}
      </div>
    </Card>
  );
}
