import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ScorecardSummary } from "../ScorecardSummary";
import { DateNavigator } from "../DateNavigator";
import { RoutineGroup } from "../RoutineGroup";
import { RoutineItem } from "../RoutineItem";
import { AddRoutineForm } from "../AddRoutineForm";
import type { Routine, CheckIn } from "@/types/database";

// ─── Factories ───────────────────────────────────────────

function makeRoutine(overrides: Partial<Routine> = {}): Routine {
  return {
    id: "r1",
    user_id: "u1",
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

function makeCheckIn(overrides: Partial<CheckIn> = {}): CheckIn {
  return {
    id: "ci1",
    user_id: "u1",
    routine_id: "r1",
    date: "2026-03-11",
    completed: true,
    created_at: "2026-03-11T08:00:00Z",
    updated_at: "2026-03-11T08:00:00Z",
    ...overrides,
  };
}

// ─── ScorecardSummary ────────────────────────────────────

describe("ScorecardSummary", () => {
  it("renders completed count and total", () => {
    const routines = [
      makeRoutine({ id: "r1", tag: "positive" }),
      makeRoutine({ id: "r2", tag: "negative" }),
    ];
    const checkIns = new Map<string, CheckIn>();
    checkIns.set("r1", makeCheckIn({ routine_id: "r1", completed: true }));

    render(<ScorecardSummary routines={routines} checkIns={checkIns} />);
    expect(screen.getByText("1/2 done")).toBeInTheDocument();
  });

  it("shows Today's Progress label", () => {
    render(<ScorecardSummary routines={[]} checkIns={new Map()} />);
    expect(screen.getByText("Today's Progress")).toBeInTheDocument();
  });

  it("shows tag breakdown counts", () => {
    const routines = [
      makeRoutine({ id: "r1", tag: "positive" }),
      makeRoutine({ id: "r2", tag: "positive" }),
      makeRoutine({ id: "r3", tag: "negative" }),
      makeRoutine({ id: "r4", tag: "neutral" }),
    ];
    render(<ScorecardSummary routines={routines} checkIns={new Map()} />);
    expect(screen.getByText("2 positive")).toBeInTheDocument();
    expect(screen.getByText("1 negative")).toBeInTheDocument();
    expect(screen.getByText("1 neutral")).toBeInTheDocument();
  });

  it("shows 0/0 done when no routines", () => {
    render(<ScorecardSummary routines={[]} checkIns={new Map()} />);
    expect(screen.getByText("0/0 done")).toBeInTheDocument();
  });

  it("counts only completed check-ins", () => {
    const routines = [
      makeRoutine({ id: "r1" }),
      makeRoutine({ id: "r2" }),
    ];
    const checkIns = new Map<string, CheckIn>();
    checkIns.set("r1", makeCheckIn({ routine_id: "r1", completed: true }));
    checkIns.set("r2", makeCheckIn({ routine_id: "r2", completed: false }));

    render(<ScorecardSummary routines={routines} checkIns={checkIns} />);
    expect(screen.getByText("1/2 done")).toBeInTheDocument();
  });
});

// ─── DateNavigator ───────────────────────────────────────

describe("DateNavigator", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 2, 11)); // March 11, 2026
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows 'Today' when selected date is today", () => {
    render(<DateNavigator selectedDate="2026-03-11" onDateChange={() => {}} />);
    expect(screen.getByText("Today")).toBeInTheDocument();
  });

  it("shows 'Yesterday' for previous day", () => {
    render(<DateNavigator selectedDate="2026-03-10" onDateChange={() => {}} />);
    expect(screen.getByText("Yesterday")).toBeInTheDocument();
  });

  it("shows formatted date for other days", () => {
    render(<DateNavigator selectedDate="2026-03-08" onDateChange={() => {}} />);
    // Should not show "Yesterday" as the date label
    expect(screen.queryByText("Yesterday")).not.toBeInTheDocument();
    // "Today" appears as the jump button, not the date label — that's correct
    // The date label should be a formatted date like "Sun, Mar 8"
    expect(screen.getByText(/Mar/)).toBeInTheDocument();
  });

  it("calls onDateChange with previous day on left arrow", () => {
    const onChange = vi.fn();
    render(<DateNavigator selectedDate="2026-03-11" onDateChange={onChange} />);
    fireEvent.click(screen.getByLabelText("Previous day"));
    expect(onChange).toHaveBeenCalledWith("2026-03-10");
  });

  it("calls onDateChange with next day on right arrow", () => {
    const onChange = vi.fn();
    render(<DateNavigator selectedDate="2026-03-10" onDateChange={onChange} />);
    fireEvent.click(screen.getByLabelText("Next day"));
    expect(onChange).toHaveBeenCalledWith("2026-03-11");
  });

  it("disables next button when on today", () => {
    render(<DateNavigator selectedDate="2026-03-11" onDateChange={() => {}} />);
    expect(screen.getByLabelText("Next day")).toBeDisabled();
  });

  it("shows Today button when not on today", () => {
    render(<DateNavigator selectedDate="2026-03-09" onDateChange={() => {}} />);
    expect(screen.getByText("Today")).toBeInTheDocument();
  });

  it("hides Today button when on today", () => {
    render(<DateNavigator selectedDate="2026-03-11" onDateChange={() => {}} />);
    // "Today" appears as the date label, not as a separate button
    const todayElements = screen.getAllByText("Today");
    expect(todayElements).toHaveLength(1); // only the date label
  });
});

