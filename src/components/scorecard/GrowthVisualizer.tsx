"use client";

import React, { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/Button";
import { computeGrowthSeries } from "@/lib/growth-math";
import type { GrowthSeries } from "@/types/scorecard";

export interface GrowthVisualizerProps {
  consistencyRate: number;
}

type HorizonOption = 30 | 90 | 365;

export const GrowthVisualizer: React.FC<GrowthVisualizerProps> = ({
  consistencyRate,
}) => {
  const [baseline, setBaseline] = useState<number>(consistencyRate);
  const [horizon, setHorizon] = useState<HorizonOption>(90);

  const chartData = useMemo<GrowthSeries>(() => {
    return computeGrowthSeries(baseline, horizon);
  }, [baseline, horizon]);

  const summary = useMemo(() => {
    const horizonPoint = chartData[chartData.length - 1];
    return {
      better: horizonPoint.better.toFixed(1),
      worse: horizonPoint.worse.toFixed(1),
    };
  }, [chartData]);

  const horizonOptions: { label: string; value: HorizonOption }[] = [
    { label: "30 days", value: 30 },
    { label: "90 days", value: 90 },
    { label: "365 days", value: 365 },
  ];

  return (
    <div className="space-y-8">
      {/* Parameters Panel */}
      <div className="grid gap-6 rounded-none border-2 border-gray-900 bg-white p-6 md:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="baseline"
            className="text-xs font-bold tracking-widest text-gray-400 uppercase"
          >
            Current consistency (%)
          </label>
          <input
            id="baseline"
            type="number"
            min="1"
            max="100"
            step="0.1"
            value={baseline}
            onChange={(e) => setBaseline(Number(e.target.value))}
            className="focus:ring-primary h-12 w-full border-2 border-gray-900 px-4 font-bold text-gray-900 outline-none focus:ring-2"
          />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">
            Time horizon
          </span>
          <div className="flex gap-1 bg-gray-50 p-1">
            {horizonOptions.map((opt) => (
              <Button
                key={opt.value}
                variant={horizon === opt.value ? "primary" : "ghost"}
                size="sm"
                fullWidth
                onClick={() => setHorizon(opt.value)}
                className="h-11 min-h-[44px]"
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-none border-2 border-gray-900 bg-white p-4">
        <div className="h-[300px] w-full md:h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f3f4f6"
              />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 12, fill: "#9ca3af" }}
                axisLine={{ stroke: "#e5e7eb" }}
                tickLine={false}
                label={{
                  value: "Day",
                  position: "insideBottom",
                  offset: -10,
                  fontSize: 12,
                  fill: "#9ca3af",
                }}
              />
              <YAxis
                domain={[0, 100]}
                unit="%"
                tick={{ fontSize: 12, fill: "#9ca3af" }}
                axisLine={{ stroke: "#e5e7eb" }}
                tickLine={false}
              />
              <Tooltip
                /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                content={({ active, payload, label }: any) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="border-border rounded-none border-2 bg-white p-3 shadow-sm">
                        <p className="mb-2 text-xs font-bold text-gray-900">
                          Day {label}
                        </p>
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {payload.map((entry: any) => (
                          <div
                            key={entry.dataKey}
                            className="flex items-center justify-between gap-4 text-xs font-medium"
                            style={{ color: entry.color }}
                          >
                            <span>{entry.name}:</span>
                            <span>{Number(entry.value).toFixed(1)}%</span>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                height={36}
                iconType="circle"
                wrapperStyle={{ fontSize: 12, paddingBottom: 20 }}
              />
              <Line
                name="Current"
                type="monotone"
                dataKey="current"
                stroke="#6366F1"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
              <Line
                name="1% Better / day"
                type="monotone"
                dataKey="better"
                stroke="#22C55E"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
              <Line
                name="1% Worse / day"
                type="monotone"
                dataKey="worse"
                stroke="#EF4444"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Callout */}
      <div className="border-primary border-l-4 bg-gray-50 p-6">
        <p className="text-lg leading-relaxed font-medium text-gray-900">
          At 1% better each day, you&apos;d reach{" "}
          <span className="text-positive font-bold">{summary.better}%</span>{" "}
          consistency by day {horizon}. At 1% worse, you&apos;d be at{" "}
          <span className="text-negative font-bold">{summary.worse}%</span>.
        </p>
      </div>
    </div>
  );
};
