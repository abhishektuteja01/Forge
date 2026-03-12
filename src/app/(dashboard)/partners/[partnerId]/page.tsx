"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Zap, AlertCircle } from "lucide-react";
import { usePartners } from "@/hooks/usePartners";
import { SharedView } from "@/components/partners/SharedView";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { NUDGE_MESSAGES } from "@/types/partners";
import type { PartnerSnapshot } from "@/types/partners";

export default function PartnerProgressPage() {
  const params = useParams<{ partnerId: string }>();
  const router = useRouter();
  const partnerId = params.partnerId;

  const { fetchPartnerSnapshot, sendNudge, partnerships } = usePartners();

  // --------------- State ---------------
  const [snapshot, setSnapshot] = useState<PartnerSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nudgeLoading, setNudgeLoading] = useState(false);
  const [nudgeSent, setNudgeSent] = useState(false);
  const [showNudgePicker, setShowNudgePicker] = useState(false);

  // --------------- Fetch snapshot ---------------
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchPartnerSnapshot(partnerId);
        setSnapshot(data);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load partner data";
        setError(message);
        console.error("PartnerProgress error:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [partnerId, fetchPartnerSnapshot]);

  // --------------- Find the partnership for nudge ---------------
  const partnership = partnerships.find(
    (p) =>
      p.partner_profile.id === partnerId ||
      p.requester_id === partnerId ||
      p.partner_id === partnerId
  );

  // --------------- Nudge handler ---------------
  const handleNudge = useCallback(
    async (message: string) => {
      if (!partnership) return;

      try {
        setNudgeLoading(true);
        await sendNudge(partnership.id, partnerId, message);
        setNudgeSent(true);
        setShowNudgePicker(false);
        setTimeout(() => setNudgeSent(false), 2500);
      } catch (err) {
        console.error("Failed to send nudge:", err);
      } finally {
        setNudgeLoading(false);
      }
    },
    [partnership, partnerId, sendNudge]
  );

  // --------------- Display name ---------------
  const displayName = snapshot?.profile.display_name ?? "Partner";

  // --------------- Loading state ---------------
  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="text-sm font-medium">Loading progress...</span>
        </div>
      </div>
    );
  }

  // --------------- Error state ---------------
  if (error || !snapshot) {
    return (
      <div className="mx-auto w-full max-w-lg px-4 py-6">
        <button
          type="button"
          onClick={() => router.push("/partners")}
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Partners
        </button>

        <Card className="flex flex-col items-center py-12 text-center">
          <AlertCircle className="mb-3 h-8 w-8 text-gray-400" />
          <p className="text-sm font-medium text-negative">
            {error ?? "Could not load partner data"}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Make sure you have an active partnership with this person.
          </p>
        </Card>
      </div>
    );
  }

  // --------------- Render ---------------
  return (
    <div className="mx-auto w-full max-w-lg px-4 py-6">
      {/* Back button */}
      <button
        type="button"
        onClick={() => router.push("/partners")}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Partners
      </button>

      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-xl font-bold text-primary">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-gray-900">
            {displayName}&apos;s Progress
          </h1>
          <p className="text-sm text-gray-500">Read-only view</p>
        </div>
      </div>

      {/* Partner's data */}
      <SharedView snapshot={snapshot} />

      {/* Nudge section at bottom */}
      {partnership && (
        <div className="mt-6">
          <Card className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">
              Send Encouragement
            </h2>

            {!showNudgePicker ? (
              <Button
                type="button"
                variant="primary"
                fullWidth
                onClick={() => {
                  if (nudgeSent) return;
                  setShowNudgePicker(true);
                }}
                disabled={nudgeLoading}
                className="gap-2"
              >
                {nudgeSent ? (
                  "Nudge sent! ✓"
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Send a Nudge
                  </>
                )}
              </Button>
            ) : (
              <div className="space-y-1.5">
                {NUDGE_MESSAGES.map((msg) => (
                  <button
                    key={msg}
                    type="button"
                    onClick={() => handleNudge(msg)}
                    disabled={nudgeLoading}
                    className="flex w-full items-center rounded-lg border border-border px-4 py-3 text-left text-sm text-gray-700 transition-colors hover:border-primary hover:bg-indigo-50 hover:text-primary"
                  >
                    {msg}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setShowNudgePicker(false)}
                  className="mt-2 text-sm font-medium text-gray-400 transition-colors hover:text-gray-600"
                >
                  Cancel
                </button>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
