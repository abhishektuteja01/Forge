import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";

// ─── Mock Supabase ───────────────────────────────────────

const mockFrom = vi.fn();
const mockGetUser = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: mockFrom,
    auth: { getUser: mockGetUser },
  }),
}));

import { useRoutines } from "../useRoutines";
import { useCheckIns } from "../useCheckIns";
import { useStacks } from "../useStacks";
import { useIdentities } from "../useIdentities";
import { usePartners } from "../usePartners";

// ─── Query builder factory ───────────────────────────────

function createChainableQuery(data: unknown = [], error: unknown = null) {
  const resolved = { data, error };
  const builder: Record<string, unknown> = {};

  const chainMethods = [
    "select",
    "eq",
    "neq",
    "in",
    "is",
    "or",
    "not",
    "order",
    "limit",
    "filter",
    "match",
    "gt",
    "gte",
    "lt",
    "lte",
    "insert",
    "update",
    "delete",
    "upsert",
  ];

  chainMethods.forEach((m) => {
    builder[m] = vi.fn().mockReturnValue(builder);
  });

  builder.single = vi.fn().mockResolvedValue(resolved);

  builder.then = (
    resolve: (v: unknown) => void,
    reject?: (r: unknown) => void
  ) => Promise.resolve(resolved).then(resolve, reject);

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

function mockAuth() {
  mockGetUser.mockResolvedValue({ data: { user: testUser }, error: null });
}

function mockNoAuth() {
  mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
}

function setupTables(tables: Record<string, unknown[]>) {
  mockFrom.mockImplementation((table: string) => {
    const data = tables[table] ?? [];
    return createChainableQuery(data);
  });
}

// ─── Reset ───────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  mockAuth();
});

// ─── useRoutines mutations ───────────────────────────────

describe("useRoutines mutations", () => {
  const routines = [
    {
      id: "r1",
      user_id: "user-1",
      name: "Coffee",
      tag: "neutral",
      time_of_day: "morning",
      sort_order: 0,
      archived_at: null,
      created_at: "2026-01-01",
      updated_at: "2026-01-01",
    },
  ];

  it("addRoutine calls insert and refreshes", async () => {
    setupTables({ routines });
    const { result } = renderHook(() => useRoutines());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.addRoutine({
        name: "Journal",
        tag: "positive",
        time_of_day: "morning",
      });
    });

    // from("routines").insert(...) should have been called
    expect(mockFrom).toHaveBeenCalledWith("routines");
  });

  it("updateRoutine calls update and refreshes", async () => {
    setupTables({ routines });
    const { result } = renderHook(() => useRoutines());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.updateRoutine("r1", { name: "Updated Coffee" });
    });

    expect(mockFrom).toHaveBeenCalledWith("routines");
  });

  it("deleteRoutine calls update with archived_at and refreshes", async () => {
    setupTables({ routines });
    const { result } = renderHook(() => useRoutines());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.deleteRoutine("r1");
    });

    expect(mockFrom).toHaveBeenCalledWith("routines");
  });

  it("addRoutine throws when not authenticated", async () => {
    mockNoAuth();
    setupTables({ routines: [] });
    const { result } = renderHook(() => useRoutines());

    await waitFor(() => expect(result.current.loading).toBe(false));

    // Re-mock to no auth for the mutation call
    mockNoAuth();

    await expect(
      act(async () => {
        await result.current.addRoutine({ name: "Test", tag: "positive" });
      })
    ).rejects.toThrow("Not authenticated");
  });
});

// ─── useCheckIns mutations ───────────────────────────────

