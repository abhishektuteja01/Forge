import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { IdentityCard } from "../IdentityCard";
import { IdentityForm } from "../IdentityForm";
import { VoteCounter } from "../VoteCounter";
import type { IdentityWithDetails } from "@/types/identity";
import type { Routine } from "@/types/database";

// ─── Factories ───────────────────────────────────────────

function makeRoutine(overrides: Partial<Routine> = {}): Routine {
  return {
    id: "r1",
    user_id: "u1",
    name: "Read",
    tag: "positive",
    time_of_day: "evening",
    sort_order: 0,
    archived_at: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

function makeIdentity(
  overrides: Partial<IdentityWithDetails> = {}
): IdentityWithDetails {
  return {
    id: "i1",
    user_id: "u1",
    statement: "I am someone who reads daily",
    archived_at: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    linked_routines: [makeRoutine({ id: "r1", name: "Read" })],
    total_votes: 15,
    votes_this_week: 5,
    votes_today: 1,
    vote_history: [
      { date: "2026-03-05", count: 0 },
      { date: "2026-03-06", count: 1 },
      { date: "2026-03-07", count: 1 },
      { date: "2026-03-08", count: 0 },
      { date: "2026-03-09", count: 1 },
      { date: "2026-03-10", count: 1 },
      { date: "2026-03-11", count: 1 },
    ],
    ...overrides,
  };
}

// ─── IdentityCard ────────────────────────────────────────

describe("IdentityCard", () => {
  const defaultProps = {
    identity: makeIdentity(),
    onEdit: vi.fn(),
    onManageLinks: vi.fn(),
    onDelete: vi.fn(),
  };

  it("renders identity statement in quotes", () => {
    render(<IdentityCard {...defaultProps} />);
    expect(
      screen.getByText(/I am someone who reads daily/)
    ).toBeInTheDocument();
  });

  it("shows weekly progress percentage", () => {
    // 1 linked routine × 7 days = 7 max, 5 votes this week = 71%
    render(<IdentityCard {...defaultProps} />);
    expect(screen.getByText(/5\/7 votes/)).toBeInTheDocument();
  });

  it("renders linked routine chips", () => {
    render(<IdentityCard {...defaultProps} />);
    expect(screen.getByText("Read")).toBeInTheDocument();
  });

  it("shows 'Link habits' button when no routines linked", () => {
    const identity = makeIdentity({ linked_routines: [] });
    render(<IdentityCard {...defaultProps} identity={identity} />);
    expect(screen.getByText(/Link habits to start voting/)).toBeInTheDocument();
  });

  it("opens menu on kebab click", () => {
    render(<IdentityCard {...defaultProps} />);
    fireEvent.click(screen.getByLabelText("Identity options"));
    expect(screen.getByText("Edit statement")).toBeInTheDocument();
    expect(screen.getByText("Manage linked habits")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  it("calls onEdit when edit is clicked", () => {
    const onEdit = vi.fn();
    render(<IdentityCard {...defaultProps} onEdit={onEdit} />);
    fireEvent.click(screen.getByLabelText("Identity options"));
    fireEvent.click(screen.getByText("Edit statement"));
    expect(onEdit).toHaveBeenCalledWith(defaultProps.identity);
  });

  it("calls onDelete when delete is clicked", () => {
    const onDelete = vi.fn();
    render(<IdentityCard {...defaultProps} onDelete={onDelete} />);
    fireEvent.click(screen.getByLabelText("Identity options"));
    fireEvent.click(screen.getByText("Delete"));
    expect(onDelete).toHaveBeenCalledWith("i1");
  });

  it("calls onManageLinks when clicked", () => {
    const onManageLinks = vi.fn();
    render(<IdentityCard {...defaultProps} onManageLinks={onManageLinks} />);
    fireEvent.click(screen.getByLabelText("Identity options"));
    fireEvent.click(screen.getByText("Manage linked habits"));
    expect(onManageLinks).toHaveBeenCalledWith(defaultProps.identity);
  });
});

// ─── IdentityForm ────────────────────────────────────────

describe("IdentityForm", () => {
  const routines = [
    makeRoutine({ id: "r1", name: "Read" }),
    makeRoutine({ id: "r2", name: "Exercise", tag: "positive" }),
  ];

  it("renders create mode with empty input and routine picker", () => {
    render(
      <IdentityForm mode="create" routines={routines} onClose={() => {}} />
    );
    expect(screen.getByText("Identity statement")).toBeInTheDocument();
    expect(
      screen.getByText("Link habits to this identity")
    ).toBeInTheDocument();
    expect(screen.getByText("Read")).toBeInTheDocument();
    expect(screen.getByText("Exercise")).toBeInTheDocument();
    expect(screen.getByText("Create Identity")).toBeInTheDocument();
  });

  it("renders edit mode with pre-filled statement", () => {
    const identity = makeIdentity({ statement: "I am healthy" });
    render(
      <IdentityForm
        mode="edit"
        identity={identity}
        routines={routines}
        onClose={() => {}}
      />
    );
    const input = screen.getByDisplayValue("I am healthy");
    expect(input).toBeInTheDocument();
    expect(screen.getByText("Save Changes")).toBeInTheDocument();
  });

  it("renders links mode with routine picker only", () => {
    const identity = makeIdentity();
    render(
      <IdentityForm
        mode="links"
        identity={identity}
        routines={routines}
        onClose={() => {}}
      />
    );
    // Should NOT show statement input
    expect(screen.queryByText("Identity statement")).not.toBeInTheDocument();
    // Should show routine picker
    expect(
      screen.getByText("Link habits to this identity")
    ).toBeInTheDocument();
    expect(screen.getByText("Update Links")).toBeInTheDocument();
  });

  it("calls onClose when Cancel is clicked", () => {
    const onClose = vi.fn();
    render(
      <IdentityForm mode="create" routines={routines} onClose={onClose} />
    );
    fireEvent.click(screen.getByText("Cancel"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("shows selected count when routines are toggled", () => {
    render(
      <IdentityForm mode="create" routines={routines} onClose={() => {}} />
    );
    expect(screen.getByText("0 habits selected")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Read"));
    expect(screen.getByText("1 habit selected")).toBeInTheDocument();
  });

  it("shows empty state when no routines exist", () => {
    render(<IdentityForm mode="create" routines={[]} onClose={() => {}} />);
    expect(screen.getByText(/No routines yet/)).toBeInTheDocument();
  });

  it("calls onSubmitCreate with statement and routine ids", async () => {
    const onSubmitCreate = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();
    render(
      <IdentityForm
        mode="create"
        routines={routines}
        onSubmitCreate={onSubmitCreate}
        onClose={onClose}
      />
    );

    fireEvent.change(screen.getByPlaceholderText(/I am someone/), {
      target: { value: "I am a morning person" },
    });
    fireEvent.click(screen.getByText("Read"));
    fireEvent.click(screen.getByText("Create Identity"));

    await waitFor(() => {
      expect(onSubmitCreate).toHaveBeenCalledWith("I am a morning person", [
        "r1",
      ]);
    });
    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it("calls onSubmitEdit with id and statement", async () => {
    const onSubmitEdit = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();
    const identity = makeIdentity({ id: "i1", statement: "I am healthy" });
    render(
      <IdentityForm
        mode="edit"
        identity={identity}
        routines={routines}
        onSubmitEdit={onSubmitEdit}
        onClose={onClose}
      />
    );

    fireEvent.change(screen.getByDisplayValue("I am healthy"), {
      target: { value: "I am very healthy" },
    });
    fireEvent.click(screen.getByText("Save Changes"));

    await waitFor(() => {
      expect(onSubmitEdit).toHaveBeenCalledWith("i1", "I am very healthy");
    });
  });

  it("calls onSubmitLinks with identity id and selected routine ids", async () => {
    const onSubmitLinks = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();
    const identity = makeIdentity({ id: "i1", linked_routines: [] });
    render(
      <IdentityForm
        mode="links"
        identity={identity}
        routines={routines}
        onSubmitLinks={onSubmitLinks}
        onClose={onClose}
      />
    );

    fireEvent.click(screen.getByText("Exercise"));
    fireEvent.click(screen.getByText("Update Links"));

    await waitFor(() => {
      expect(onSubmitLinks).toHaveBeenCalledWith("i1", ["r2"]);
    });
  });

  it("shows error when creating with empty statement", async () => {
    const onSubmitCreate = vi.fn();
    render(
      <IdentityForm
        mode="create"
        routines={routines}
        onSubmitCreate={onSubmitCreate}
        onClose={() => {}}
      />
    );

    fireEvent.click(screen.getByText("Create Identity"));

    await waitFor(() => {
      expect(
        screen.getByText("Identity statement is required")
      ).toBeInTheDocument();
    });
    expect(onSubmitCreate).not.toHaveBeenCalled();
  });
});

// ─── VoteCounter ─────────────────────────────────────────

describe("VoteCounter", () => {
  const defaultHistory = [
    { date: "2026-03-05", count: 0 },
    { date: "2026-03-06", count: 1 },
    { date: "2026-03-07", count: 2 },
    { date: "2026-03-08", count: 0 },
    { date: "2026-03-09", count: 1 },
    { date: "2026-03-10", count: 1 },
    { date: "2026-03-11", count: 3 },
  ];

  it("renders total vote count", () => {
    render(
      <VoteCounter
        totalVotes={42}
        votesToday={0}
        voteHistory={defaultHistory}
      />
    );
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("votes")).toBeInTheDocument();
  });

  it("shows singular 'vote' for count of 1", () => {
    render(
      <VoteCounter totalVotes={1} votesToday={0} voteHistory={defaultHistory} />
    );
    expect(screen.getByText("vote")).toBeInTheDocument();
  });

  it("shows +N today badge when votesToday > 0", () => {
    render(
      <VoteCounter
        totalVotes={10}
        votesToday={3}
        voteHistory={defaultHistory}
      />
    );
    expect(screen.getByText("+3 today")).toBeInTheDocument();
  });

  it("hides today badge when votesToday is 0", () => {
    render(
      <VoteCounter
        totalVotes={10}
        votesToday={0}
        voteHistory={defaultHistory}
      />
    );
    expect(screen.queryByText(/today/)).not.toBeInTheDocument();
  });

  it("renders Last 7 days label", () => {
    render(
      <VoteCounter totalVotes={5} votesToday={1} voteHistory={defaultHistory} />
    );
    expect(screen.getByText("Last 7 days")).toBeInTheDocument();
  });

  it("renders 7 day labels", () => {
    render(
      <VoteCounter totalVotes={5} votesToday={1} voteHistory={defaultHistory} />
    );
    // 7 day labels should be rendered (S, M, T, W, T, F, S pattern)
    const dayLabels = screen.getAllByText(/^[SMTWF]$/);
    expect(dayLabels).toHaveLength(7);
  });
});
