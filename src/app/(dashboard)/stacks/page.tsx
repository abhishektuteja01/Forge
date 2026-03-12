"use client";

import { useState, useCallback } from "react";
import { Plus, Layers, Loader2 } from "lucide-react";
import { useStacks } from "@/hooks/useStacks";
import { createClient } from "@/lib/supabase/client";
import { routineSchema } from "@/lib/validators/routine";
import { StackCard } from "@/components/stacks/StackCard";
import {
  StackBuilder,
  type StackBuilderResult,
} from "@/components/stacks/StackBuilder";
import { Modal } from "@/components/ui/Modal";

export default function StacksPage() {
  // --------------- State ---------------
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --------------- Data ---------------
  const {
    chains,
    routines,
    loading,
    error,
    addStack,
    deleteStack,
    refreshStacks,
  } = useStacks();

  // --------------- Handlers ---------------
  const handleOpenBuilder = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleCloseBuilder = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleBuilderSubmit = useCallback(
    async (result: StackBuilderResult) => {
      if (result.mode === "existing") {
        // Simple case: stack two existing routines
        await addStack({
          anchor_routine_id: result.anchorRoutineId,
          stacked_routine_id: result.stackedRoutineId,
        });
      } else {
        // Complex case: create the new routine first, then stack it
        const parsed = routineSchema.parse(result.newRoutine);
        const supabase = createClient();

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) throw new Error("Not authenticated");

        // Insert routine and get the new ID back
        const { data: newRoutine, error: routineError } = await supabase
          .from("routines")
          .insert({
            user_id: user.id,
            name: parsed.name,
            tag: parsed.tag,
            time_of_day: parsed.time_of_day ?? null,
            sort_order: routines.length,
          })
          .select("id")
          .single();

        if (routineError) throw routineError;
        if (!newRoutine) throw new Error("Failed to create routine");

        // Now create the stack with the new routine's ID
        await addStack({
          anchor_routine_id: result.anchorRoutineId,
          stacked_routine_id: newRoutine.id,
        });

        // Refresh to pick up the new routine in the local routines list
        await refreshStacks();
      }
    },
    [addStack, routines.length, refreshStacks]
  );

  const handleDelete = useCallback(
    async (stackId: string) => {
      const confirmed = window.confirm(
        "Remove this habit from the stack? The routine itself won't be deleted."
      );
      if (!confirmed) return;

      try {
        await deleteStack(stackId);
      } catch {
        // Error logged inside hook
      }
    },
    [deleteStack]
  );

  // --------------- Loading state ---------------
  if (loading && chains.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="text-sm font-black uppercase tracking-widest">Loading chains...</span>
        </div>
      </div>
    );
  }

  // --------------- Error state ---------------
  if (error && chains.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="flex max-w-sm flex-col items-center gap-4 text-center">
          <p className="rounded-xl bg-negative/10 px-4 py-2 text-sm font-bold text-negative">{error}</p>
          <p className="text-sm font-medium text-slate-500">
            Check your connection and try refreshing.
          </p>
        </div>
      </div>
    );
  }

  // --------------- Render ---------------
  return (
    <div className="flex flex-col gap-10">
      {/* Page heading */}
      <div className="space-y-4">
        <h1 className="font-display text-5xl font-black tracking-tight text-slate-900 sm:text-6xl">
          Habit <span className="text-primary italic">Stacks</span>
        </h1>
        <p className="text-lg leading-relaxed text-slate-500 max-w-xl">
          Link new habits to existing ones. Ruthlessly leverage your <span className="font-bold text-slate-900 underline decoration-primary/30">triggers</span> to automate your automation.
        </p>
      </div>

      {/* Stack chains */}
      {chains.length > 0 ? (
        <div className="space-y-8">
          {chains.map((chain) => (
            <StackCard
              key={chain.anchor.id}
              chain={chain}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        /* Empty state - Unique personality for stacking */
        <div className="relative overflow-hidden rounded-[2.5rem] border border-black/[0.03] bg-white p-12 text-center shadow-premium">
          {/* Subtle background decorative element */}
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-indigo-50 blur-3xl" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-slate-50 shadow-inner ring-1 ring-black/[0.03]">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20">
                <Layers className="h-8 w-8 text-white" />
              </div>
            </div>
            
            <h3 className="mb-4 font-display text-3xl font-black tracking-tight text-slate-900">
              Build your first chain
            </h3>
            <p className="mx-auto mb-10 max-w-sm text-lg font-medium leading-relaxed text-slate-500">
              The secret to building new habits is to link them to existing behaviors.
              <span className="mt-2 block italic text-slate-400">&ldquo;After I [Current Habit], I will [New Habit].&rdquo;</span>
            </p>
            
            {routines.length > 0 ? (
              <button
                key="builder-btn"
                type="button"
                onClick={handleOpenBuilder}
                className="group relative inline-flex items-center gap-3 overflow-hidden rounded-2xl bg-slate-900 px-10 py-5 text-lg font-bold text-white shadow-xl transition-all hover:scale-105 hover:bg-slate-800 active:scale-95"
              >
                <Plus className="h-5 w-5" strokeWidth={3} />
                Create First Stack
              </button>
            ) : (
              <p className="rounded-2xl bg-slate-50 px-6 py-4 text-sm font-bold text-slate-400 ring-1 ring-black/[0.03]">
                Add some routines on the Scorecard first, then return to forge your first chain.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Floating action button — visible when chains exist */}
      {chains.length > 0 && routines.length > 0 && (
        <button
          type="button"
          onClick={handleOpenBuilder}
          aria-label="Create stack"
          className="fixed bottom-24 right-5 z-40 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white shadow-2xl shadow-primary/40 transition-all hover:scale-110 hover:bg-indigo-700 active:scale-90 md:bottom-10 md:right-10"
        >
          <Plus className="h-8 w-8" strokeWidth={3} />
        </button>
      )}

      {/* Builder modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseBuilder}
        title="Forge a Stack"
      >
        <StackBuilder
          key={isModalOpen ? "open" : "closed"}
          routines={routines}
          onSubmit={handleBuilderSubmit}
          onClose={handleCloseBuilder}
        />
      </Modal>
    </div>
  );
}