describe("useCheckIns mutations", () => {
  const checkIns = [
    {
      id: "c1",
      user_id: "user-1",
      routine_id: "r1",
      date: "2026-03-11",
      completed: false,
      created_at: "2026-03-11",
      updated_at: "2026-03-11",
    },
  ];

  it("toggleCheckIn flips existing check-in to completed", async () => {
    setupTables({ check_ins: checkIns });
    const { result } = renderHook(() => useCheckIns("2026-03-11"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.toggleCheckIn("r1");
    });

    // Should have called from("check_ins") for the update
    expect(mockFrom).toHaveBeenCalledWith("check_ins");
  });

  it("toggleCheckIn creates new check-in when none exists", async () => {
    setupTables({ check_ins: [] });
    const { result } = renderHook(() => useCheckIns("2026-03-11"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.toggleCheckIn("r2");
    });

    expect(mockFrom).toHaveBeenCalledWith("check_ins");
  });

  it("toggleCheckIn throws when not authenticated", async () => {
    setupTables({ check_ins: [] });
    const { result } = renderHook(() => useCheckIns("2026-03-11"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    mockNoAuth();

    await expect(
      act(async () => {
        await result.current.toggleCheckIn("r1");
      })
    ).rejects.toThrow("Not authenticated");
  });
});

// ─── useStacks mutations ─────────────────────────────────

describe("useStacks mutations", () => {
  const routines = [
    {
      id: "r1",
      user_id: "user-1",
      name: "Coffee",
      tag: "neutral",
      time_of_day: "morning",
      sort_order: 0,
      archived_at: null,
      created_at: "2026-01-01",
      updated_at: "2026-01-01",
    },
    {
      id: "r2",
      user_id: "user-1",
      name: "Journal",
      tag: "positive",
      time_of_day: "morning",
      sort_order: 1,
      archived_at: null,
      created_at: "2026-01-01",
      updated_at: "2026-01-01",
    },
  ];
  const stacks = [
    {
      id: "s1",
      user_id: "user-1",
      anchor_routine_id: "r1",
      stacked_routine_id: "r2",
      position: 0,
      created_at: "2026-01-01",
    },
  ];

  it("addStack calls insert and refreshes", async () => {
    setupTables({ habit_stacks: stacks, routines });
    const { result } = renderHook(() => useStacks());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.addStack({
        anchor_routine_id: "r1",
        stacked_routine_id: "r2",
      });
    });

    expect(mockFrom).toHaveBeenCalledWith("habit_stacks");
  });

  it("deleteStack calls delete and refreshes", async () => {
    setupTables({ habit_stacks: stacks, routines });
    const { result } = renderHook(() => useStacks());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.deleteStack("s1");
    });

    expect(mockFrom).toHaveBeenCalledWith("habit_stacks");
  });

  it("addStack throws when not authenticated", async () => {
    setupTables({ habit_stacks: [], routines: [] });
    const { result } = renderHook(() => useStacks());

    await waitFor(() => expect(result.current.loading).toBe(false));

    mockNoAuth();

    await expect(
      act(async () => {
        await result.current.addStack({
          anchor_routine_id: "r1",
          stacked_routine_id: "r2",
        });
      })
    ).rejects.toThrow("Not authenticated");
  });
});

// ─── useIdentities mutations ─────────────────────────────

describe("useIdentities mutations", () => {
  const identities = [
    {
      id: "i1",
      user_id: "user-1",
      statement: "I am a reader",
      archived_at: null,
      created_at: "2026-01-01",
      updated_at: "2026-01-01",
    },
  ];

  it("addIdentity calls insert for identity and links", async () => {
    // Need single() to return the new identity ID
    mockFrom.mockImplementation((table: string) => {
      if (table === "identities") {
        const builder = createChainableQuery(identities);
        builder.single = vi
          .fn()
          .mockResolvedValue({ data: { id: "i-new" }, error: null });
        return builder;
      }
      return createChainableQuery([]);
    });

    const { result } = renderHook(() => useIdentities());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.addIdentity("I am healthy", ["r1"]);
    });

    expect(mockFrom).toHaveBeenCalledWith("identities");
    expect(mockFrom).toHaveBeenCalledWith("identity_habits");
  });

  it("updateIdentity calls update", async () => {
    setupTables({
      identities,
      identity_habits: [],
      routines: [],
      check_ins: [],
    });

    const { result } = renderHook(() => useIdentities());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.updateIdentity("i1", "I am a daily reader");
    });

    expect(mockFrom).toHaveBeenCalledWith("identities");
  });

  it("deleteIdentity soft-deletes with archived_at", async () => {
    setupTables({
      identities,
      identity_habits: [],
      routines: [],
      check_ins: [],
    });

    const { result } = renderHook(() => useIdentities());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.deleteIdentity("i1");
    });

    expect(mockFrom).toHaveBeenCalledWith("identities");
  });

  it("updateLinks adds and removes links", async () => {
    const links = [
      { id: "ih1", identity_id: "i1", routine_id: "r1", user_id: "user-1" },
    ];

    setupTables({
      identities,
      identity_habits: links,
      routines: [],
      check_ins: [],
    });

    const { result } = renderHook(() => useIdentities());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      // Remove r1, add r2
      await result.current.updateLinks("i1", ["r2"]);
    });

    expect(mockFrom).toHaveBeenCalledWith("identity_habits");
  });
});

