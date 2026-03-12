# Before/After Test — Rules File Comparison

**Feature tested:** Issue #5 — Habit Stacking (linked pairs + visual chain view)
**Team:** Derek Zhang

---

## Methodology

Both versions were generated from a clean chat with no prior context carried over.

**Without rules:** Prompted the AI with only a brief description:

> "Build a habit stacking feature for my Next.js + Supabase app where users can link habits together in chains ('After I do X, I will do Y') and see them as a visual chain. Use TypeScript and Tailwind."

**With rules:** Same feature, clean chat, but with the AGENTS.md rules file loaded and the PRD referenced for acceptance criteria and data model.

Same AI model used for both. No manual corrections applied to either output.

---

## Without Rules — Generated Code

```tsx
// FILE: src/app/api/stacks/route.ts
// Problem: Creates a custom API route — AGENTS.md says "don't create API routes for CRUD, use Supabase + RLS"

import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
  // Problem: Exposes service_role key in an API route — rules say "never expose service_role key client-side"
);

export async function GET(req: NextRequest) {
  // Problem: Trusts a client-sent header for auth instead of using Supabase session
  const userId = req.headers.get("x-user-id");

  const { data, error } = await supabase
    .from("habit_stacks")
    .select("*")
    .eq("user_id", userId);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  // Problem: No input validation — passes raw body directly to Supabase
  const { data, error } = await supabase
    .from("habit_stacks")
    .insert(body)
    .select();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// FILE: src/app/stacks/page.tsx
// Problem: Not inside (dashboard) route group — should be src/app/(dashboard)/stacks/page.tsx
// Problem: Entire feature in one monolithic client component — no decomposition into hooks or child components

("use client");

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// Problem: Creates Supabase client inline instead of importing from lib/supabase/client.ts
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Problem: Types defined inline, not exported from types/ directory
interface Stack {
  id: string;
  anchor_habit: string; // Problem: Wrong column name — should be anchor_routine_id
  new_habit: string; // Problem: Wrong column name — should be stacked_routine_id
  order: number; // Problem: Wrong column name — should be position
  user_id: string;
}

export default function StacksPage() {
  const [stacks, setStacks] = useState<Stack[]>([]);
  const [habits, setHabits] = useState<any[]>([]); // Problem: Uses `any` — strict mode forbids this
  const [anchorId, setAnchorId] = useState("");
  const [newHabitName, setNewHabitName] = useState("");
  const [loading, setLoading] = useState(true);

  // Problem: useEffect for data fetching — rules say don't use useEffect for fetching
  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const res = await fetch("/api/stacks", {
      headers: { "x-user-id": "current-user-id" }, // Problem: Hardcoded user ID, no real auth
    });
    const stackData = await res.json();
    setStacks(stackData);

    const { data: habitData } = await supabase
      .from("habits") // Problem: Wrong table name — data model says `routines`
      .select("*");
    setHabits(habitData || []);
    setLoading(false);
  }

  async function handleCreateStack() {
    if (!anchorId || !newHabitName) return;

    const { data: newHabit } = await supabase
      .from("habits") // Problem: Wrong table name again
      .insert({
        name: newHabitName,
        user_id: "current-user-id",
        type: "positive",
      })
      .select()
      .single();

    if (!newHabit) return;

    await fetch("/api/stacks", {
      method: "POST",
      body: JSON.stringify({
        anchor_habit: anchorId,
        new_habit: newHabit.id,
        order: stacks.length + 1,
        user_id: "current-user-id",
      }),
    });

    fetchData(); // Problem: Refetches everything instead of optimistic update
  }

  async function handleDeleteStack(id: string) {
    // Problem: No try/catch error handling — rules require wrapping Supabase calls
    await supabase.from("habit_stacks").delete().eq("id", id);
    fetchData();
  }

  if (loading) return <div>Loading...</div>; // Problem: No loading state or skeleton

  return (
    // Problem: Desktop-first layout (max-w-4xl p-8) — rules require mobile-first starting at 375px
    <div className="mx-auto max-w-4xl p-8">
      <h1 className="mb-6 text-3xl font-bold">Habit Stacks</h1>

      <div className="mb-8 rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold">Create New Stack</h2>
        {/* Problem: Horizontal flex layout breaks on mobile */}
        <div className="flex gap-4">
          <select
            value={anchorId}
            onChange={(e) => setAnchorId(e.target.value)}
            className="flex-1 rounded border px-3 py-2"
            // Problem: No label element — fails accessibility
          >
            <option value="">Select anchor habit</option>
            {habits.map((h: any) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            placeholder="New habit name"
            className="flex-1 rounded border px-3 py-2"
          />

          {/* Problem: Uses bg-blue-600 — design tokens specify bg-indigo-500 */}
          <button
            onClick={handleCreateStack}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Create Stack
          </button>
        </div>
      </div>

      {/* Problem: Renders stacks as flat horizontal rows, not the vertical chain/flow diagram from the PRD */}
      <div className="space-y-4">
        {stacks.map((stack) => (
          <div
            key={stack.id}
            className="flex items-center gap-4 rounded-lg bg-gray-100 p-4"
          >
            <div className="flex-1 rounded bg-white p-3 shadow-sm">
              {/* Problem: No tag color coding (green/red/gray) */}
              <p className="font-medium">
                {habits.find((h: any) => h.id === stack.anchor_habit)?.name ||
                  "Unknown"}
              </p>
            </div>

            {/* Problem: Text arrow instead of visual connector */}
            <span className="text-2xl">→</span>

            <div className="flex-1 rounded bg-white p-3 shadow-sm">
              <p className="font-medium">
                {habits.find((h: any) => h.id === stack.new_habit)?.name ||
                  "Unknown"}
              </p>
            </div>

            <button
              onClick={() => handleDeleteStack(stack.id)}
              className="text-red-500 hover:text-red-700"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {stacks.length === 0 && (
        <p className="py-8 text-center text-gray-500">
          No stacks yet. Create your first one above!
        </p>
      )}
    </div>
  );
}

// Problem: No tests generated at all
```

