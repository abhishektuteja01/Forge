import { vi } from "vitest";

/**
 * Mock Supabase client for testing hooks and components.
 *
 * Usage in a test file:
 * ```ts
 * import { createMockSupabase, mockUser } from "@/test/mocks/supabase";
 *
 * vi.mock("@/lib/supabase/client", () => ({
 *   createClient: () => mockSupabase,
 * }));
 *
 * const { mockSupabase, setMockData } = createMockSupabase();
 *
 * // Configure mock data for a table
 * setMockData("routines", [
 *   { id: "1", name: "Morning coffee", tag: "neutral", ... },
 * ]);
 *
 * // Configure auth user
 * mockSupabase.auth.getUser.mockResolvedValue({
 *   data: { user: mockUser() },
 *   error: null,
 * });
 * ```
 */

/** Create a test user with sensible defaults */
export function mockUser(overrides: Record<string, unknown> = {}) {
  return {
    id: "user-1",
    email: "test@example.com",
    app_metadata: {},
    user_metadata: {},
    aud: "authenticated",
    created_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

/** Create a fully mocked Supabase client */
export function createMockSupabase() {
  // Store mock data per table
  const tableData = new Map<string, unknown[]>();
  // Store per-call overrides: { data, error } for insert/update/delete
  let nextMutationResult: { data: unknown; error: unknown } | null = null;

  /** Set mock data that SELECT queries will return for a given table */
  function setMockData(table: string, data: unknown[]) {
    tableData.set(table, data);
  }

  /** Override the next mutation (insert/update/delete) result */
  function setNextMutationResult(result: { data?: unknown; error?: unknown }) {
    nextMutationResult = {
      data: result.data ?? null,
      error: result.error ?? null,
    };
  }

  /**
   * Build a chainable query builder mock.
   * Every chaining method returns `this` so calls like
   * `.from("x").select("*").eq("a", "b").order("c")` all work.
   * The resolved value comes from tableData or nextMutationResult.
   */
  function createQueryBuilder(table: string) {
    let isSingle = false;
    let mutationType: "select" | "insert" | "update" | "delete" = "select";

    const builder: Record<string, unknown> = {};

    // Chaining methods — all return the builder
    const chainMethods = [
      "select",
      "eq",
      "neq",
      "in",
      "is",
      "or",
      "order",
      "limit",
      "match",
      "filter",
      "not",
      "gt",
      "gte",
      "lt",
      "lte",
    ];

    chainMethods.forEach((method) => {
      builder[method] = vi.fn().mockImplementation(() => builder);
    });

    // Mutation starters — also chainable
    builder.insert = vi.fn().mockImplementation(() => {
      mutationType = "insert";
      return builder;
    });
    builder.update = vi.fn().mockImplementation(() => {
      mutationType = "update";
      return builder;
    });
    builder.delete = vi.fn().mockImplementation(() => {
      mutationType = "delete";
      return builder;
    });

    // single() modifier
    builder.single = vi.fn().mockImplementation(() => {
      isSingle = true;
      // Resolve immediately with data
      const data = tableData.get(table) ?? [];
      if (mutationType !== "select" && nextMutationResult) {
        const result = nextMutationResult;
        nextMutationResult = null;
        return Promise.resolve(result);
      }
      return Promise.resolve({
        data: isSingle ? (data[0] ?? null) : data,
        error: null,
      });
    });

    // Make the builder itself thenable so `await supabase.from(...).select(...)` works
    builder.then = vi
      .fn()
      .mockImplementation(
        (
          resolve: (value: unknown) => void,
          reject?: (reason: unknown) => void
        ) => {
          if (mutationType !== "select" && nextMutationResult) {
            const result = nextMutationResult;
            nextMutationResult = null;
            return Promise.resolve(result).then(resolve, reject);
          }
          const data = tableData.get(table) ?? [];
          return Promise.resolve({
            data: isSingle ? (data[0] ?? null) : data,
            error: null,
          }).then(resolve, reject);
        }
      );

    return builder;
  }

  // The mock supabase client
  const mockSupabase = {
    from: vi
      .fn()
      .mockImplementation((table: string) => createQueryBuilder(table)),
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: mockUser() },
        error: null,
      }),
      signInWithPassword: vi.fn().mockResolvedValue({
        data: { user: mockUser(), session: {} },
        error: null,
      }),
      signInWithOAuth: vi.fn().mockResolvedValue({
        data: { url: "https://oauth.test" },
        error: null,
      }),
      signUp: vi.fn().mockResolvedValue({
        data: { user: mockUser(), session: {} },
        error: null,
      }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
  };

  return {
    mockSupabase,
    setMockData,
    setNextMutationResult,
  };
}
