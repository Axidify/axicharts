import { describe, expect, it } from "vitest";
import { wordCloudFromRows } from "./wordCloudEncoding";

describe("wordCloudFromRows", () => {
  it("returns words from props when provided", () => {
    const words = [{ text: "latency", value: 42 }];
    expect(
      wordCloudFromRows([], { words }, undefined),
    ).toEqual({ words });
  });

  it("maps rows using encoding fields", () => {
    const result = wordCloudFromRows(
      [
        { tag: "timeout", count: 12, tone: "critical" },
        { tag: "retry", count: 8, tone: "warning" },
      ],
      {},
      {
        name: { field: "tag" },
        value: { field: "count" },
      },
    );

    expect(result.words).toEqual([
      { text: "timeout", value: 12, tone: "critical", color: undefined },
      { text: "retry", value: 8, tone: "warning", color: undefined },
    ]);
  });

  it("defaults to text/value columns", () => {
    const result = wordCloudFromRows(
      [{ text: "api", value: 5 }],
      {},
      undefined,
    );

    expect(result.words).toEqual([
      { text: "api", value: 5, tone: undefined, color: undefined },
    ]);
  });
});
