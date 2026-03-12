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
  positive: "bg-green-50 text-positive",
  negative: "bg-red-50 text-negative",
  neutral: "bg-gray-100 text-neutral",
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
    <Card className="space-y-5">
      {/* Header: statement + menu */}
      <div className="flex items-start justify-between gap-4">
        <h3 className="font-display text-lg leading-snug font-bold tracking-tight text-gray-900">
          &ldquo;{identity.statement}&rdquo;
        </h3>

        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Identity options"
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {menuOpen && (
            <div className="border-border absolute top-full right-0 z-20 mt-1 w-44 overflow-hidden rounded-xl border bg-white shadow-lg">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onEdit(identity);
                }}
                className="flex w-full items-center px-4 py-3 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Edit statement
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onManageLinks(identity);
                }}
                className="flex w-full items-center px-4 py-3 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Manage linked habits
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(identity.id);
                }}
                className="flex w-full items-center px-4 py-3 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Weekly progress bar */}
      {identity.linked_routines.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="font-medium">This week</span>
            <span className="font-bold">
              {identity.votes_this_week}/{maxWeeklyVotes} votes ({weeklyPercent}
              %)
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="bg-primary h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${weeklyPercent}%` }}
            />
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
      <div className="space-y-2">
        <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
          Linked habits
        </p>
        {identity.linked_routines.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {identity.linked_routines.map((routine) => (
              <span
                key={routine.id}
                className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold ${TAG_CHIP_STYLES[routine.tag]}`}
              >
                {routine.name}
              </span>
            ))}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onManageLinks(identity)}
            className="hover:border-primary hover:text-primary inline-flex items-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-xs font-medium text-gray-400 transition-colors"
          >
            <LinkIcon className="h-3 w-3" />
            Link habits to start voting
          </button>
        )}
      </div>
    </Card>
  );
}
