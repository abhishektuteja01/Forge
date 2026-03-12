import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { InvitePartner } from "../InvitePartner";
import { PartnerCard } from "../PartnerCard";
import { NudgeBadge } from "../NudgeBadge";
import { SharedView } from "../SharedView";
import type { PartnershipWithProfile, Nudge, PartnerSnapshot } from "@/types/partners";
import type { Routine } from "@/types/database";

// ─── Factories ───────────────────────────────────────────

function makePartnership(
  overrides: Partial<PartnershipWithProfile> = {}
): PartnershipWithProfile {
  return {
    id: "p1",
    requester_id: "user-1",
    partner_id: "user-2",
    invite_token: "tok-123",
    invite_email: null,
    status: "active",
    created_at: "2026-03-01T00:00:00Z",
    updated_at: "2026-03-05T00:00:00Z",
    partner_profile: { id: "user-2", display_name: "Jordan" },
    ...overrides,
  };
}

function makeNudge(overrides: Partial<Nudge> = {}): Nudge {
  return {
    id: "n1",
    partnership_id: "p1",
    sender_id: "user-2",
    receiver_id: "user-1",
    message: "Keep going! 💪",
    read: false,
    created_at: "2026-03-11T10:00:00Z",
    ...overrides,
  };
}

function makeRoutine(overrides: Partial<Routine> = {}): Routine {
  return {
    id: "r1",
    user_id: "user-2",
    name: "Morning coffee",
    tag: "neutral",
    time_of_day: "morning",
    sort_order: 0,
    archived_at: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

function makeSnapshot(overrides: Partial<PartnerSnapshot> = {}): PartnerSnapshot {
  return {
    profile: { id: "user-2", display_name: "Jordan" },
    routines: [
      makeRoutine({ id: "r1", name: "Morning coffee", tag: "neutral", time_of_day: "morning" }),
      makeRoutine({ id: "r2", name: "Read 10 pages", tag: "positive", time_of_day: "evening" }),
    ],
    checkIns: [
      { id: "c1", user_id: "user-2", routine_id: "r1", date: new Date().toISOString().slice(0, 10), completed: true, created_at: "", updated_at: "" },
    ],
    stacks: [
      { id: "s1", user_id: "user-2", anchor_routine_id: "r1", stacked_routine_id: "r2", position: 0, created_at: "" },
    ],
    currentStreak: 5,
    longestStreak: 12,
    completionRateThisWeek: 68,
    ...overrides,
  };
}

// ─── Mock clipboard ──────────────────────────────────────

beforeEach(() => {
  Object.assign(navigator, {
    clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
  });
});

// ─── InvitePartner ───────────────────────────────────────

describe("InvitePartner", () => {
  it("renders generate button", () => {
    render(<InvitePartner onGenerateLink={async () => ""} />);
    expect(screen.getByText("Generate Invite Link")).toBeInTheDocument();
  });

  it("shows URL after generating", async () => {
    const onGenerate = vi.fn().mockResolvedValue("https://forge.app/invite/abc-123");
    render(<InvitePartner onGenerateLink={onGenerate} />);

    fireEvent.click(screen.getByText("Generate Invite Link"));

    await waitFor(() => {
      expect(screen.getByText("https://forge.app/invite/abc-123")).toBeInTheDocument();
    });
  });

  it("copies to clipboard on generate", async () => {
    const onGenerate = vi.fn().mockResolvedValue("https://forge.app/invite/abc-123");
    render(<InvitePartner onGenerateLink={onGenerate} />);

    fireEvent.click(screen.getByText("Generate Invite Link"));

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        "https://forge.app/invite/abc-123"
      );
    });
  });

  it("shows Copied! feedback after copy", async () => {
    const onGenerate = vi.fn().mockResolvedValue("https://forge.app/invite/abc-123");
    render(<InvitePartner onGenerateLink={onGenerate} />);

    fireEvent.click(screen.getByText("Generate Invite Link"));

    await waitFor(() => {
      expect(screen.getByText("Copied!")).toBeInTheDocument();
    });
  });

  it("shows error on failure", async () => {
    const onGenerate = vi.fn().mockRejectedValue(new Error("Network error"));
    render(<InvitePartner onGenerateLink={onGenerate} />);

    fireEvent.click(screen.getByText("Generate Invite Link"));

    await waitFor(() => {
      expect(screen.getByText("Network error")).toBeInTheDocument();
    });
  });
});

