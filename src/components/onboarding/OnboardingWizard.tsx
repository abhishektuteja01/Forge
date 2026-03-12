"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

import { Plus, Trash2, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

interface RoutineEntry {
  id: string; // Temporary UI id
  name: string;
  tag: "positive" | "negative" | "neutral";
  time_of_day: "morning" | "afternoon" | "evening" | "night" | "";
}

const DEFAULT_ENTRY: Omit<RoutineEntry, "id"> = {
  name: "",
  tag: "neutral",
  time_of_day: "",
};
const generateId = () => Math.random().toString(36).substring(2, 9);

export function OnboardingWizard() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [routines, setRoutines] = useState<RoutineEntry[]>([
    { id: generateId(), ...DEFAULT_ENTRY },
    { id: generateId(), ...DEFAULT_ENTRY },
    { id: generateId(), ...DEFAULT_ENTRY },
  ]);

  const handleUpdate = (
    id: string,
    field: keyof RoutineEntry,
    value: string
  ) => {
    setRoutines((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const handleAddRow = () => {
    setRoutines((prev) => [...prev, { id: generateId(), ...DEFAULT_ENTRY }]);
  };

  const handleRemoveRow = (id: string) => {
    setRoutines((prev) => prev.filter((r) => r.id !== id));
  };

  const tagColors = {
    positive: "border-positive bg-green-50 text-positive",
    negative: "border-negative bg-red-50 text-negative",
    neutral: "border-neutral bg-gray-50 text-gray-700",
  };

  const handleComplete = async (skip = false) => {
    setLoading(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be logged in to complete onboarding.");
      setLoading(false);
      return;
    }

    try {
      if (!skip) {
        // Collect valid inputs to save
        const validRoutines = routines.filter((r) => r.name.trim().length > 0);

        if (validRoutines.length > 0) {
          const insertPayload = validRoutines.map((r, index) => ({
            user_id: user.id,
            name: r.name.trim(),
            tag: r.tag,
            time_of_day: r.time_of_day === "" ? null : r.time_of_day,
            sort_order: index,
          }));

          const { error: insertError } = await supabase
            .from("routines")
            .insert(insertPayload);

          if (insertError) throw insertError;
        }
      }

      // Complete Onboarding flag
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ onboarding_complete: true })
        .eq("id", user.id);

      if (updateError) throw updateError;

      // Force router refresh and go to scorecard
      router.push("/scorecard");
      router.refresh();
    } catch (err: unknown) {
      const error = err as Error;
      setError(error?.message || "Failed to save onboarding data.");
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-lg p-6">
      <h1 className="sr-only">Onboarding</h1>

      {error && (
        <div className="border-negative text-negative animate-in fade-in slide-in-from-top-4 mb-6 border-2 bg-red-50 p-4 text-sm font-bold">
          {error}
        </div>
      )}

      {/* Step 1 */}
      {step === 1 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 flex flex-col duration-500">
          <div className="border-primary text-primary mb-4 inline-flex items-center self-start border-2 px-3 py-1 text-xs font-bold tracking-[0.2em] uppercase">
            Step 1 of 2
          </div>
          <h1 className="font-display mb-6 text-4xl font-bold tracking-tight text-gray-900">
            Welcome to the Forge.
          </h1>
          <p className="mb-10 text-xl leading-relaxed text-gray-500">
            Most apps track <em>what</em> you do. We track <em>why</em>.
            You&apos;re about to map out your initial routine and tag habits as
            positive, negative, or neutral. Don&apos;t worry, you can always
            change this later.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Button
              variant="primary"
              onClick={() => setStep(2)}
              className="flex-1"
            >
              Start Scorecard <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="ghost" onClick={() => handleComplete(true)}>
              Skip
            </Button>
          </div>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="animate-in fade-in slide-in-from-right-8 flex flex-col duration-500">
          <div className="border-primary text-primary mb-4 inline-flex items-center self-start border-2 px-3 py-1 text-xs font-bold tracking-[0.2em] uppercase">
            Step 2 of 2
          </div>
          <h2 className="font-display mb-2 text-3xl font-bold tracking-tight text-gray-900">
            Current Habits
          </h2>
          <p className="mb-8 text-sm text-gray-500">
            List at least 3 things you do on a normal day. Tag them truthfully.
          </p>

          <div className="space-y-4">
            {routines.map((routine, i) => (
              <div
                key={routine.id}
                className="flex items-center gap-3 border-2 border-gray-900 bg-white p-3"
              >
                <div className="font-display font-medium text-gray-300">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={routine.name}
                    onChange={(e) =>
                      handleUpdate(routine.id, "name", e.target.value)
                    }
                    placeholder="e.g. Check phone in bed"
                    className="w-full bg-transparent px-2 py-1 font-semibold text-gray-900 outline-none placeholder:font-normal placeholder:text-gray-400 focus:bg-gray-50"
                  />
                </div>
                <select
                  value={routine.tag}
                  onChange={(e) =>
                    handleUpdate(routine.id, "tag", e.target.value)
                  }
                  className={`cursor-pointer appearance-none border-2 bg-transparent px-3 py-1 text-xs font-bold tracking-wider uppercase outline-none focus:ring-2 focus:ring-gray-900 ${
                    tagColors[routine.tag]
                  }`}
                >
                  <option value="positive">(+) Pos</option>
                  <option value="neutral">(=) Neu</option>
                  <option value="negative">(-) Neg</option>
                </select>

                <select
                  value={routine.time_of_day}
                  onChange={(e) =>
                    handleUpdate(routine.id, "time_of_day", e.target.value)
                  }
                  className="focus:ring-primary cursor-pointer appearance-none border-2 border-gray-900 bg-white px-3 py-1 text-xs font-bold tracking-wider text-gray-900 uppercase outline-none focus:ring-2"
                >
                  <option value="">Any Time</option>
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                  <option value="evening">Evening</option>
                  <option value="night">Night</option>
                </select>

                <button
                  type="button"
                  onClick={() => handleRemoveRow(routine.id)}
                  disabled={routines.length <= 1}
                  className="hover:text-negative p-1 text-gray-400 disabled:opacity-30"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-start">
            <button
              type="button"
              onClick={handleAddRow}
              className="text-primary inline-flex items-center text-sm font-bold tracking-widest uppercase hover:text-indigo-600"
            >
              <Plus className="mr-1 h-4 w-4" /> Add Row
            </button>
          </div>

          <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:justify-between">
            <Button
              variant="ghost"
              disabled={loading}
              onClick={() => handleComplete(true)}
            >
              Skip
            </Button>
            <Button
              variant="primary"
              loading={loading}
              onClick={() => handleComplete(false)}
              className="sm:w-auto"
            >
              Enter Dashboard
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