---

## With Rules — Generated Code

```sql
-- FILE: supabase/migrations/20260227000001_create_habit_stacks.sql

CREATE TABLE IF NOT EXISTS habit_stacks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  anchor_routine_id uuid NOT NULL REFERENCES routines(id),
  stacked_routine_id uuid NOT NULL REFERENCES routines(id),
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE habit_stacks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own stacks"
  ON habit_stacks FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_habit_stacks_user ON habit_stacks(user_id);
CREATE INDEX idx_habit_stacks_anchor ON habit_stacks(anchor_routine_id);
```

```tsx
// FILE: src/types/stacks.ts

import type { Routine } from "./routines";

export interface HabitStack {
  id: string;
  user_id: string;
  anchor_routine_id: string;
  stacked_routine_id: string;
  position: number;
  created_at: string;
}

export interface HabitStackWithRoutines extends HabitStack {
  anchor_routine: Routine;
  stacked_routine: Routine;
}

export interface CreateStackInput {
  anchor_routine_id: string;
  stacked_routine_id: string;
  position: number;
}
```

```tsx
// FILE: src/hooks/useStacks.ts

"use client";

import { useState, useCallback } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import type { HabitStackWithRoutines, CreateStackInput } from "@/types/stacks";

export function useStacks(initialStacks: HabitStackWithRoutines[]) {
  const supabase = createBrowserClient();
  const [stacks, setStacks] = useState(initialStacks);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createStack = useCallback(
    async (input: CreateStackInput) => {
      setIsCreating(true);
      setError(null);

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const { data, error: dbError } = await supabase
          .from("habit_stacks")
          .insert({
            user_id: user.id,
            anchor_routine_id: input.anchor_routine_id,
            stacked_routine_id: input.stacked_routine_id,
            position: input.position,
          })
          .select(
            `
          *,
          anchor_routine:routines!anchor_routine_id(*),
          stacked_routine:routines!stacked_routine_id(*)
        `
          )
          .single();

        if (dbError) throw dbError;
        if (data)
          setStacks((prev) => [...prev, data as HabitStackWithRoutines]);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to create stack";
        setError(message);
        console.error("createStack error:", err);
      } finally {
        setIsCreating(false);
      }
    },
    [supabase]
  );

  const deleteStack = useCallback(
    async (stackId: string) => {
      setError(null);

      try {
        const { error: dbError } = await supabase
          .from("habit_stacks")
          .delete()
          .eq("id", stackId);

        if (dbError) throw dbError;
        setStacks((prev) => prev.filter((s) => s.id !== stackId));
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to delete stack";
        setError(message);
      }
    },
    [supabase]
  );

  return { stacks, createStack, deleteStack, isCreating, error };
}
```

```tsx
// FILE: src/app/(dashboard)/stacks/page.tsx
// Server Component — data loaded on server, passed to client children

import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { StackBuilder } from "@/components/stacks/StackBuilder";
import { StackChain } from "@/components/stacks/StackChain";
import type { HabitStackWithRoutines } from "@/types/stacks";
import type { Routine } from "@/types/routines";

export default async function StacksPage() {
  const supabase = createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: routines } = await supabase
    .from("routines")
    .select("*")
    .eq("user_id", user.id)
    .is("archived_at", null)
    .order("sort_order", { ascending: true });

  const { data: stacks } = await supabase
    .from("habit_stacks")
    .select(
      `
      *,
      anchor_routine:routines!anchor_routine_id(*),
      stacked_routine:routines!stacked_routine_id(*)
    `
    )
    .eq("user_id", user.id)
    .order("position", { ascending: true });

  return (
    <div className="px-4 py-6 sm:px-6 lg:mx-auto lg:max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Habit Stacks</h1>
      <StackBuilder routines={(routines as Routine[]) ?? []} />
      <section className="mt-8" aria-label="Your habit stack chains">
        <StackChain stacks={(stacks as HabitStackWithRoutines[]) ?? []} />
      </section>
    </div>
  );
}
```