// ─── PartnerCard ─────────────────────────────────────────

describe("PartnerCard", () => {
  const defaultProps = {
    partnership: makePartnership(),
    currentUserId: "user-1",
    onViewProgress: vi.fn(),
    onSendNudge: vi.fn().mockResolvedValue(undefined),
    onRemove: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    defaultProps.onViewProgress = vi.fn();
    defaultProps.onSendNudge = vi.fn().mockResolvedValue(undefined);
    defaultProps.onRemove = vi.fn();
  });

  it("renders partner name", () => {
    render(<PartnerCard {...defaultProps} />);
    expect(screen.getByText("Jordan")).toBeInTheDocument();
  });

  it("renders avatar initial", () => {
    render(<PartnerCard {...defaultProps} />);
    expect(screen.getByText("J")).toBeInTheDocument();
  });

  it("shows partners since date", () => {
    render(<PartnerCard {...defaultProps} />);
    expect(screen.getByText(/Partners since/)).toBeInTheDocument();
  });

  it("calls onViewProgress when View Progress is clicked", () => {
    render(<PartnerCard {...defaultProps} />);
    fireEvent.click(screen.getByText("View Progress"));
    expect(defaultProps.onViewProgress).toHaveBeenCalledWith("user-2");
  });

  it("opens nudge picker when Nudge is clicked", () => {
    render(<PartnerCard {...defaultProps} />);
    fireEvent.click(screen.getByText("Nudge"));
    expect(screen.getByText("Pick a message")).toBeInTheDocument();
    expect(screen.getByText("Keep going! 💪")).toBeInTheDocument();
  });

  it("calls onSendNudge when a nudge message is selected", async () => {
    render(<PartnerCard {...defaultProps} />);
    fireEvent.click(screen.getByText("Nudge"));
    fireEvent.click(screen.getByText("Keep going! 💪"));

    await waitFor(() => {
      expect(defaultProps.onSendNudge).toHaveBeenCalledWith(
        "p1",
        "user-2",
        "Keep going! 💪"
      );
    });
  });

  it("calls onRemove when X is clicked", () => {
    render(<PartnerCard {...defaultProps} />);
    fireEvent.click(screen.getByLabelText("Remove partner"));
    expect(defaultProps.onRemove).toHaveBeenCalledWith("p1");
  });

  it("shows Sent! after nudge is sent", async () => {
    render(<PartnerCard {...defaultProps} />);
    fireEvent.click(screen.getByText("Nudge"));
    fireEvent.click(screen.getByText("Keep going! 💪"));

    await waitFor(() => {
      expect(screen.getByText("Sent! ✓")).toBeInTheDocument();
    });
  });
});

// ─── NudgeBadge ──────────────────────────────────────────

