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
  { bg: string; text: string; label: string }
> = {
  positive: { bg: "bg-green-50", text: "text-positive", label: "+" },
  negative: { bg: "bg-red-50", text: "text-negative", label: "−" },
  neutral: { bg: "bg-gray-100", text: "text-neutral", label: "=" },
};

function RoutineNode({
  routine,
  role,
}: {
  routine: Routine;
  role: "ANCHOR" | "STACKED";
}) {
  const icon = TAG_ICON_STYLES[routine.tag];

  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-bold ${icon.bg} ${icon.text}`}
      >
        {icon.label}
      </div>
      <div>
        <span className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">
          {role}
        </span>
        <span className="block text-base font-bold text-gray-900">
          {routine.name}
        </span>
      </div>
    </div>
  );
}

function Connector() {
  return (
    <div className="flex items-center gap-2 py-1 pl-5">
      <div className="flex flex-col items-center">
        <div className="h-4 w-0.5 bg-primary" />
        <ArrowDown className="h-4 w-4 text-primary" />
      </div>
      <span className="text-sm italic text-primary">then I will...</span>
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
    <Card className="relative space-y-1">
      {/* Menu button */}
      <div className="absolute right-4 top-4" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Stack options"
          className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        >
          <MoreVertical className="h-4 w-4" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full z-20 mt-1 w-40 overflow-hidden rounded-xl border border-border bg-white shadow-lg">
            {chain.steps.map((step) => (
              <button
                key={step.stack.id}
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(step.stack.id);
                }}
                className="flex w-full items-center px-4 py-3 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
              >
                {chain.steps.length > 1
                  ? `Remove "${step.routine.name}"`
                  : "Delete stack"}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Anchor */}
      <RoutineNode routine={chain.anchor} role="ANCHOR" />

      {/* Steps: connector → stacked, repeated for each step in chain */}
      {chain.steps.map((step) => (
        <div key={step.stack.id}>
          <Connector />
          <RoutineNode routine={step.routine} role="STACKED" />
        </div>
      ))}
    </Card>
  );
}
