import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { composeFunnelMarks } from "./composeFunnel";
import { Funnel } from "./marks";

const DATA = [
  { stage: "Leads", count: 1200 },
  { stage: "Qualified", count: 640 },
  { stage: "Won", count: 180 },
];

describe("composeFunnelMarks", () => {
  it("builds stages from funnel mark keys", () => {
    const composed = composeFunnelMarks(
      [
        createElement(Funnel, {
          dataKey: "count",
          nameKey: "stage",
          sort: "descending",
        }),
      ],
      DATA,
      {
        Won: { label: "Closed won" },
      },
    );

    expect(composed.sort).toBe("descending");
    expect(composed.stages).toEqual([
      { key: "Leads", name: "Leads", value: 1200 },
      { key: "Qualified", name: "Qualified", value: 640 },
      { key: "Won", name: "Won", value: 180 },
    ]);
  });
});
