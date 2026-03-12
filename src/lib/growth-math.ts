import { GrowthSeries } from "@/types/scorecard";

export function computeGrowthSeries(
  baseline: number,
  horizon: number
): GrowthSeries {
  const series: GrowthSeries = [];

  for (let day = 0; day <= horizon; day++) {
    // Current trajectory (0% change)
    const current = baseline;

    // Better (1% better per day)
    const better = baseline * Math.pow(1.01, day);

    // Worse (1% worse per day)
    const worse = baseline * Math.pow(0.99, day);

    series.push({
      day,
      current: Math.min(100, Math.max(0, current)),
      better: Math.min(100, Math.max(0, better)),
      worse: Math.min(100, Math.max(0, worse)),
    });
  }

  return series;
}