```tsx
// FILE: src/components/stacks/StackBuilder.tsx

"use client";

import { useState } from "react";
import { useStacks } from "@/hooks/useStacks";
import type { Routine } from "@/types/routines";

interface StackBuilderProps {
  routines: Routine[];
}

export function StackBuilder({ routines }: StackBuilderProps) {
  const [anchorId, setAnchorId] = useState("");
  const [stackedId, setStackedId] = useState("");
  const { createStack, isCreating, error } = useStacks([]);

  function handleSubmit() {
    if (!anchorId || !stackedId || anchorId === stackedId) return;
    createStack({
      anchor_routine_id: anchorId,
      stacked_routine_id: stackedId,
      position: 0,
    });
    setAnchorId("");
    setStackedId("");
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        Create a Stack
      </h2>

      {error && (
        <p className="mb-3 text-sm text-red-500" role="alert">
          {error}
        </p>
      )}

      <div className="space-y-3">
        <div>
          <label
            htmlFor="anchor"
            className="mb-1 block text-sm font-medium text-gray-500"
          >
            After I...
          </label>
          <select
            id="anchor"
            value={anchorId}
            onChange={(e) => setAnchorId(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select existing routine</option>
            {routines.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="stacked"
            className="mb-1 block text-sm font-medium text-gray-500"
          >
            I will...
          </label>
          <select
            id="stacked"
            value={stackedId}
            onChange={(e) => setStackedId(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select habit to stack</option>
            {routines
              .filter((r) => r.id !== anchorId)
              .map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
          </select>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!anchorId || !stackedId || isCreating}
          className="min-h-[44px] w-full rounded-lg bg-indigo-500 py-2.5 font-medium text-white transition-all hover:bg-indigo-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isCreating ? "Creating..." : "Create Stack"}
        </button>
      </div>
    </div>
  );
}
```

```tsx
// FILE: src/components/stacks/StackCard.tsx

import type { Routine } from "@/types/routines";

const TAG_COLORS: Record<string, string> = {
  positive: "bg-green-500",
  negative: "bg-red-500",
  neutral: "bg-gray-400",
};

interface StackCardProps {
  routine: Routine;
  isCompleted?: boolean;
}

export function StackCard({ routine, isCompleted = false }: StackCardProps) {
  return (
    <div
      className={`relative rounded-xl border p-3 transition-all ${isCompleted ? "border-green-500 bg-green-50" : "border-gray-200 bg-white"}`}
    >
      <div className="flex items-center gap-2">
        <span
          className={`h-2.5 w-2.5 shrink-0 rounded-full ${TAG_COLORS[routine.tag]}`}
          aria-label={`${routine.tag} habit`}
        />
        <span className="text-sm font-medium text-gray-900">
          {routine.name}
        </span>
        {isCompleted && (
          <span
            className="ml-auto text-sm text-green-500"
            aria-label="Completed"
          >
            ✓
          </span>
        )}
      </div>
    </div>
  );
}
```

```tsx
// FILE: src/components/stacks/StackChain.tsx

"use client";

import { StackCard } from "./StackCard";
import type { HabitStackWithRoutines } from "@/types/stacks";

interface StackChainProps {
  stacks: HabitStackWithRoutines[];
}

export function StackChain({ stacks }: StackChainProps) {
  if (stacks.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-gray-500">
        No stacks yet — link two habits above to get started.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {stacks.map((stack) => (
        <div key={stack.id} className="flex flex-col items-center gap-0">
          <StackCard routine={stack.anchor_routine} />
          <div className="flex flex-col items-center py-1">
            <div className="h-4 w-px bg-gray-300" />
            <span className="py-0.5 text-xs font-medium text-gray-400">
              then
            </span>
            <div className="h-4 w-px bg-gray-300" />
          </div>
          <StackCard routine={stack.stacked_routine} />
        </div>
      ))}
    </div>
  );
}
```

