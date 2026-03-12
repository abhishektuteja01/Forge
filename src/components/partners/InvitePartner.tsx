"use client";

import { useState, useCallback } from "react";
import { Link2, Check, Copy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface InvitePartnerProps {
  onGenerateLink: () => Promise<string>;
}

export function InvitePartner({ onGenerateLink }: InvitePartnerProps) {
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const url = await onGenerateLink();
      setInviteUrl(url);

      // Auto-copy to clipboard
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch {
        // Ignored if clipboard fails (e.g. non-HTTPS localhost)
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to generate invite link";
      setError(message);
      console.error("InvitePartner error:", err);
    } finally {
      setLoading(false);
    }
  }, [onGenerateLink]);

  const handleCopyAgain = useCallback(async () => {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback: select the text so user can manually copy
      setError("Couldn't copy automatically. Select the link and copy it.");
    }
  }, [inviteUrl]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">
          Invite a Partner
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Share a link with someone you trust. They&apos;ll be able to see your
          progress and send you encouragement.
        </p>
      </div>

      {error && <p className="text-sm font-medium text-negative">{error}</p>}

      {!inviteUrl ? (
        <Button
          type="button"
          variant="primary"
          onClick={handleGenerate}
          loading={loading}
          className="gap-2"
        >
          <Link2 className="h-4 w-4" />
          Generate Invite Link
        </Button>
      ) : (
        <div className="space-y-3">
          {/* Show the generated link */}
          <div className="flex items-center gap-2 rounded-xl border border-border bg-gray-50 px-4 py-3">
            <span className="min-w-0 flex-1 truncate text-sm text-gray-700">
              {inviteUrl}
            </span>
            <button
              type="button"
              onClick={handleCopyAgain}
              className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-indigo-50"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </>
              )}
            </button>
          </div>

          {/* Generate another */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-primary"
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Link2 className="h-3.5 w-3.5" />
            )}
            Generate new link
          </button>
        </div>
      )}
    </div>
  );
}
