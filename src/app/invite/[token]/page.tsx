"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Flame, Loader2, UserCheck, AlertCircle, XCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { Partnership } from "@/types/partners";

type InviteState =
  | "loading"
  | "ready"
  | "accepting"
  | "accepted"
  | "error_self"
  | "error_already_partners"
  | "error_used"
  | "error_not_found"
  | "error_generic"
  | "declined";

export default function InviteAcceptPage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const token = params.token;

  const [state, setState] = useState<InviteState>("loading");
  const [partnership, setPartnership] = useState<Partnership | null>(null);
  const [requesterName, setRequesterName] = useState<string | null>(null);

  // ─── Load invite data ──────────────────────────────

  useEffect(() => {
    const loadInvite = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          // Shouldn't happen (middleware protects this), but just in case
          router.push("/login");
          return;
        }

        // Fetch the partnership by token
        const { data: invite, error: inviteError } = await supabase
          .from("partnerships")
          .select("*")
          .eq("invite_token", token)
          .single();

        if (inviteError || !invite) {
          setState("error_not_found");
          return;
        }

        const typedInvite = invite as Partnership;

        // Check: is this your own invite?
        if (typedInvite.requester_id === user.id) {
          setState("error_self");
          return;
        }

        // Check: invite already accepted by someone else?
        if (
          typedInvite.status === "active" &&
          typedInvite.partner_id &&
          typedInvite.partner_id !== user.id
        ) {
          setState("error_used");
          return;
        }

        // Check: already accepted by you (revisiting the link)
        if (
          typedInvite.status === "active" &&
          typedInvite.partner_id === user.id
        ) {
          setState("accepted");
          setPartnership(typedInvite);
          return;
        }

        // Check: already have an active partnership with this person
        const { data: existing } = await supabase
          .from("partnerships")
          .select("id")
          .eq("status", "active")
          .or(
            `and(requester_id.eq.${user.id},partner_id.eq.${typedInvite.requester_id}),and(requester_id.eq.${typedInvite.requester_id},partner_id.eq.${user.id})`
          )
          .limit(1);

        if (existing && existing.length > 0) {
          setState("error_already_partners");
          return;
        }

        // Check: invite was declined
        if (typedInvite.status === "declined") {
          setState("error_not_found");
          return;
        }

        // Fetch requester's display name
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", typedInvite.requester_id)
          .single();

        setRequesterName(profile?.display_name ?? null);
        setPartnership(typedInvite);
        setState("ready");
      } catch {
        setState("error_generic");
      }
    };

    loadInvite();
  }, [token, router]);

  // ─── Accept ────────────────────────────────────────

  const handleAccept = useCallback(async () => {
    if (!partnership) return;

    try {
      setState("accepting");
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      const { error: updateError } = await supabase
        .from("partnerships")
        .update({ partner_id: user.id, status: "active" })
        .eq("id", partnership.id);

      if (updateError) throw updateError;

      setState("accepted");
    } catch {
      setState("error_generic");
    }
  }, [partnership]);

  // ─── Decline ───────────────────────────────────────

  const handleDecline = useCallback(async () => {
    if (!partnership) return;

    try {
      const supabase = createClient();

      const { error: updateError } = await supabase
        .from("partnerships")
        .update({ status: "declined" })
        .eq("id", partnership.id);

      if (updateError) throw updateError;

      setState("declined");
    } catch {
      setState("error_generic");
    }
  }, [partnership]);

  // ─── Render ────────────────────────────────────────

  const displayName = requesterName ?? "Someone";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4 py-12">
      {/* Logo */}
      <div className="mb-8 flex items-center gap-2">
        <Flame className="h-6 w-6 text-primary" />
        <span className="font-display text-2xl font-bold tracking-tight text-gray-900">
          Forge
        </span>
      </div>

      <div className="w-full max-w-sm">
        {/* Loading */}
        {state === "loading" && (
          <Card className="flex flex-col items-center py-12 text-center">
            <Loader2 className="mb-3 h-8 w-8 animate-spin text-gray-400" />
            <p className="text-sm text-gray-500">Loading invite...</p>
          </Card>
        )}

        {/* Ready to accept */}
        {state === "ready" && (
          <Card className="space-y-6 text-center">
            <div className="flex flex-col items-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 text-2xl font-bold text-primary">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <h1 className="font-display text-xl font-bold text-gray-900">
                Partner Invite
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                <span className="font-semibold text-gray-900">
                  {displayName}
                </span>{" "}
                wants you to be their accountability partner on Forge.
              </p>
              <p className="mt-1 text-xs text-gray-400">
                You&apos;ll be able to see each other&apos;s habit streaks and
                send encouragement.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Button
                type="button"
                variant="primary"
                fullWidth
                onClick={handleAccept}
              >
                Accept Partnership
              </Button>
              <Button
                type="button"
                variant="ghost"
                fullWidth
                onClick={handleDecline}
              >
                Decline
              </Button>
            </div>
          </Card>
        )}

        {/* Accepting */}
        {state === "accepting" && (
          <Card className="flex flex-col items-center py-12 text-center">
            <Loader2 className="mb-3 h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-gray-500">Setting up partnership...</p>
          </Card>
        )}

        {/* Accepted */}
        {state === "accepted" && (
          <Card className="space-y-6 text-center">
            <div className="flex flex-col items-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
                <UserCheck className="h-8 w-8 text-positive" />
              </div>
              <h1 className="font-display text-xl font-bold text-gray-900">
                You&apos;re partners!
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                You and{" "}
                <span className="font-semibold text-gray-900">
                  {displayName}
                </span>{" "}
                can now see each other&apos;s progress and send nudges.
              </p>
            </div>
            <Button
              type="button"
              variant="primary"
              fullWidth
              onClick={() => router.push("/partners")}
            >
              Go to Partners
            </Button>
          </Card>
        )}

        {/* Declined */}
        {state === "declined" && (
          <Card className="space-y-6 text-center">
            <div className="flex flex-col items-center">
              <p className="text-sm text-gray-500">
                Invite declined. No worries.
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => router.push("/scorecard")}
            >
              Back to Scorecard
            </Button>
          </Card>
        )}

        {/* Error: self invite */}
        {state === "error_self" && (
          <Card className="space-y-6 text-center">
            <div className="flex flex-col items-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <AlertCircle className="h-8 w-8 text-gray-400" />
              </div>
              <h1 className="font-display text-lg font-bold text-gray-900">
                This is your own invite
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                You can&apos;t partner with yourself. Share this link with
                someone else!
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => router.push("/partners")}
            >
              Back to Partners
            </Button>
          </Card>
        )}

        {/* Error: already partners */}
        {state === "error_already_partners" && (
          <Card className="space-y-6 text-center">
            <div className="flex flex-col items-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50">
                <UserCheck className="h-8 w-8 text-primary" />
              </div>
              <h1 className="font-display text-lg font-bold text-gray-900">
                Already partners
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                You already have an active partnership with this person.
              </p>
            </div>
            <Button
              type="button"
              variant="primary"
              fullWidth
              onClick={() => router.push("/partners")}
            >
              Go to Partners
            </Button>
          </Card>
        )}

        {/* Error: invite used by someone else */}
        {state === "error_used" && (
          <Card className="space-y-6 text-center">
            <div className="flex flex-col items-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
                <XCircle className="h-8 w-8 text-negative" />
              </div>
              <h1 className="font-display text-lg font-bold text-gray-900">
                Invite already used
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                This invite has already been accepted by someone else.
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => router.push("/partners")}
            >
              Back to Partners
            </Button>
          </Card>
        )}

        {/* Error: not found / expired */}
        {state === "error_not_found" && (
          <Card className="space-y-6 text-center">
            <div className="flex flex-col items-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
                <XCircle className="h-8 w-8 text-negative" />
              </div>
              <h1 className="font-display text-lg font-bold text-gray-900">
                Invite not found
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                This invite link is invalid, expired, or has been cancelled.
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => router.push("/scorecard")}
            >
              Back to Scorecard
            </Button>
          </Card>
        )}

        {/* Error: generic */}
        {state === "error_generic" && (
          <Card className="space-y-6 text-center">
            <div className="flex flex-col items-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
                <XCircle className="h-8 w-8 text-negative" />
              </div>
              <h1 className="font-display text-lg font-bold text-gray-900">
                Something went wrong
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                Please try again or ask your partner to send a new invite.
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => router.push("/scorecard")}
            >
              Back to Scorecard
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