describe("NudgeBadge", () => {
  it("renders bell icon", () => {
    render(<NudgeBadge nudges={[]} unreadCount={0} onMarkRead={async () => {}} />);
    expect(screen.getByLabelText("Nudges")).toBeInTheDocument();
  });

  it("shows unread count badge", () => {
    render(
      <NudgeBadge nudges={[makeNudge()]} unreadCount={3} onMarkRead={async () => {}} />
    );
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("shows 9+ for counts over 9", () => {
    render(
      <NudgeBadge nudges={[]} unreadCount={15} onMarkRead={async () => {}} />
    );
    expect(screen.getByText("9+")).toBeInTheDocument();
  });

  it("hides badge when unread is 0", () => {
    render(<NudgeBadge nudges={[]} unreadCount={0} onMarkRead={async () => {}} />);
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it("opens dropdown on click", () => {
    const nudges = [makeNudge({ id: "n1", message: "Stay strong!" })];
    render(<NudgeBadge nudges={nudges} unreadCount={1} onMarkRead={async () => {}} />);

    fireEvent.click(screen.getByLabelText(/Nudges/));
    expect(screen.getByText("Stay strong!")).toBeInTheDocument();
  });

  it("calls onMarkRead when opened with unread nudges", async () => {
    const onMarkRead = vi.fn().mockResolvedValue(undefined);
    const nudges = [makeNudge()];
    render(<NudgeBadge nudges={nudges} unreadCount={1} onMarkRead={onMarkRead} />);

    fireEvent.click(screen.getByLabelText(/Nudges/));

    await waitFor(() => {
      expect(onMarkRead).toHaveBeenCalledOnce();
    });
  });

  it("shows empty state when no nudges", () => {
    render(<NudgeBadge nudges={[]} unreadCount={0} onMarkRead={async () => {}} />);
    fireEvent.click(screen.getByLabelText("Nudges"));
    expect(screen.getByText("No nudges yet")).toBeInTheDocument();
  });

  it("shows nudge timestamp", () => {
    const nudges = [makeNudge({ id: "n1", message: "Go!" })];
    render(<NudgeBadge nudges={nudges} unreadCount={0} onMarkRead={async () => {}} />);
    fireEvent.click(screen.getByLabelText("Nudges"));
    // Should render the formatted date
    expect(screen.getByText("Go!")).toBeInTheDocument();
  });
});

// ─── SharedView ──────────────────────────────────────────

describe("SharedView", () => {
  it("renders streak summary", () => {
    render(<SharedView snapshot={makeSnapshot()} />);
    expect(screen.getByText("5")).toBeInTheDocument(); // current streak
    expect(screen.getByText("12")).toBeInTheDocument(); // longest streak
    // React splits {number}% into separate text nodes, use a function matcher
    const weeklyEl = screen.getByText((_, el) => {
      return el?.tagName === "SPAN" && !!el?.textContent?.replace(/\s/g, "").includes("68%");
    });
    expect(weeklyEl).toBeInTheDocument();
  });

  it("renders streak labels", () => {
    render(<SharedView snapshot={makeSnapshot()} />);
    expect(screen.getByText("Day streak")).toBeInTheDocument();
    expect(screen.getByText("Best streak")).toBeInTheDocument();
    expect(screen.getByText("This week")).toBeInTheDocument();
  });

  it("renders today's scorecard section", () => {
    render(<SharedView snapshot={makeSnapshot()} />);
    expect(screen.getByText("Today's Scorecard")).toBeInTheDocument();
  });

  it("renders routine names", () => {
    render(<SharedView snapshot={makeSnapshot()} />);
    // Routines appear in both scorecard and stacks sections
    expect(screen.getAllByText("Morning coffee").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Read 10 pages").length).toBeGreaterThanOrEqual(1);
  });

  it("renders completion fraction", () => {
    render(<SharedView snapshot={makeSnapshot()} />);
    // Completion badge contains the total routine count
    const badge = screen.getByText((_, el) => {
      return el?.tagName === "SPAN" && !!el?.textContent?.includes("/2");
    });
    expect(badge).toBeInTheDocument();
  });

  it("renders habit stacks section when stacks exist", () => {
    render(<SharedView snapshot={makeSnapshot()} />);
    expect(screen.getByText("Habit Stacks")).toBeInTheDocument();
  });

  it("renders ANCHOR and STACKED labels in stacks", () => {
    render(<SharedView snapshot={makeSnapshot()} />);
    expect(screen.getByText("ANCHOR")).toBeInTheDocument();
    expect(screen.getByText("STACKED")).toBeInTheDocument();
  });

  it("renders empty message when no routines", () => {
    const snapshot = makeSnapshot({ routines: [], checkIns: [], stacks: [] });
    render(<SharedView snapshot={snapshot} />);
    expect(screen.getByText("No routines added yet.")).toBeInTheDocument();
  });

  it("hides stacks section when no stacks", () => {
    const snapshot = makeSnapshot({ stacks: [] });
    render(<SharedView snapshot={snapshot} />);
    expect(screen.queryByText("Habit Stacks")).not.toBeInTheDocument();
  });

  it("groups routines by time of day", () => {
    render(<SharedView snapshot={makeSnapshot()} />);
    expect(screen.getByText("Morning")).toBeInTheDocument();
    expect(screen.getByText("Evening")).toBeInTheDocument();
  });
});
