import { describe, it, expect } from "vitest";
import { computeGrowthSeries } from "./growth-math";

describe("computeGrowthSeries", () => {
  it("should have correct initial values on day 0", () => {
    const baseline = 50;
    const horizon = 30;
    const result = computeGrowthSeries(baseline, horizon);

    expect(result[0].day).toBe(0);
    expect(result[0].current).toBe(baseline);
    expect(result[0].better).toBe(baseline);
    expect(result[0].worse).toBe(baseline);
  });

  it("should show divergence from day 1", () => {
    const baseline = 50;
    const horizon = 30;
    const result = computeGrowthSeries(baseline, horizon);

    expect(result[1].better).toBeGreaterThan(result[1].current);
    expect(result[1].worse).toBeLessThan(result[1].current);
  });

  it("should enforce the 100% cap", () => {
    const baseline = 100;
    const horizon = 90;
    const result = computeGrowthSeries(baseline, horizon);

    result.forEach((dp) => {
      expect(dp.better).toBeLessThanOrEqual(100);
      expect(dp.better).toBe(100);
    });
  });

  it("should enforce the 0% floor", () => {
    const baseline = 1;
    const horizon = 365;
    const result = computeGrowthSeries(baseline, horizon);

    result.forEach((dp) => {
      expect(dp.worse).toBeGreaterThanOrEqual(0);
    });
  });

  it("should return the correct number of data points", () => {
    const horizon = 90;
    const result = computeGrowthSeries(50, horizon);
    expect(result.length).toBe(horizon + 1);
  });
});
