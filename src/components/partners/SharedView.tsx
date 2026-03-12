"use client";

import { useMemo } from "react";
import { Flame, TrendingUp, ArrowDown, Check } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { PartnerSnapshot } from "@/types/partners";
import type { Routine, CheckIn, HabitStack } from "@/types/database";
import type { Tag } from "@/types/common";

interface SharedViewProps {
  snapshot: PartnerSnapshot;
}

// ─── Shared Style Maps ───────────────────────────────

const TAG_STYLES: Record<Tag, { bg: string; text: string; label: string }> = {
  positive: { bg: "bg-green-50", text: "text-positive", label: "+" },
  negative: { bg: "bg-red-50", text: "text-negative", label: "−" },
  neutral: { bg: "bg-gray-100", text: "text-neutral", label: "=" },
};

// ─── Helpers ─────────────────────────────────────────

function getLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

interface StackChainView {
  anchor: Routine;
  steps: Routine[];
}

function buildChainViews(
  stacks: HabitStack[],
  routines: Routine[]
): StackChainView[] {
  const routineMap = new Map<string, Routine>();
  routines.forEach((r) => routineMap.set(r.id, r));

  const chainMap = new Map<
    string,
    { anchor: Routine; steps: { routine: Routine; position: number }[] }
  >();

  stacks.forEach((s) => {
    const anchor = routineMap.get(s.anchor_routine_id);
    const stacked = routineMap.get(s.stacked_routine_id);
    if (!anchor || !stacked) return;

    const existing = chainMap.get(s.anchor_routine_id);
    if (existing) {
      existing.steps.push({ routine: stacked, position: s.position });
    } else {
      chainMap.set(s.anchor_routine_id, {
        anchor,
        steps: [{ routine: stacked, position: s.position }],
      });
    }
  });

  const chains: StackChainView[] = [];
  chainMap.forEach((chain) => {
    chain.steps.sort((a, b) => a.position - b.position);
    chains.push({
      anchor: chain.anchor,
      steps: chain.steps.map((s) => s.routine),
    });
  });

  return chains;
}

// ─── Component ───────────────────────────────────────

