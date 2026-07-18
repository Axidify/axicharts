import { describe, expect, it } from "vitest";
import {
  findProfileColorField,
  inferColorEncodingForPanel,
  intentWantsColorEncoding,
} from "./colorEncodingPlan";

describe("colorEncodingPlan", () => {
  it("detects color intent phrases", () => {
    expect(intentWantsColorEncoding("Color bars by above target")).toBe(true);
    expect(intentWantsColorEncoding("Throughput vs plan weekly")).toBe(true);
    expect(intentWantsColorEncoding("Line 3 overview")).toBe(false);
  });

  it("finds semantic color fields from profile columns", () => {
    expect(
      findProfileColorField(["week", "throughput", "aboveTarget"]),
    ).toBe("aboveTarget");
    expect(findProfileColorField(["week", "meets_slo", "latency"])).toBe(
      "meets_slo",
    );
  });

  it("infers encoding.color for throughput metrics with profile fields", () => {
    const encoding = inferColorEncodingForPanel({
      type: "bar",
      metric: { name: "throughput", unit: "req/min" },
      profileFields: ["week", "throughput", "aboveTarget"],
    });

    expect(encoding).toEqual({
      field: "aboveTarget",
      type: "semantic",
    });
  });

  it("infers encoding.color when intent requests target coloring", () => {
    const encoding = inferColorEncodingForPanel({
      type: "line",
      metric: { name: "latency", unit: "ms" },
      intent: "Color latency above SLO target",
      profileFields: ["time", "latency", "meets_slo"],
    });

    expect(encoding?.field).toBe("meets_slo");
  });

  it("honors metric tag colorField override", () => {
    const encoding = inferColorEncodingForPanel({
      type: "line",
      metric: {
        name: "custom",
        tags: { colorField: "severity" },
      },
      profileFields: ["time", "value", "aboveTarget"],
    });

    expect(encoding).toEqual({ field: "severity", type: "semantic" });
  });

  it("skips non-cartesian panels", () => {
    expect(
      inferColorEncodingForPanel({
        type: "gauge",
        metric: { name: "cpu" },
        profileFields: ["aboveTarget"],
      }),
    ).toBeUndefined();
  });
});
