import React from "react";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { OnboardingWizard } from "../OnboardingWizard";

// ─── Mocks ───────────────────────────────────────────────

const mockPush = vi.fn();
const mockRefresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

const mockFrom = vi.fn();
const mockGetUser = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: mockFrom,
    auth: { getUser: mockGetUser },
  }),
}));

// ─── Helpers ─────────────────────────────────────────────

function createChainableQuery(data: any = [], error: any = null) {
  const resolved = { data, error };
  const builder: any = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    then: (resolve: any) => Promise.resolve(resolved).then(resolve),
  };
  return builder;
}

const testUser = { id: "user-123", email: "test@example.com" };

// ─── Tests ───────────────────────────────────────────────

describe("OnboardingWizard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: testUser }, error: null });
    mockFrom.mockReturnValue(createChainableQuery());
  });

  it("renders Step 1 initially", () => {
    render(<OnboardingWizard />);
    expect(screen.getByText("Step 1 of 2")).toBeInTheDocument();
    expect(screen.getByText("Welcome to the Forge.")).toBeInTheDocument();
    expect(screen.getByText("Start Scorecard")).toBeInTheDocument();
  });

  it("advances to Step 2 when 'Start Scorecard' is clicked", () => {
    render(<OnboardingWizard />);
    fireEvent.click(screen.getByText("Start Scorecard"));
    expect(screen.getByText("Step 2 of 2")).toBeInTheDocument();
    expect(screen.getByText("Current Habits")).toBeInTheDocument();
  });

  it("skips onboarding when 'Skip' is clicked on Step 1", async () => {
    render(<OnboardingWizard />);
    fireEvent.click(screen.getByText("Skip"));

    await waitFor(() => {
      expect(mockFrom).toHaveBeenCalledWith("profiles");
      expect(mockPush).toHaveBeenCalledWith("/scorecard");
    });
  });

  it("adds a new routine row in Step 2", () => {
    render(<OnboardingWizard />);
    fireEvent.click(screen.getByText("Start Scorecard"));

    // Default is 3 rows
    const inputs = screen.getAllByPlaceholderText("e.g. Check phone in bed");
    expect(inputs).toHaveLength(3);

    fireEvent.click(screen.getByText(/Add Row/i));
    expect(
      screen.getAllByPlaceholderText("e.g. Check phone in bed")
    ).toHaveLength(4);
  });

  it("removes a routine row in Step 2", () => {
    render(<OnboardingWizard />);
    fireEvent.click(screen.getByText("Start Scorecard"));

    const initialRows = screen.getAllByPlaceholderText(
      "e.g. Check phone in bed"
    );
    expect(initialRows).toHaveLength(3);

    // Click the first trash icon
    const trashButtons = screen
      .getAllByRole("button")
      .filter((b) => b.querySelector("svg.lucide-trash2"));
    fireEvent.click(trashButtons[0]);

    expect(
      screen.getAllByPlaceholderText("e.g. Check phone in bed")
    ).toHaveLength(2);
  });

  it("disables remove button for the last row", () => {
    render(<OnboardingWizard />);
    fireEvent.click(screen.getByText("Start Scorecard"));

    // Remove row 1 and 2
    const trashButtons = screen
      .getAllByRole("button")
      .filter((b) => b.querySelector("svg.lucide-trash2"));
    fireEvent.click(trashButtons[0]);
    fireEvent.click(trashButtons[1]);

    const remainingRows = screen.getAllByPlaceholderText(
      "e.g. Check phone in bed"
    );
    expect(remainingRows).toHaveLength(1);

    const lastTrashButton = screen
      .getAllByRole("button")
      .filter((b) => b.querySelector("svg.lucide-trash2"))[0];
    expect(lastTrashButton).toBeDisabled();
  });

  it("saves routines and completes onboarding when Step 2 is submitted", async () => {
    render(<OnboardingWizard />);
    fireEvent.click(screen.getByText("Start Scorecard"));

    const inputs = screen.getAllByPlaceholderText("e.g. Check phone in bed");
    fireEvent.change(inputs[0], { target: { value: "Morning Walk" } });
    fireEvent.change(inputs[1], { target: { value: "Read 10 pages" } });
    // Leave 3rd empty - should be filtered out

    fireEvent.click(screen.getByText("Enter Dashboard"));

    await waitFor(() => {
      // Should insert routines
      expect(mockFrom).toHaveBeenCalledWith("routines");
      // Should update profile
      expect(mockFrom).toHaveBeenCalledWith("profiles");
      expect(mockPush).toHaveBeenCalledWith("/scorecard");
    });
  });

  it("shows error if no user is found on completion", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    render(<OnboardingWizard />);
    fireEvent.click(screen.getByText("Skip"));

    await waitFor(() => {
      expect(
        screen.getByText("You must be logged in to complete onboarding.")
      ).toBeInTheDocument();
    });
  });

  it("shows error if Supabase insert fails", async () => {
    const errorQuery = createChainableQuery([], { message: "Database Error" });
    mockFrom.mockReturnValueOnce(errorQuery); // routines insert fails

    render(<OnboardingWizard />);
    fireEvent.click(screen.getByText("Start Scorecard"));

    const inputs = screen.getAllByPlaceholderText("e.g. Check phone in bed");
    fireEvent.change(inputs[0], { target: { value: "Something" } });

    fireEvent.click(screen.getByText("Enter Dashboard"));

    await waitFor(() => {
      expect(screen.getByText("Database Error")).toBeInTheDocument();
    });
  });

  it("updates routine tag and time of day", () => {
    render(<OnboardingWizard />);
    fireEvent.click(screen.getByText("Start Scorecard"));

    // Every routine row has two selects (tag and time)
    const allSelects = screen.getAllByRole("combobox");

    // Tag select should have 'positive' or 'neutral' or 'negative' values
    const tagSelects = allSelects.filter((s) =>
      s.className.includes("uppercase")
    );
    fireEvent.change(tagSelects[0], { target: { value: "positive" } });
    expect(tagSelects[0]).toHaveValue("positive");

    // Time select is the one with 'Any Time' option
    const timeSelects = allSelects.filter((s) =>
      s.className.includes("bg-white")
    );
    fireEvent.change(timeSelects[0], { target: { value: "morning" } });
    expect(timeSelects[0]).toHaveValue("morning");
  });

  it("filters out empty routines on submission", async () => {
    render(<OnboardingWizard />);
    fireEvent.click(screen.getByText("Start Scorecard"));

    // All empty routines
    fireEvent.click(screen.getByText("Enter Dashboard"));

    await waitFor(() => {
      // Should NOT call routines insert since all are empty
      expect(mockFrom).not.toHaveBeenCalledWith("routines");
      // Should still update profile
      expect(mockFrom).toHaveBeenCalledWith("profiles");
    });
  });
});
