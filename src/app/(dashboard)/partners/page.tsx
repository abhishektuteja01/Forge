"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users, Loader2, Check, X, Clock } from "lucide-react";
import { usePartners } from "@/hooks/usePartners";
import { createClient } from "@/lib/supabase/client";
import { InvitePartner } from "@/components/partners/InvitePartner";
import { PartnerCard } from "@/components/partners/PartnerCard";
import { NudgeBadge } from "@/components/partners/NudgeBadge";
import { Card } from "@/components/ui/Card";

export default function PartnersPage() {
  const router = useRouter();

  // --------------- Current User ---------------
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);
    };
    fetchUser();
  }, []);

  // --------------- Data ---------------
  const {
    partnerships,
    pendingInvites,
    sentInvites,
    unreadNudgeCount,
    nudges,
    loading,
    error,
    generateInviteLink,
    acceptInvite,
    declineInvite,
    removePartner,
    sendNudge,
    markNudgesRead,
  } = usePartners();

  // --------------- Handlers ---------------
  const handleViewProgress = useCallback(
    (partnerUserId: string) => {
      router.push(`/partners/${partnerUserId}`);
    },
    [router]
  );

  const handleRemove = useCallback(
    async (partnershipId: string) => {
      const confirmed = window.confirm(
        "Remove this accountability partner? They will no longer be able to see your progress."
      );
      if (!confirmed) return;

      try {
        await removePartner(partnershipId);
      } catch {
        // Error logged inside hook
      }
    },
    [removePartner]
  );

  const handleAccept = useCallback(
    async (partnershipId: string) => {
      try {
        await acceptInvite(partnershipId);
      } catch {
        // Error logged inside hook
      }
    },
    [acceptInvite]
  );

  const handleDecline = useCallback(
    async (partnershipId: string) => {
      try {
        await declineInvite(partnershipId);
      } catch {
        // Error logged inside hook
      }
    },
    [declineInvite]
  );

  const handleCancelSentInvite = useCallback(
    async (partnershipId: string) => {
      try {
        await removePartner(partnershipId);
      } catch {
        // Error logged inside hook
      }
    },
    [removePartner]
  );

  // --------------- Loading state ---------------
  if (loading && partnerships.length === 0 && pendingInvites.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="text-sm font-medium">Loading partners...</span>
        </div>
      </div>
    );
  }

  // --------------- Error state ---------------
  if (error && partnerships.length === 0 && pendingInvites.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="flex max-w-sm flex-col items-center gap-3 text-center">
          <p className="text-negative text-sm font-medium">{error}</p>
          <p className="text-sm text-gray-500">
            Check your connection and try refreshing.
          </p>
        </div>
      </div>
    );
  }

  // --------------- Check if there's any content at all ---------------
  const hasContent =
    partnerships.length > 0 ||
    pendingInvites.length > 0 ||
    sentInvites.length > 0;

  // --------------- Render ---------------
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 mx-auto w-full max-w-lg px-4 py-6 duration-500">
      {/* Page heading + nudge bell */}
      <div className="mb-2 flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-gray-900">
            Partners
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Stay accountable together. Share your progress and motivate each
            other.
          </p>
        </div>
        <NudgeBadge
          nudges={nudges}
          unreadCount={unreadNudgeCount}
          onMarkRead={markNudgesRead}
        />
      </div>

      <div className="mt-8 space-y-8">
        {/* ─── Invite Section ─────────────────────── */}
        <Card>
          <InvitePartner onGenerateLink={generateInviteLink} />
        </Card>

        {/* ─── Pending Invites (sent to you) ──────── */}
        {pendingInvites.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-bold tracking-widest text-gray-400 uppercase">
              Pending Invites
            </h2>
            {pendingInvites.map((invite) => (
              <Card
                key={invite.id}
                className="flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="text-primary flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-lg font-bold">
                    {(invite.partner_profile.display_name ?? "?")
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      {invite.partner_profile.display_name ?? "Someone"}{" "}
                      <span className="font-normal text-gray-500">
                        wants to partner with you
                      </span>
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(invite.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAccept(invite.id)}
                    aria-label="Accept invite"
                    className="text-positive flex h-10 w-10 items-center justify-center rounded-full bg-green-50 transition-colors hover:bg-green-100"
                  >
                    <Check className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDecline(invite.id)}
                    aria-label="Decline invite"
                    className="text-negative flex h-10 w-10 items-center justify-center rounded-full bg-red-50 transition-colors hover:bg-red-100"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* ─── Active Partners ────────────────────── */}
        {partnerships.length > 0 && currentUserId && (
          <div className="space-y-3">
            <h2 className="text-sm font-bold tracking-widest text-gray-400 uppercase">
              Your Partners
            </h2>
            {partnerships.map((partnership) => (
              <PartnerCard
                key={partnership.id}
                partnership={partnership}
                currentUserId={currentUserId}
                onViewProgress={handleViewProgress}
                onSendNudge={sendNudge}
                onRemove={handleRemove}
              />
            ))}
          </div>
        )}

        {/* ─── Sent Invites (waiting for acceptance) ─ */}
        {sentInvites.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-bold tracking-widest text-gray-400 uppercase">
              Sent Invites
            </h2>
            {sentInvites.map((invite) => (
              <Card
                key={invite.id}
                className="flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Invite pending
                    </p>
                    <p className="text-xs text-gray-400">
                      Sent{" "}
                      {new Date(invite.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCancelSentInvite(invite.id)}
                  className="hover:text-negative text-sm font-medium text-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </Card>
            ))}
          </div>
        )}

        {/* ─── Empty State ───────────────────────── */}
        {!hasContent && (
          <div className="flex flex-col items-center justify-center border-2 border-gray-900 bg-white px-6 py-16 text-center">
            <div className="border-primary mb-6 flex h-14 w-14 items-center justify-center border-2 bg-white">
              <Users className="text-primary h-7 w-7" />
            </div>
            <h3 className="font-display mb-2 text-lg font-bold text-gray-900">
              Better together
            </h3>
            <p className="mb-2 max-w-xs text-sm text-gray-500">
              Invite a friend, family member, or colleague. They&apos;ll see
              your habit streaks and can send you a nudge when you need it.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