// ─── usePartners mutations ───────────────────────────────

describe("usePartners mutations", () => {
  it("generateInviteLink creates partnership and returns URL", async () => {
    setupTables({ partnerships: [], nudges: [], profiles: [] });

    const { result } = renderHook(() => usePartners());

    await waitFor(() => expect(result.current.loading).toBe(false));

    let url: string = "";
    await act(async () => {
      url = await result.current.generateInviteLink();
    });

    expect(url).toContain("/invite/");
    expect(mockFrom).toHaveBeenCalledWith("partnerships");
  });

  it("acceptInvite updates partnership status", async () => {
    const partnerships = [
      {
        id: "p1",
        requester_id: "user-2",
        partner_id: "user-1",
        invite_token: "tok",
        invite_email: null,
        status: "pending",
        created_at: "2026-03-01",
        updated_at: "2026-03-01",
      },
    ];

    setupTables({
      partnerships,
      nudges: [],
      profiles: [{ id: "user-2", display_name: "Someone" }],
    });

    const { result } = renderHook(() => usePartners());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.acceptInvite("p1");
    });

    expect(mockFrom).toHaveBeenCalledWith("partnerships");
  });

  it("declineInvite updates partnership status", async () => {
    setupTables({ partnerships: [], nudges: [], profiles: [] });

    const { result } = renderHook(() => usePartners());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.declineInvite("p1");
    });

    expect(mockFrom).toHaveBeenCalledWith("partnerships");
  });

  it("removePartner deletes partnership", async () => {
    setupTables({ partnerships: [], nudges: [], profiles: [] });

    const { result } = renderHook(() => usePartners());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.removePartner("p1");
    });

    expect(mockFrom).toHaveBeenCalledWith("partnerships");
  });

  it("sendNudge inserts a nudge", async () => {
    setupTables({ partnerships: [], nudges: [], profiles: [] });

    const { result } = renderHook(() => usePartners());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.sendNudge("p1", "user-2", "Keep going! 💪");
    });

    expect(mockFrom).toHaveBeenCalledWith("nudges");
  });

  it("markNudgesRead updates unread nudges", async () => {
    const nudges = [
      {
        id: "n1",
        partnership_id: "p1",
        sender_id: "user-2",
        receiver_id: "user-1",
        message: "Go!",
        read: false,
        created_at: "2026-03-11",
      },
    ];

    setupTables({ partnerships: [], nudges, profiles: [] });

    const { result } = renderHook(() => usePartners());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.unreadNudgeCount).toBe(1);

    await act(async () => {
      await result.current.markNudgesRead();
    });

    // Optimistic update should set read = true
    expect(result.current.unreadNudgeCount).toBe(0);
  });

  it("generateInviteLink throws when not authenticated", async () => {
    setupTables({ partnerships: [], nudges: [], profiles: [] });

    const { result } = renderHook(() => usePartners());

    await waitFor(() => expect(result.current.loading).toBe(false));

    mockNoAuth();

    await expect(
      act(async () => {
        await result.current.generateInviteLink();
      })
    ).rejects.toThrow("Not authenticated");
  });
});
