import { createClient } from "@/lib/supabase/server";
import { GrowthVisualizer } from "@/components/scorecard/GrowthVisualizer";
import { TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function GrowthPage() {
  let consistencyRate = 50.0;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const dateString = thirtyDaysAgo.toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("check_ins")
        .select("completed")
        .eq("user_id", user.id)
        .gte("date", dateString);

      if (error) throw error;

      if (data && data.length > 0) {
        const completed = data.filter((ci) => ci.completed).length;
        consistencyRate = Number(((completed / data.length) * 100).toFixed(1));
      }
    }
  } catch (err) {
    console.error("Error fetching consistency rate:", err);
    consistencyRate = 50.0;
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 mx-auto w-full max-w-4xl px-4 py-8 duration-500">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center border-2 border-gray-900 bg-indigo-50 text-primary">
          <TrendingUp className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-gray-900">
            Compound Growth
          </h1>
          <p className="text-sm font-medium text-gray-500">
            Visualize the long-term power of small daily changes.
          </p>
        </div>
      </div>

      <GrowthVisualizer consistencyRate={consistencyRate} />
    </div>
  );
}
