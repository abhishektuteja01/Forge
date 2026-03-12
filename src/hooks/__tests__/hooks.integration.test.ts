import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";

// ─── Mock Supabase before importing hooks ────────────────

const mockFrom = vi.fn();
const mockGetUser = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: mockFrom,
    auth: { getUser: mockGetUser },
  }),
}));

// Import hooks AFTER mock is set up
import { useRoutines } from "../useRoutines";
import { useCheckIns } from "../useCheckIns";
import { useStacks } from "../useStacks";
import { useIdentities } from "../useIdentities";
import { usePartners } from "../usePartners";

// ─── Query builder factory ───────────────────────────────

/**
 * Creates a chainable mock that resolves with { data, error }.
 * Every method returns `this` for chaining, and it's thenable.
 */
function createChainableQuery(data: unknown = [], error: unknown = null) {
  const resolved = { data, error };
  const builder: Record<string, unknown> = {};

  const chainMethods = [
    "select", "eq", "neq", "in", "is", "or", "not",
    "order", "limit", "filter", "match",
    "gt", "gte", "lt", "lte",
    "insert", "update", "delete", "upsert",
  ];

  chainMethods.forEach((m) => {
    builder[m] = vi.fn().mockReturnValue(builder);
  });

  builder.single = vi.fn().mockResolvedValue(resolved);

  // Make builder thenable
  builder.then = (resolve: (v: unknown) => void, reject?: (r: unknown) => void) =>
    Promise.resolve(resolved).then(resolve, reject);

  return builder;
}

// ─── Helpers ─────────────────────────────────────────────

const testUser = {
  id: "user-1",
  email: "test@example.com",
  app_metadata: {},
  user_metadata: {},
  aud: "authenticated",
  created_at: "2026-01-01T00:00:00Z",
};

function mockAuthenticatedUser() {
  mockGetUser.mockResolvedValue({ data: { user: testUser }, error: null });
}

function mockUnauthenticatedUser() {
  mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
}

/**
 * Configure mockFrom to return specific data per table.
 * Accepts a map of table name → data array.
 */
function setupTableMocks(tables: Record<string, unknown[]>) {
  mockFrom.mockImplementation((table: string) => {
    const data = tables[table] ?? [];
    return createChainableQuery(data);
  });
}

// ─── Reset ───────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  mockAuthenticatedUser();
});

// ─── useRoutines ─────────────────────────────────────────

describe("useRoutines", () => {
  it("starts in loading state", () => {
    setupTableMocks({ routines: [] });
    const { result } = renderHook(() => useRoutines());
    expect(result.current.loading).toBe(true);
  });

  it("fetches routines on mount", async () => {
    const routines = [
      { id: "r1", user_id: "user-1", name: "Coffee", tag: "neutral", time_of_day: "morning", sort_order: 0, archived_at: null, created_at: "2026-01-01", updated_at: "2026-01-01" },
    ];
    setupTableMocks({ routines });

    const { result } = renderHook(() => useRoutines());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.routines).toHaveLength(1);
    expect(result.current.routines[0].name).toBe("Coffee");
    expect(result.current.error).toBeNull();
  });

  it("returns empty array when not authenticated", async () => {
    mockUnauthenticatedUser();
    setupTableMocks({ routines: [] });

    const { result } = renderHook(() => useRoutines());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.routines).toHaveLength(0);
  });
});

// ─── useCheckIns ─────────────────────────────────────────

