"use client";

import { useState, useRef, useEffect } from "react";
import { MoreVertical, Link as LinkIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { VoteCounter } from "@/components/identity/VoteCounter";
import type { IdentityWithDetails } from "@/types/identity";
import type { Tag } from "@/types/common";

interface IdentityCardProps {
  identity: IdentityWithDetails;
  onEdit: (identity: IdentityWithDetails) => void;
  onManageLinks: (identity: IdentityWithDetails) => void;
  onDelete: (identityId: string) => void;
}

const TAG_CHIP_STYLES: Record<Tag, string> = {
  positive: "bg-positive/10 text-positive ring-1 ring-positive/20",
  negative: "bg-negative/10 text-negative ring-1 ring-negative/20",
  neutral: "bg-neutral/10 text-neutral ring-1 ring-neutral/20",
};

export function IdentityCard({
  identity,
  onEdit,
  onManageLinks,
  onDelete,
}: IdentityCardProps) {
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

  // Weekly progress: votes this week vs max possible (linked routines × 7)
  const maxWeeklyVotes = identity.linked_routines.length * 7;
  const weeklyPercent =
    maxWeeklyVotes > 0
      ? Math.min(
          Math.round((identity.votes_this_week / maxWeeklyVotes) * 100),
          100
        )
      : 0;

  return (
    <Card className="space-y-6 !p-6 sm:!p-8">
      {/* Header: statement + menu */}
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Identity Statement</span>
          </div>
          <div className="relative pl-6">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-full bg-primary/20" />
            <h3 className="font-display text-2xl font-black leading-tight tracking-tight text-slate-900 sm:text-3xl">
              &ldquo;{identity.statement}&rdquo;
            </h3>
          </div>
        </div>

        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Identity options"
            className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-300 hover:bg-white hover:shadow-premium hover:text-slate-900 ${
              menuOpen ? "bg-white shadow-premium text-slate-900" : "text-slate-400"
            }`}
          >
            <MoreVertical className="h-5 w-5" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full z-20 mt-1 w-56 overflow-hidden rounded-xl border border-black/[0.03] bg-white shadow-premium animate-in fade-in zoom-in-95">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onEdit(identity);
                }}
                className="flex w-full items-center px-4 py-3 text-left text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Edit statement
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onManageLinks(identity);
                }}
                className="flex w-full items-center px-4 py-3 text-left text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Manage linked habits
              </button>
              <div className="h-px bg-slate-50" />
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(identity.id);
                }}
                className="flex w-full items-center px-4 py-3 text-left text-sm font-bold text-rose-600 transition-colors hover:bg-rose-50"
              >
                Delete Identity
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Weekly progress bar */}
      {identity.linked_routines.length > 0 && (
        <div className="space-y-3 rounded-2xl bg-slate-50/50 p-4 ring-1 ring-black/[0.02]">
          <div className="flex items-center justify-between text-[10px]">
            <span className="font-black uppercase tracking-widest text-slate-400">
              Weekly progress
            </span>
            <div className="flex items-center gap-1.5 rounded-full bg-white px-2 py-0.5 shadow-sm ring-1 ring-black/[0.03]">
              <span className="font-bold text-slate-900">
                {identity.votes_this_week}/{maxWeeklyVotes}
              </span>
              <span className="text-slate-400 font-medium">votes</span>
            </div>
          </div>
          <div className="relative h-4 w-full overflow-hidden rounded-full bg-slate-100 shadow-inner ring-1 ring-black/[0.03]">
            <div
              className="absolute bottom-0 left-0 top-0 rounded-full bg-gradient-to-r from-primary via-indigo-400 to-primary transition-all duration-1000 ease-out"
              style={{ width: `${weeklyPercent}%` }}
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.2)_0%,transparent_100%)]" />
          </div>
        </div>
      )}

      {/* Vote counter + weekly chart */}
      <VoteCounter
        totalVotes={identity.total_votes}
        votesToday={identity.votes_today}
        voteHistory={identity.vote_history}
      />

      {/* Linked routines */}
      <div className="space-y-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Linked Habits
        </p>
        {identity.linked_routines.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {identity.linked_routines.map((routine) => {
              const tagStyles: Record<Tag, string> = {
                positive: "bg-emerald-50 text-emerald-600 ring-emerald-100",
                negative: "bg-rose-50 text-rose-600 ring-rose-100",
                neutral: "bg-slate-100 text-slate-600 ring-slate-200",
              };
              return (
                <span
                  key={routine.id}
                  className={`inline-flex items-center rounded-xl px-3 py-1 text-xs font-bold ring-1 ${tagStyles[routine.tag]}`}
                >
                  {routine.name}
                </span>
              );
            })}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onManageLinks(identity)}
            className="group inline-flex items-center gap-2 rounded-2xl border-2 border-dashed border-slate-100 bg-white px-5 py-3 text-sm font-bold text-slate-400 transition-all hover:border-primary/30 hover:text-primary hover:bg-primary/5"
          >
            <LinkIcon className="h-4 w-4" />
            Link habits to start voting
          </button>
        )}
      </div>
    </Card>
  );
}
