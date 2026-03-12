import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { StackCard } from "../StackCard";
import { StackBuilder } from "../StackBuilder";
import type { StackChain } from "@/types/stacks";
import type { Routine } from "@/types/database";

// ─── Factories ───────────────────────────────────────────

function makeRoutine(overrides: Partial<Routine> = {}): Routine {
  return {
    id: "r1",
    user_id: "u1",
    name: "Test Routine",
    tag: "positive",
    time_of_day: "morning",
    sort_order: 0,
    archived_at: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

function makeChain(): StackChain {
  return {
    anchor: makeRoutine({ id: "r1", name: "Morning coffee", tag: "neutral" }),
    steps: [
      {
        stack: {
          id: "s1",
          user_id: "u1",
          anchor_routine_id: "r1",
          stacked_routine_id: "r2",
          position: 0,
          created_at: "2026-01-01T00:00:00Z",
        },
        routine: makeRoutine({ id: "r2", name: "Journal", tag: "positive" }),
      },
    ],
  };
}

// ─── StackCard ───────────────────────────────────────────

describe("StackCard", () => {
  it("renders anchor routine name", () => {
    render(<StackCard chain={makeChain()} onDelete={() => {}} />);
    expect(screen.getByText("Morning coffee")).toBeInTheDocument();
  });

  it("renders stacked routine name", () => {
    render(<StackCard chain={makeChain()} onDelete={() => {}} />);
    expect(screen.getByText("Journal")).toBeInTheDocument();
  });

  it("shows ANCHOR and STACKED labels", () => {
    render(<StackCard chain={makeChain()} onDelete={() => {}} />);
    expect(screen.getByText("ANCHOR")).toBeInTheDocument();
    expect(screen.getByText("STACKED")).toBeInTheDocument();
  });

  it("shows connector text", () => {
    render(<StackCard chain={makeChain()} onDelete={() => {}} />);
    expect(screen.getByText("then I will...")).toBeInTheDocument();
  });

  it("opens menu on kebab button click", () => {
    render(<StackCard chain={makeChain()} onDelete={() => {}} />);
    fireEvent.click(screen.getByLabelText("Stack options"));
    expect(screen.getByText("Delete stack")).toBeInTheDocument();
  });

  it("calls onDelete with stack id when delete is clicked", () => {
    const onDelete = vi.fn();
    render(<StackCard chain={makeChain()} onDelete={onDelete} />);
    fireEvent.click(screen.getByLabelText("Stack options"));
    fireEvent.click(screen.getByText("Delete stack"));
    expect(onDelete).toHaveBeenCalledWith("s1");
  });

  it("renders multiple steps in a chain", () => {
    const chain: StackChain = {
      ...makeChain(),
      steps: [
        {
          stack: { id: "s1", user_id: "u1", anchor_routine_id: "r1", stacked_routine_id: "r2", position: 0, created_at: "" },
          routine: makeRoutine({ id: "r2", name: "Journal" }),
        },
        {
          stack: { id: "s2", user_id: "u1", anchor_routine_id: "r1", stacked_routine_id: "r3", position: 1, created_at: "" },
          routine: makeRoutine({ id: "r3", name: "Stretch" }),
        },
      ],
    };
    render(<StackCard chain={chain} onDelete={() => {}} />);
    expect(screen.getByText("Journal")).toBeInTheDocument();
    expect(screen.getByText("Stretch")).toBeInTheDocument();
  });
});

// ─── StackBuilder ────────────────────────────────────────

describe("StackBuilder", () => {
  const routines = [
    makeRoutine({ id: "r1", name: "Morning coffee", tag: "neutral" }),
    makeRoutine({ id: "r2", name: "Read 10 pages", tag: "positive" }),
    makeRoutine({ id: "r3", name: "Exercise", tag: "positive" }),
  ];

  it("renders anchor picker with routine names", () => {
    render(
      <StackBuilder routines={routines} onSubmit={async () => {}} onClose={() => {}} />
    );
    expect(screen.getByText("Morning coffee")).toBeInTheDocument();
    expect(screen.getByText("Read 10 pages")).toBeInTheDocument();
    expect(screen.getByText("Exercise")).toBeInTheDocument();
  });

  it("shows step 2 after anchor is selected", () => {
    render(
      <StackBuilder routines={routines} onSubmit={async () => {}} onClose={() => {}} />
    );
    // Step 2 shouldn't be visible yet
    expect(screen.queryByText("2. Stack a habit on top")).not.toBeInTheDocument();

    // Select anchor
    fireEvent.click(screen.getByText("Morning coffee"));

    // Step 2 should now appear
    expect(screen.getByText("2. Stack a habit on top")).toBeInTheDocument();
  });

  it("filters stacked picker to exclude selected anchor", () => {
    render(
      <StackBuilder routines={routines} onSubmit={async () => {}} onClose={() => {}} />
    );
    // Select anchor
    fireEvent.click(screen.getByText("Morning coffee"));

    // In the stacked picker, Morning coffee should NOT appear
    // But Read 10 pages and Exercise should
    const buttons = screen.getAllByText("Read 10 pages");
    expect(buttons.length).toBeGreaterThanOrEqual(1);

    // Morning coffee appears once (in the anchor list), not in stacked
    const coffeeButtons = screen.getAllByText("Morning coffee");
    expect(coffeeButtons).toHaveLength(1);
  });

  it("shows preview when both anchor and stacked are selected", () => {
    render(
      <StackBuilder routines={routines} onSubmit={async () => {}} onClose={() => {}} />
    );
    // Select anchor
    fireEvent.click(screen.getByText("Morning coffee"));
    // Select stacked — multiple "Read 10 pages" exist (anchor list + stacked list)
    const readButtons = screen.getAllByText("Read 10 pages");
    fireEvent.click(readButtons[readButtons.length - 1]);

    // Preview should show
    expect(screen.getByText(/After I/)).toBeInTheDocument();
  });

  it("calls onClose when Cancel is clicked", () => {
    const onClose = vi.fn();
    render(
      <StackBuilder routines={routines} onSubmit={async () => {}} onClose={onClose} />
    );
    fireEvent.click(screen.getByText("Cancel"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("shows empty state when no routines", () => {
    render(
      <StackBuilder routines={[]} onSubmit={async () => {}} onClose={() => {}} />
    );
    expect(screen.getByText(/No routines yet/)).toBeInTheDocument();
  });

  it("calls onSubmit with existing mode data and closes", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();
    render(
      <StackBuilder routines={routines} onSubmit={onSubmit} onClose={onClose} />
    );

    // Select anchor
    fireEvent.click(screen.getByText("Morning coffee"));
    // Select stacked
    const readButtons = screen.getAllByText("Read 10 pages");
    fireEvent.click(readButtons[readButtons.length - 1]);
    // Submit
    fireEvent.click(screen.getByText("Create Stack"));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        mode: "existing",
        anchorRoutineId: "r1",
        stackedRoutineId: "r2",
      });
    });
    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it("switches to new routine mode and shows form fields", () => {
    render(
      <StackBuilder routines={routines} onSubmit={async () => {}} onClose={() => {}} />
    );
    // Select anchor first
    fireEvent.click(screen.getByText("Morning coffee"));
    // Switch to "Create new" mode
    fireEvent.click(screen.getByText("Create new"));

    expect(screen.getByText("Habit name")).toBeInTheDocument();
    expect(screen.getByText("Tag")).toBeInTheDocument();
    expect(screen.getByText("Time of day")).toBeInTheDocument();
  });

  it("calls onSubmit with new mode data", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();
    render(
      <StackBuilder routines={routines} onSubmit={onSubmit} onClose={onClose} />
    );

    // Select anchor
    fireEvent.click(screen.getByText("Morning coffee"));
    // Switch to new mode
    fireEvent.click(screen.getByText("Create new"));
    // Fill in new routine
    fireEvent.change(screen.getByPlaceholderText(/Journal 2 min/), {
      target: { value: "Stretch" },
    });
    // Submit
    fireEvent.click(screen.getByText("Create Stack"));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        mode: "new",
        anchorRoutineId: "r1",
        newRoutine: {
          name: "Stretch",
          tag: "positive",
          time_of_day: null,
        },
      });
    });
  });

  it("shows error when onSubmit rejects", async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error("Failed to create"));
    render(
      <StackBuilder routines={routines} onSubmit={onSubmit} onClose={() => {}} />
    );

    fireEvent.click(screen.getByText("Morning coffee"));
    const readButtons = screen.getAllByText("Read 10 pages");
    fireEvent.click(readButtons[readButtons.length - 1]);
    fireEvent.click(screen.getByText("Create Stack"));

    await waitFor(() => {
      expect(screen.getByText("Failed to create")).toBeInTheDocument();
    });
  });
});
