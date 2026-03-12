/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { useIdentities } from "../useIdentities";
import { usePartners } from "../usePartners";
import { useStacks } from "../useStacks";

// ─── Query builder factory ───────────────────────────────

function createChainableQuery(data: any = [], error: any = null) {
  const resolved = { data, error };
  const builder: any = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(resolved),
    // Make builder thenable
    then: (resolve: (v: any) => void, reject?: (r: any) => void) =>
      Promise.resolve(resolved).then(resolve, reject),
  };
  return builder;
}

const testUser = { id: "user-1", email: "test@example.com" };

function setupTableMocks(tables: Record<string, any>) {
  mockFrom.mockImplementation((table: string) => {
    const data = tables[table] ?? [];
    return createChainableQuery(data);
  });
}

// ─── Tests ───────────────────────────────────────────────

describe("Hooks Coverage (Edge Cases)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: testUser }, error: null });
  });

  // ─── useRoutines Coverage ─────────────────────────────

  describe("useRoutines coverage", () => {
    it("handles connection error (Supabase not configured)", async () => {
      mockFrom.mockReturnValue(
        createChainableQuery([], new Error("fetch failed"))
      );
      const { result } = renderHook(() => useRoutines());
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.routines).toEqual([]);
      expect(result.current.error).toBeNull();
    });

    it("handles non-connection error", async () => {
      mockFrom.mockReturnValue(
        createChainableQuery([], new Error("Table not found"))
      );
      const { result } = renderHook(() => useRoutines());
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.error).toBe("Table not found");
    });

    it("handles no user state", async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
      const { result } = renderHook(() => useRoutines());
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.routines).toEqual([]);
    });

    it("handles updateRoutine with partial data", async () => {
      mockGetUser.mockResolvedValue({ data: { user: testUser }, error: null });
      mockFrom.mockReturnValue(createChainableQuery([]));
      const { result } = renderHook(() => useRoutines());
      await waitFor(() => expect(result.current.loading).toBe(false));

      mockFrom.mockReturnValue(createChainableQuery({ id: "r1" }));
      await act(async () => {
        await result.current.updateRoutine("r1", { time_of_day: "morning" });
      });
      // This covers the branch 'if (data.time_of_day !== undefined)'
    });
  });

  describe("useCheckIns coverage", () => {
    it("reverts optimistic update on failure (existing)", async () => {
      const existingCheckIn = { id: "ci1", routine_id: "r1", completed: true };
      setupTableMocks({ check_ins: [existingCheckIn] });
      const { result } = renderHook(() => useCheckIns("2026-03-11"));
      await waitFor(() => expect(result.current.loading).toBe(false));

      mockFrom.mockReturnValue(
        createChainableQuery([], new Error("Update failed"))
      );
      await act(async () => {
        try {
          await result.current.toggleCheckIn("r1");
        } catch {
          /* ignore */
        }
      });
      // Covers branch 'if (existing)' in toggleCheckIn catch block
      expect(result.current.checkIns.get("r1")?.completed).toBe(true);
    });

    it("handles connection error during fetch", async () => {
      mockFrom.mockReturnValue(
        createChainableQuery([], new Error("API key invalid"))
      );
      const { result } = renderHook(() => useCheckIns("2026-03-11"));
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.checkIns.size).toBe(0);
      expect(result.current.error).toBeNull();
    });

    it("handles non-connection error during fetch", async () => {
      mockFrom.mockReturnValue(
        createChainableQuery([], new Error("Custom Error"))
      );
      const { result } = renderHook(() => useCheckIns("2026-03-11"));
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.error).toBe("Custom Error");
    });

    it("handles no user state", async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
      const { result } = renderHook(() => useCheckIns("2026-03-11"));
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.checkIns.size).toBe(0);
    });
  });

  describe("useIdentities coverage", () => {
    it("handles connection error", async () => {
      mockFrom.mockReturnValue(
        createChainableQuery([], new Error("fetch failed"))
      );
      const { result } = renderHook(() => useIdentities());
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.identities).toEqual([]);
      expect(result.current.error).toBeNull();
    });

    it("handles non-connection error", async () => {
      mockFrom.mockReturnValue(
        createChainableQuery([], new Error("Identity Error"))
      );
      const { result } = renderHook(() => useIdentities());
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.error).toBe("Identity Error");
    });

    it("handles no user state", async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
      const { result } = renderHook(() => useIdentities());
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.identities).toEqual([]);
    });
  });

  describe("usePartners coverage", () => {
    it("handles fetch connection error", async () => {
      mockFrom.mockReturnValue(
        createChainableQuery([], new Error("fetch failed"))
      );
      const { result } = renderHook(() => usePartners());
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.partnerships).toEqual([]);
      expect(result.current.error).toBeNull();
    });

    it("handles fetch non-connection error", async () => {
      mockFrom.mockReturnValue(
        createChainableQuery([], new Error("Partner Error"))
      );
      const { result } = renderHook(() => usePartners());
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.error).toBe("Partner Error");
    });

    it("handles no user state", async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
      const { result } = renderHook(() => usePartners());
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.partnerships).toEqual([]);
    });

    it("fetchPartnerSnapshot throws on no partnership", async () => {
      setupTableMocks({ partnerships: [], nudges: [] });
      const { result } = renderHook(() => usePartners());
      await waitFor(() => expect(result.current.loading).toBe(false));

      mockFrom.mockReturnValue(
        createChainableQuery(null, { message: "No rows" })
      );
      await expect(
        result.current.fetchPartnerSnapshot("other-user")
      ).rejects.toThrow("No active partnership found");
    });

    it("fetchPartnerSnapshot fetches full profile/data", async () => {
      setupTableMocks({ partnerships: [], nudges: [] });
      const { result } = renderHook(() => usePartners());
      await waitFor(() => expect(result.current.loading).toBe(false));

      mockFrom.mockImplementation((table: string) => {
        if (table === "partnerships") return createChainableQuery({ id: "p1" }); // simplified single()
        if (table === "profiles")
          return createChainableQuery({ id: "other", display_name: "Partner" });
        if (table === "routines")
          return createChainableQuery([{ id: "r1", name: "Run" }]);
        if (table === "check_ins")
          return createChainableQuery([
            { date: "2026-03-11", completed: true },
          ]);
        return createChainableQuery([]);
      });

      const snapshot = await result.current.fetchPartnerSnapshot("other");
      expect(snapshot.profile.display_name).toBe("Partner");
      expect(snapshot.routines).toHaveLength(1);
      expect(snapshot.currentStreak).toBeGreaterThanOrEqual(0);
    });
  });

  describe("useStacks coverage", () => {
    it("handles connection error", async () => {
      mockFrom.mockReturnValue(
        createChainableQuery([], new Error("fetch failed"))
      );
      const { result } = renderHook(() => useStacks());
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.stacks).toEqual([]);
      expect(result.current.error).toBeNull();
    });

    it("handles non-connection error", async () => {
      mockFrom.mockReturnValue(
        createChainableQuery([], new Error("Stack Error"))
      );
      const { result } = renderHook(() => useStacks());
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.error).toBe("Stack Error");
    });

    it("handles no user state", async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
      const { result } = renderHook(() => useStacks());
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.stacks).toEqual([]);
    });
  });
});