export function SharedView({ snapshot }: SharedViewProps) {
  const today = getLocalDateString(new Date());

  // Build a set of completed routine IDs for today
  const completedToday = useMemo(() => {
    const set = new Set<string>();
    snapshot.checkIns.forEach((ci) => {
      if (ci.date === today && ci.completed) {
        set.add(ci.routine_id);
      }
    });
    return set;
  }, [snapshot.checkIns, today]);

  // Group routines by time of day
  const timeGroups = useMemo(() => {
    const groups: { key: string; label: string; routines: Routine[] }[] = [
      { key: "morning", label: "Morning", routines: [] },
      { key: "afternoon", label: "Afternoon", routines: [] },
      { key: "evening", label: "Evening", routines: [] },
      { key: "night", label: "Night", routines: [] },
      { key: "anytime", label: "Anytime", routines: [] },
    ];

    const groupMap = new Map(groups.map((g) => [g.key, g]));

    snapshot.routines.forEach((r) => {
      const key = r.time_of_day ?? "anytime";
      const group = groupMap.get(key) ?? groupMap.get("anytime")!;
      group.routines.push(r);
    });

    return groups.filter((g) => g.routines.length > 0);
  }, [snapshot.routines]);

  // Build stack chains for display
  const chains = useMemo(
    () => buildChainViews(snapshot.stacks, snapshot.routines),
    [snapshot.stacks, snapshot.routines]
  );

  // Today's completion stats
  const todayTotal = snapshot.routines.length;
  const todayDone = completedToday.size;
  const todayPercent =
    todayTotal > 0 ? Math.round((todayDone / todayTotal) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* ─── Streak Summary ─────────────────────── */}
      <Card className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">
          Overview
        </h2>

        <div className="grid grid-cols-3 gap-4">
          {/* Current streak */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <Flame className="h-5 w-5 text-orange-400" />
              <span className="font-display text-3xl font-bold text-gray-900">
                {snapshot.currentStreak}
              </span>
            </div>
            <p className="mt-1 text-[10px] font-medium uppercase tracking-widest text-gray-400">
              Day streak
            </p>
          </div>

          {/* Longest streak */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="font-display text-3xl font-bold text-gray-900">
                {snapshot.longestStreak}
              </span>
            </div>
            <p className="mt-1 text-[10px] font-medium uppercase tracking-widest text-gray-400">
              Best streak
            </p>
          </div>

          {/* Weekly completion */}
          <div className="text-center">
            <span className="font-display text-3xl font-bold text-gray-900">
              {snapshot.completionRateThisWeek}%
            </span>
            <p className="mt-1 text-[10px] font-medium uppercase tracking-widest text-gray-400">
              This week
            </p>
          </div>
        </div>
      </Card>

      {/* ─── Today's Scorecard ──────────────────── */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">
            Today&apos;s Scorecard
          </h2>
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-primary">
            {todayDone}/{todayTotal} ({todayPercent}%)
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${todayPercent}%` }}
          />
        </div>

        {/* Routine groups */}
        {timeGroups.map((group) => (
          <div key={group.key}>
            <p className="mb-2 text-xs font-semibold text-gray-500">
              {group.label}
            </p>
            <div className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-border">
              {group.routines.map((routine) => {
                const isDone = completedToday.has(routine.id);
                const tag = TAG_STYLES[routine.tag];

                return (
                  <div
                    key={routine.id}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    {/* Completion indicator (read-only, no click) */}
                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 ${
                        isDone
                          ? "border-primary bg-primary text-white"
                          : "border-gray-200 bg-white"
                      }`}
                    >
                      {isDone && <Check className="h-4 w-4" strokeWidth={3} />}
                    </div>

                    {/* Name */}
                    <span
                      className={`flex-1 text-sm ${
                        isDone
                          ? "text-gray-400 line-through decoration-gray-300"
                          : "font-medium text-gray-900"
                      }`}
                    >
                      {routine.name}
                    </span>

                    {/* Tag badge */}
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${tag.bg} ${tag.text}`}
                    >
                      {tag.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {snapshot.routines.length === 0 && (
          <p className="py-4 text-center text-sm text-gray-400">
            No routines added yet.
          </p>
        )}
      </Card>

      {/* ─── Habit Stacks ───────────────────────── */}
      {chains.length > 0 && (
        <Card className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">
            Habit Stacks
          </h2>

          <div className="space-y-4">
            {chains.map((chain) => (
              <div
                key={chain.anchor.id}
                className="rounded-xl border border-border p-4"
              >
                {/* Anchor */}
                <ChainNode
                  routine={chain.anchor}
                  isDone={completedToday.has(chain.anchor.id)}
                  role="ANCHOR"
                />

                {/* Steps */}
                {chain.steps.map((routine) => (
                  <div key={routine.id}>
                    <div className="flex items-center gap-2 py-1 pl-5">
                      <div className="flex flex-col items-center">
                        <div className="h-3 w-0.5 bg-primary" />
                        <ArrowDown className="h-3 w-3 text-primary" />
                      </div>
                      <span className="text-xs italic text-primary">
                        then...
                      </span>
                    </div>
                    <ChainNode
                      routine={routine}
                      isDone={completedToday.has(routine.id)}
                      role="STACKED"
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── Chain Node Sub-component ────────────────────────

function ChainNode({
  routine,
  isDone,
  role,
}: {
  routine: Routine;
  isDone: boolean;
  role: "ANCHOR" | "STACKED";
}) {
  const tag = TAG_STYLES[routine.tag];

  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
          isDone ? "bg-primary text-white" : `${tag.bg} ${tag.text}`
        }`}
      >
        {isDone ? <Check className="h-4 w-4" strokeWidth={3} /> : tag.label}
      </div>
      <div>
        <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">
          {role}
        </span>
        <span
          className={`block text-sm ${
            isDone
              ? "text-gray-400 line-through decoration-gray-300"
              : "font-medium text-gray-900"
          }`}
        >
          {routine.name}
        </span>
      </div>
    </div>
  );
}
