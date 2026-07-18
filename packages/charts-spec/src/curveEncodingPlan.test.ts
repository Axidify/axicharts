import { describe, expect, it } from "vitest";
import {
  inferLineCurveForPanel,
  intentWantsLinearCurve,
  intentWantsMonotoneCurve,
} from "./curveEncodingPlan";

describe("curveEncodingPlan", () => {
  it("detects linear curve intent phrases", () => {
    expect(intentWantsLinearCurve("Use a linear trend line")).toBe(true);
    expect(intentWantsLinearCurve("Straight line latency chart")).toBe(true);
    expect(intentWantsLinearCurve("Smooth latency trend")).toBe(false);
  });

  it("detects monotone curve intent phrases", () => {
    expect(intentWantsMonotoneCurve("Smooth curve latency trend")).toBe(true);
    expect(intentWantsMonotoneCurve("Monotone spline area")).toBe(true);
    expect(intentWantsLinearCurve("Linear only")).toBe(true);
  });

  it("infers linear curve from intent on line panels", () => {
    expect(
      inferLineCurveForPanel({
        type: "line",
        metric: { name: "latency" },
        intent: "Linear latency by hour",
      }),
    ).toBe("linear");
  });

  it("infers monotone curve from intent on area panels", () => {
    expect(
      inferLineCurveForPanel({
        type: "area",
        metric: { name: "throughput" },
        intent: "Smooth curve throughput trend",
      }),
    ).toBe("monotone");
  });

  it("honors metric tag lineCurve override", () => {
    expect(
      inferLineCurveForPanel({
        type: "line",
        metric: { name: "cpu", tags: { lineCurve: "linear" } },
      }),
    ).toBe("linear");
  });

  it("skips non-line panels", () => {
    expect(
      inferLineCurveForPanel({
        type: "bar",
        metric: { name: "throughput" },
        intent: "Linear bars",
      }),
    ).toBeUndefined();
  });
});
