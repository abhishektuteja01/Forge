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
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="text-sm font-medium">Loading stacks...</span>
        </div>
      </div>
    );
  }

  // --------------- Error state ---------------
  if (error && chains.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="flex max-w-sm flex-col items-center gap-3 text-center">
          <p className="text-sm font-medium text-negative">{error}</p>
          <p className="text-sm text-gray-500">
            Check your connection and try refreshing.
          </p>
        </div>
      </div>
    );
  }

  // --------------- Render ---------------
  return (
    <div className="mx-auto w-full max-w-lg px-4 py-6 duration-500 animate-in fade-in slide-in-from-bottom-4">
      {/* Page heading */}
      <h1 className="mb-2 font-display text-2xl font-bold tracking-tight text-gray-900">
        Habit Stacks
      </h1>
      <p className="mb-8 text-sm text-gray-500">
        Link new habits to existing ones: &ldquo;After I _____, I will
        _____.&rdquo;
      </p>

      {/* Stack chains */}
      {chains.length > 0 ? (
        <div className="space-y-4">
          {chains.map((chain) => (
            <StackCard
              key={chain.anchor.id}
              chain={chain}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        /* Empty state */
        <div className="flex flex-col items-center justify-center border-2 border-gray-900 bg-white px-6 py-16 text-center">
          <div className="mb-6 flex h-14 w-14 items-center justify-center border-2 border-primary bg-white">
            <Layers className="h-7 w-7 text-primary" />
          </div>
          <h3 className="mb-2 font-display text-lg font-bold text-gray-900">
            Build your first stack
          </h3>
          <p className="mb-6 max-w-xs text-sm text-gray-500">
            Anchor a new habit to something you already do. Don&apos;t rely on
            motivation — rely on triggers.
          </p>
          {routines.length > 0 ? (
            <button
              type="button"
              onClick={handleOpenBuilder}
              className="inline-flex items-center gap-2 border-2 border-gray-900 bg-gray-900 px-6 py-3 text-sm font-bold uppercase tracking-widest text-white transition-colors hover:bg-black"
            >
              <Plus className="h-4 w-4" />
              Create your first stack
            </button>
          ) : (
            <p className="text-sm italic text-gray-400">
              Add some routines on the Scorecard first, then come back here.
            </p>
          )}
        </div>
      )}

      {/* Floating action button — visible when chains exist */}
      {chains.length > 0 && routines.length > 0 && (
        <button
          type="button"
          onClick={handleOpenBuilder}
          aria-label="Create stack"
          className="fixed bottom-24 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-none border-2 border-gray-900 bg-primary text-white transition-all hover:bg-indigo-600 active:scale-95 md:bottom-8 md:right-8"
        >
          <Plus className="h-6 w-6" strokeWidth={2.5} />
        </button>
      )}

      {/* Builder modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseBuilder}
        title="New Habit Stack"
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
