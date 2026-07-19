import { describe, expect, it } from "vitest";
import { composeLayout } from "./composeLayout";

describe("composeLayout", () => {
  it("pins table panels to bottom variant", () => {
    const layout = composeLayout({
      kpis: [],
      charts: [
        {
          questionId: "generic.table.rows",
          panel: { specVersion: 1, type: "table", title: "Table", theme: "clean", mode: "interactive", props: { columns: [] } },
          rows: [],
          validationIssues: [],
          decision: { step: "x", api: "y", status: "ok", notes: "" },
        },
      ],
    });
    expect(layout.variant).toBe("table-pinned-bottom");
  });
});