```tsx
// FILE: src/components/stacks/StackBuilder.test.tsx

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StackBuilder } from "./StackBuilder";
import type { Routine } from "@/types/routines";

const mockRoutines: Routine[] = [
  {
    id: "1",
    user_id: "u1",
    name: "Morning coffee",
    tag: "neutral",
    time_of_day: "morning",
    sort_order: 0,
    archived_at: null,
    created_at: "",
    updated_at: "",
  },
  {
    id: "2",
    user_id: "u1",
    name: "Read 10 pages",
    tag: "positive",
    time_of_day: "morning",
    sort_order: 1,
    archived_at: null,
    created_at: "",
    updated_at: "",
  },
];

describe("StackBuilder", () => {
  it("renders both select dropdowns and the create button", () => {
    render(<StackBuilder routines={mockRoutines} />);
    expect(screen.getByLabelText(/after i/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/i will/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /create stack/i })
    ).toBeInTheDocument();
  });

  it("disables create button when no selections are made", () => {
    render(<StackBuilder routines={mockRoutines} />);
    expect(
      screen.getByRole("button", { name: /create stack/i })
    ).toBeDisabled();
  });

  it("filters stacked dropdown to exclude selected anchor", async () => {
    const user = userEvent.setup();
    render(<StackBuilder routines={mockRoutines} />);
    await user.selectOptions(screen.getByLabelText(/after i/i), "1");
    const stackedSelect = screen.getByLabelText(/i will/i);
    expect(stackedSelect).not.toContainHTML("Morning coffee");
    expect(stackedSelect).toContainHTML("Read 10 pages");
  });
});
```

---

## Documented Differences

### 1. Code Quality & Project Patterns

| Area                | Without Rules                             | With Rules                                                          |
| ------------------- | ----------------------------------------- | ------------------------------------------------------------------- |
| Architecture        | Custom API route with service_role key    | Direct Supabase queries with RLS, no API route                      |
| Data fetching       | `useEffect` in client component           | Server component loads data, passes to client children              |
| Supabase client     | Instantiated inline with `createClient()` | Imported from `lib/supabase/server.ts` and `lib/supabase/client.ts` |
| Auth                | Hardcoded user ID in header               | `supabase.auth.getUser()` + redirect if unauthenticated             |
| Error handling      | None — no try/catch anywhere              | try/catch on all Supabase calls, user-facing error state            |
| Component structure | One 120+ line monolithic component        | Page → StackBuilder, StackChain, StackCard (single responsibility)  |
| State logic         | Mixed into component body                 | Extracted to `useStacks` hook                                       |

### 2. Design/Mockup Intent

| Area                | Without Rules                        | With Rules                                            |
| ------------------- | ------------------------------------ | ----------------------------------------------------- |
| Stack visualization | Horizontal row with text arrow (`→`) | Vertical chain with connector lines and "then" label  |
| Tag colors          | Not shown at all                     | Green/red/gray dots per routine tag                   |
| Completion state    | Not shown                            | Green border + checkmark on completed habits          |
| Layout orientation  | Desktop-first (`max-w-4xl p-8`)      | Mobile-first (`px-4 py-6 sm:px-6`)                    |
| Empty state         | Generic text                         | Descriptive prompt guiding user to create first stack |

### 3. Naming Conventions & Architecture

| Area              | Without Rules                                       | With Rules                                                           |
| ----------------- | --------------------------------------------------- | -------------------------------------------------------------------- |
| Table name        | `habits` (wrong)                                    | `routines` (matches data model)                                      |
| Column names      | `anchor_habit`, `new_habit`, `order`                | `anchor_routine_id`, `stacked_routine_id`, `position`                |
| Route location    | `src/app/stacks/`                                   | `src/app/(dashboard)/stacks/` (inside protected route group)         |
| Component naming  | None — everything inline                            | PascalCase: `StackBuilder`, `StackChain`, `StackCard`                |
| Type definitions  | Inline interface with wrong field names, uses `any` | Exported from `types/stacks.ts`, zero `any` usage                    |
| Props pattern     | N/A (no child components)                           | `{ComponentName}Props` interface, destructured in signature          |
| File organization | 2 files (API route + page)                          | 8 files across types/, hooks/, components/stacks/, app/, migrations/ |

### 4. Quality of Tests

| Area            | Without Rules | With Rules                                              |
| --------------- | ------------- | ------------------------------------------------------- |
| Tests generated | None          | Co-located `StackBuilder.test.tsx` with 3 test cases    |
| Framework       | N/A           | Vitest + React Testing Library (per rules)              |
| What's tested   | N/A           | Render state, disabled button logic, dropdown filtering |
| Test style      | N/A           | Tests user-facing behavior, not implementation details  |

---

## Summary

The rules file eliminated an entire category of wrong decisions the AI made by default. Without rules, the AI produced functional code that would compile but violated the project's architecture (custom API routes), data model (wrong table/column names), styling conventions (wrong colors, desktop-first), and security model (exposed service key, no RLS). With rules, the output matched the PRD's data model exactly, followed the established folder structure and naming, used the correct Supabase client patterns, and generated tests — requiring minimal manual correction to integrate into the codebase.