describe("useCheckIns", () => {
  it("fetches check-ins for the given date", async () => {
    const checkIns = [
      { id: "c1", user_id: "user-1", routine_id: "r1", date: "2026-03-11", completed: true, created_at: "2026-03-11", updated_at: "2026-03-11" },
    ];
    setupTableMocks({ check_ins: checkIns });

    const { result } = renderHook(() => useCheckIns("2026-03-11"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.checkIns.size).toBe(1);
    expect(result.current.checkIns.get("r1")?.completed).toBe(true);
  });

  it("getCompletionStats calculates correctly", async () => {
    const checkIns = [
      { id: "c1", user_id: "user-1", routine_id: "r1", date: "2026-03-11", completed: true, created_at: "2026-03-11", updated_at: "2026-03-11" },
      { id: "c2", user_id: "user-1", routine_id: "r2", date: "2026-03-11", completed: false, created_at: "2026-03-11", updated_at: "2026-03-11" },
    ];
    setupTableMocks({ check_ins: checkIns });

    const { result } = renderHook(() => useCheckIns("2026-03-11"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const stats = result.current.getCompletionStats(4);
    expect(stats.completed).toBe(1);
    expect(stats.total).toBe(4);
    expect(stats.percentage).toBe(25);
  });

  it("getCompletionStats returns 0% with zero routines", async () => {
    setupTableMocks({ check_ins: [] });

    const { result } = renderHook(() => useCheckIns("2026-03-11"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const stats = result.current.getCompletionStats(0);
    expect(stats.percentage).toBe(0);
  });
});

// ─── useStacks ───────────────────────────────────────────

describe("useStacks", () => {
  it("fetches stacks and routines in parallel", async () => {
    const routines = [
      { id: "r1", user_id: "user-1", name: "Coffee", tag: "neutral", time_of_day: "morning", sort_order: 0, archived_at: null, created_at: "2026-01-01", updated_at: "2026-01-01" },
      { id: "r2", user_id: "user-1", name: "Journal", tag: "positive", time_of_day: "morning", sort_order: 1, archived_at: null, created_at: "2026-01-01", updated_at: "2026-01-01" },
    ];
    const stacks = [
      { id: "s1", user_id: "user-1", anchor_routine_id: "r1", stacked_routine_id: "r2", position: 0, created_at: "2026-01-01" },
    ];

    setupTableMocks({ habit_stacks: stacks, routines });

    const { result } = renderHook(() => useStacks());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.chains).toHaveLength(1);
    expect(result.current.chains[0].anchor.name).toBe("Coffee");
    expect(result.current.chains[0].steps[0].routine.name).toBe("Journal");
    expect(result.current.routines).toHaveLength(2);
  });

  it("returns empty chains when not authenticated", async () => {
    mockUnauthenticatedUser();
    setupTableMocks({});

    const { result } = renderHook(() => useStacks());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.chains).toHaveLength(0);
    expect(result.current.routines).toHaveLength(0);
  });
});

// ─── useIdentities ───────────────────────────────────────

describe("useIdentities", () => {
  it("fetches and enriches identities with vote data", async () => {
    const identities = [
      { id: "i1", user_id: "user-1", statement: "I am a reader", archived_at: null, created_at: "2026-01-01", updated_at: "2026-01-01" },
    ];
    const identityHabits = [
      { id: "ih1", identity_id: "i1", routine_id: "r1", user_id: "user-1" },
    ];
    const routines = [
      { id: "r1", user_id: "user-1", name: "Read", tag: "positive", time_of_day: "evening", sort_order: 0, archived_at: null, created_at: "2026-01-01", updated_at: "2026-01-01" },
    ];
    const checkIns = [
      { id: "c1", user_id: "user-1", routine_id: "r1", date: "2026-03-11", completed: true, created_at: "2026-03-11", updated_at: "2026-03-11" },
    ];

    setupTableMocks({
      identities,
      identity_habits: identityHabits,
      routines,
      check_ins: checkIns,
    });

    const { result } = renderHook(() => useIdentities());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.identities).toHaveLength(1);
    expect(result.current.identities[0].statement).toBe("I am a reader");
    expect(result.current.identities[0].linked_routines).toHaveLength(1);
    expect(result.current.identities[0].total_votes).toBeGreaterThanOrEqual(1);
  });

  it("returns empty when not authenticated", async () => {
    mockUnauthenticatedUser();
    setupTableMocks({});

    const { result } = renderHook(() => useIdentities());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.identities).toHaveLength(0);
  });
});

// ─── usePartners ─────────────────────────────────────────

describe("usePartners", () => {
  it("fetches partnerships and nudges on mount", async () => {
    const partnerships = [
      { id: "p1", requester_id: "user-1", partner_id: "user-2", invite_token: "tok", invite_email: null, status: "active", created_at: "2026-03-01", updated_at: "2026-03-01" },
    ];
    const nudges = [
      { id: "n1", partnership_id: "p1", sender_id: "user-2", receiver_id: "user-1", message: "Keep going!", read: false, created_at: "2026-03-11" },
    ];
    const profiles = [
      { id: "user-2", display_name: "Partner Person" },
    ];

    mockFrom.mockImplementation((table: string) => {
      if (table === "partnerships") return createChainableQuery(partnerships);
      if (table === "nudges") return createChainableQuery(nudges);
      if (table === "profiles") return createChainableQuery(profiles);
      return createChainableQuery([]);
    });

    const { result } = renderHook(() => usePartners());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.partnerships).toHaveLength(1);
    expect(result.current.partnerships[0].partner_profile.display_name).toBe("Partner Person");
    expect(result.current.unreadNudgeCount).toBe(1);
    expect(result.current.nudges).toHaveLength(1);
  });

  it("returns empty state when not authenticated", async () => {
    mockUnauthenticatedUser();
    setupTableMocks({});

    const { result } = renderHook(() => usePartners());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.partnerships).toHaveLength(0);
    expect(result.current.nudges).toHaveLength(0);
    expect(result.current.unreadNudgeCount).toBe(0);
  });

  it("separates active partnerships from pending invites", async () => {
    const partnerships = [
      { id: "p1", requester_id: "user-2", partner_id: "user-1", invite_token: "tok1", invite_email: null, status: "active", created_at: "2026-03-01", updated_at: "2026-03-01" },
      { id: "p2", requester_id: "user-3", partner_id: "user-1", invite_token: "tok2", invite_email: null, status: "pending", created_at: "2026-03-10", updated_at: "2026-03-10" },
    ];
    const profiles = [
      { id: "user-2", display_name: "Active Partner" },
      { id: "user-3", display_name: "Pending Person" },
    ];

    mockFrom.mockImplementation((table: string) => {
      if (table === "partnerships") return createChainableQuery(partnerships);
      if (table === "profiles") return createChainableQuery(profiles);
      if (table === "nudges") return createChainableQuery([]);
      return createChainableQuery([]);
    });

    const { result } = renderHook(() => usePartners());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.partnerships).toHaveLength(1);
    expect(result.current.partnerships[0].partner_profile.display_name).toBe("Active Partner");
    expect(result.current.pendingInvites).toHaveLength(1);
    expect(result.current.pendingInvites[0].partner_profile.display_name).toBe("Pending Person");
  });
});