// ─── RoutineItem ─────────────────────────────────────────

describe("RoutineItem", () => {
  const defaultProps = {
    routine: makeRoutine({ id: "r1", name: "Exercise", tag: "positive" }),
    completed: false,
    onToggle: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    defaultProps.onToggle = vi.fn();
    defaultProps.onEdit = vi.fn();
    defaultProps.onDelete = vi.fn();
  });

  it("renders routine name", () => {
    render(<RoutineItem {...defaultProps} />);
    expect(screen.getByText("Exercise")).toBeInTheDocument();
  });

  it("renders tag badge", () => {
    render(<RoutineItem {...defaultProps} />);
    expect(screen.getByText("+")).toBeInTheDocument();
  });

  it("calls onToggle when checkbox is clicked", () => {
    render(<RoutineItem {...defaultProps} />);
    fireEvent.click(screen.getByLabelText(/Mark Exercise as done/));
    expect(defaultProps.onToggle).toHaveBeenCalledWith("r1");
  });

  it("shows strikethrough when completed", () => {
    render(<RoutineItem {...defaultProps} completed={true} />);
    const name = screen.getByText("Exercise");
    expect(name.className).toContain("line-through");
  });

  it("does not show strikethrough when not completed", () => {
    render(<RoutineItem {...defaultProps} completed={false} />);
    const name = screen.getByText("Exercise");
    expect(name.className).not.toContain("line-through");
  });

  it("opens menu on kebab click", () => {
    render(<RoutineItem {...defaultProps} />);
    fireEvent.click(screen.getByLabelText(/Options for Exercise/));
    expect(screen.getByText("Edit")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  it("calls onEdit when Edit is clicked", () => {
    render(<RoutineItem {...defaultProps} />);
    fireEvent.click(screen.getByLabelText(/Options for Exercise/));
    fireEvent.click(screen.getByText("Edit"));
    expect(defaultProps.onEdit).toHaveBeenCalledWith(defaultProps.routine);
  });

  it("calls onDelete when Delete is clicked", () => {
    render(<RoutineItem {...defaultProps} />);
    fireEvent.click(screen.getByLabelText(/Options for Exercise/));
    fireEvent.click(screen.getByText("Delete"));
    expect(defaultProps.onDelete).toHaveBeenCalledWith("r1");
  });

  it("renders negative tag badge", () => {
    const routine = makeRoutine({ tag: "negative" });
    render(<RoutineItem {...defaultProps} routine={routine} />);
    expect(screen.getByText("−")).toBeInTheDocument();
  });

  it("renders neutral tag badge", () => {
    const routine = makeRoutine({ tag: "neutral" });
    render(<RoutineItem {...defaultProps} routine={routine} />);
    expect(screen.getByText("=")).toBeInTheDocument();
  });
});

// ─── RoutineGroup ────────────────────────────────────────

describe("RoutineGroup", () => {
  const defaultProps = {
    label: "Morning",
    routines: [
      makeRoutine({ id: "r1", name: "Coffee" }),
      makeRoutine({ id: "r2", name: "Stretch" }),
    ],
    checkIns: new Map<string, CheckIn>(),
    onToggle: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
  };

  it("renders group label", () => {
    render(<RoutineGroup {...defaultProps} />);
    expect(screen.getByText("Morning")).toBeInTheDocument();
  });

  it("renders all routines in the group", () => {
    render(<RoutineGroup {...defaultProps} />);
    expect(screen.getByText("Coffee")).toBeInTheDocument();
    expect(screen.getByText("Stretch")).toBeInTheDocument();
  });

  it("renders nothing when routines array is empty", () => {
    const { container } = render(
      <RoutineGroup {...defaultProps} routines={[]} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("passes completed state from checkIns map", () => {
    const checkIns = new Map<string, CheckIn>();
    checkIns.set("r1", makeCheckIn({ routine_id: "r1", completed: true }));

    render(<RoutineGroup {...defaultProps} checkIns={checkIns} />);
    // Coffee's name should have line-through (completed)
    const coffee = screen.getByText("Coffee");
    expect(coffee.className).toContain("line-through");
    // Stretch should not (no check-in)
    const stretch = screen.getByText("Stretch");
    expect(stretch.className).not.toContain("line-through");
  });
});

// ─── AddRoutineForm ──────────────────────────────────────

describe("AddRoutineForm", () => {
  it("renders form fields", () => {
    render(
      <AddRoutineForm onSubmit={async () => {}} onClose={() => {}} />
    );
    expect(screen.getByText("Routine name")).toBeInTheDocument();
    expect(screen.getByText("How does this habit affect you?")).toBeInTheDocument();
    expect(screen.getByText("When do you usually do this?")).toBeInTheDocument();
  });

  it("shows Add Routine button in create mode", () => {
    render(
      <AddRoutineForm onSubmit={async () => {}} onClose={() => {}} />
    );
    expect(screen.getByText("Add Routine")).toBeInTheDocument();
  });

  it("shows Save Changes button in edit mode", () => {
    const routine = makeRoutine({ name: "Exercise" });
    render(
      <AddRoutineForm routine={routine} onSubmit={async () => {}} onClose={() => {}} />
    );
    expect(screen.getByText("Save Changes")).toBeInTheDocument();
  });

  it("pre-fills name in edit mode", () => {
    const routine = makeRoutine({ name: "Exercise" });
    render(
      <AddRoutineForm routine={routine} onSubmit={async () => {}} onClose={() => {}} />
    );
    expect(screen.getByDisplayValue("Exercise")).toBeInTheDocument();
  });

  it("renders all tag options", () => {
    render(
      <AddRoutineForm onSubmit={async () => {}} onClose={() => {}} />
    );
    expect(screen.getByText("Positive (+)")).toBeInTheDocument();
    expect(screen.getByText("Negative (−)")).toBeInTheDocument();
    expect(screen.getByText("Neutral (=)")).toBeInTheDocument();
  });

  it("renders all time of day options", () => {
    render(
      <AddRoutineForm onSubmit={async () => {}} onClose={() => {}} />
    );
    expect(screen.getByText("Morning")).toBeInTheDocument();
    expect(screen.getByText("Afternoon")).toBeInTheDocument();
    expect(screen.getByText("Evening")).toBeInTheDocument();
    expect(screen.getByText("Night")).toBeInTheDocument();
    expect(screen.getByText("No time")).toBeInTheDocument();
  });

  it("calls onClose when Cancel is clicked", () => {
    const onClose = vi.fn();
    render(
      <AddRoutineForm onSubmit={async () => {}} onClose={onClose} />
    );
    fireEvent.click(screen.getByText("Cancel"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("allows selecting a tag", () => {
    render(
      <AddRoutineForm onSubmit={async () => {}} onClose={() => {}} />
    );
    const positiveBtn = screen.getByText("Positive (+)");
    fireEvent.click(positiveBtn);
    // After click, the button should have the active class
    expect(positiveBtn.className).toContain("border-positive");
  });

  it("allows selecting a time of day", () => {
    render(
      <AddRoutineForm onSubmit={async () => {}} onClose={() => {}} />
    );
    const morningBtn = screen.getByText("Morning");
    fireEvent.click(morningBtn);
    expect(morningBtn.className).toContain("border-primary");
  });

  it("calls onSubmit with form data and closes on success", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();
    render(<AddRoutineForm onSubmit={onSubmit} onClose={onClose} />);

    // Fill in name
    fireEvent.change(screen.getByPlaceholderText(/Brush teeth/), {
      target: { value: "Exercise" },
    });
    // Select tag
    fireEvent.click(screen.getByText("Positive (+)"));
    // Select time
    fireEvent.click(screen.getByText("Morning"));
    // Submit
    fireEvent.click(screen.getByText("Add Routine"));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: "Exercise",
        tag: "positive",
        time_of_day: "morning",
      });
    });
    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it("shows error when submitting empty name", async () => {
    const onSubmit = vi.fn();
    render(<AddRoutineForm onSubmit={onSubmit} onClose={() => {}} />);

    fireEvent.click(screen.getByText("Add Routine"));

    await waitFor(() => {
      expect(screen.getByText("Name is required")).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("shows error when onSubmit rejects", async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error("Server error"));
    render(<AddRoutineForm onSubmit={onSubmit} onClose={() => {}} />);

    fireEvent.change(screen.getByPlaceholderText(/Brush teeth/), {
      target: { value: "Exercise" },
    });
    fireEvent.click(screen.getByText("Add Routine"));

    await waitFor(() => {
      expect(screen.getByText("Server error")).toBeInTheDocument();
    });
  });
});
