"use client";

import { useState, useCallback } from "react";
import { Eye, Zap, X, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { NUDGE_MESSAGES } from "@/types/partners";
import type { PartnershipWithProfile } from "@/types/partners";

interface PartnerCardProps {
  partnership: PartnershipWithProfile;
  currentUserId: string;
  onViewProgress: (partnerUserId: string) => void;
  onSendNudge: (
    partnershipId: string,
    receiverId: string,
    message: string
  ) => Promise<void>;
  onRemove: (partnershipId: string) => void;
}

export function PartnerCard({
  partnership,
  currentUserId,
  onViewProgress,
  onSendNudge,
  onRemove,
}: PartnerCardProps) {
  const [nudgeLoading, setNudgeLoading] = useState(false);
  const [nudgeSent, setNudgeSent] = useState(false);
  const [showNudgePicker, setShowNudgePicker] = useState(false);

  const partnerUserId =
    partnership.requester_id === currentUserId
      ? partnership.partner_id!
      : partnership.requester_id;

  const displayName =
    partnership.partner_profile.display_name ?? "Anonymous Partner";

  const handleNudge = useCallback(
    async (message: string) => {
      try {
        setNudgeLoading(true);
        await onSendNudge(partnership.id, partnerUserId, message);
        setNudgeSent(true);
        setShowNudgePicker(false);
        setTimeout(() => setNudgeSent(false), 2500);
      } catch (err) {
        console.error("Failed to send nudge:", err);
      } finally {
        setNudgeLoading(false);
      }
    },
    [partnership.id, partnerUserId, onSendNudge]
  );

  return (
    <Card className="relative space-y-4">
      {/* Header: avatar + name + remove */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-primary flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-lg font-bold">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-gray-900">
              {displayName}
            </h3>
            <p className="text-xs text-gray-400">
              Partners since{" "}
              {new Date(partnership.updated_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onRemove(partnership.id)}
          aria-label="Remove partner"
          className="hover:text-negative flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-red-50"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onViewProgress(partnerUserId)}
          className="border-border inline-flex flex-1 items-center justify-center gap-2 rounded-xl border bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
        >
          <Eye className="h-4 w-4" />
          View Progress
        </button>

        <button
          type="button"
          onClick={() => {
            if (nudgeSent) return;
            setShowNudgePicker(!showNudgePicker);
          }}
          disabled={nudgeLoading}
          className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
            nudgeSent
              ? "text-positive bg-green-50"
              : "text-primary bg-indigo-50 hover:bg-indigo-100"
          }`}
        >
          {nudgeLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : nudgeSent ? (
            "Sent! ✓"
          ) : (
            <>
              <Zap className="h-4 w-4" />
              Nudge
            </>
          )}
        </button>
      </div>

      {/* Nudge message picker */}
      {showNudgePicker && (
        <div className="border-border space-y-1.5 rounded-xl border bg-gray-50 p-3">
          <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
            Pick a message
          </p>
          {NUDGE_MESSAGES.map((msg) => (
            <button
              key={msg}
              type="button"
              onClick={() => handleNudge(msg)}
              disabled={nudgeLoading}
              className="hover:text-primary flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-white"
            >
              {msg}
            </button>
          ))}
        </div>
      )}
    </Card>
  );
}
