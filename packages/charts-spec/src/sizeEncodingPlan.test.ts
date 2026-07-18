import { describe, expect, it } from "vitest";
import {
  findProfileSizeField,
  inferSizeEncodingForPanel,
  intentWantsSizeEncoding,
} from "./sizeEncodingPlan";

describe("sizeEncodingPlan", () => {
  it("detects size intent phrases", () => {
    expect(intentWantsSizeEncoding("Bar width by volume")).toBe(true);
    expect(intentWantsSizeEncoding("Dot size by weight")).toBe(true);
    expect(intentWantsSizeEncoding("Weekly throughput overview")).toBe(false);
  });

  it("finds size fields from profile columns", () => {
    expect(
      findProfileSizeField(["week", "throughput", "volume"]),
    ).toBe("volume");
    expect(findProfileSizeField(["time", "latency", "weight"])).toBe("weight");
    expect(findProfileSizeField(["throughput"], "throughput")).toBeUndefined();
  });

  it("infers encoding.size for volume metrics on bar panels", () => {
    const encoding = inferSizeEncodingForPanel({
      type: "bar",
      metric: { name: "volume", unit: "units" },
      profileFields: ["week", "volume", "weight"],
    });

    expect(encoding).toEqual({
      field: "weight",
      type: "quantitative",
    });
  });

  it("infers encoding.size when intent requests proportional bars", () => {
    const encoding = inferSizeEncodingForPanel({
      type: "bar",
      metric: { name: "throughput", unit: "req/min" },
      intent: "Throughput sized by volume",
      profileFields: ["week", "throughput", "volume"],
    });

    expect(encoding?.field).toBe("volume");
  });

  it("honors metric tag sizeField override", () => {
    const encoding = inferSizeEncodingForPanel({
      type: "line",
      metric: {
        name: "latency",
        tags: { sizeField: "samples" },
      },
      profileFields: ["time", "latency", "volume"],
    });

    expect(encoding).toEqual({ field: "samples", type: "quantitative" });
  });

  it("skips non-cartesian panels", () => {
    expect(
      inferSizeEncodingForPanel({
        type: "gauge",
        metric: { name: "cpu" },
        profileFields: ["volume"],
      }),
    ).toBeUndefined();
  });
});
