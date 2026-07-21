import { describe, expect, it } from "vitest";
import { blockMarksToDistributionProps } from "./blockMarksToDistributionProps";

const ROWS = [
  { browser: "Chrome", share: 48 },
  { browser: "Safari", share: 32 },
  { browser: "Firefox", share: 20 },
];

describe("blockMarksToDistributionProps", () => {
  it("builds slices from arc + encoding", () => {
    const result = blockMarksToDistributionProps(
      ROWS,
      [{ type: "arc", field: "share" }],
      {
        angle: { field: "share" },
        color: { field: "browser" },
      },
    );
    expect(result.slices).toHaveLength(3);
    expect(result.variant).toBe("pie");
    expect(result.slices[0]).toMatchObject({ name: "Chrome", value: 48 });
  });

  it("reads donut innerRadius and label show from marks", () => {
    const result = blockMarksToDistributionProps(
      ROWS,
      [
        { type: "arc", field: "share" },
        { type: "donut", innerRadius: 52 },
        { type: "label", show: true },
      ],
      {
        angle: { field: "share" },
        color: { field: "browser" },
      },
    );
    expect(result.innerRadius).toBe(52);
    expect(result.variant).toBe("pie");
    expect(result.showLabels).toBe(true);
  });

  it("applies cell tones by category key", () => {
    const result = blockMarksToDistributionProps(
      ROWS,
      [
        { type: "arc", field: "share" },
        { type: "cell", dataKey: "Chrome", tone: "success" },
      ],
      {
        angle: { field: "share" },
        color: { field: "browser" },
      },
    );
    expect(result.slices.find((slice) => slice.name === "Chrome")?.tone).toBe("success");
  });

  it("builds funnel stages from funnel mark + encoding", () => {
    const result = blockMarksToDistributionProps(
      [
        { stage: "Proposal", value: 85 },
        { stage: "Negotiation", value: 240 },
      ],
      [{ type: "funnel", field: "value" }],
      {
        angle: { field: "value" },
        color: { field: "stage" },
      },
    );
    expect(result.variant).toBe("funnel");
    if (result.variant === "funnel") {
      expect(result.stages).toHaveLength(2);
      expect(result.stages[0]).toMatchObject({ name: "Proposal", value: 85 });
    }
  });
});
