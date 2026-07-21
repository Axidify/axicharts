import { describe, expect, it } from "vitest";
import { composePanel } from "./composePanel";
import { validateCartesianSpec } from "./cartesianValidation";

const ROWS = [
  { category: "Rent", value: -3500 },
  { category: "Sales", value: 12000 },
];

describe("composePanel", () => {
  it("compiles cartesian bridge recipe with prepared rows", () => {
    const result = composePanel(
      {
        questionId: "ledger.chart.waterfall",
        title: "Net flow bridge by category",
        intent: "ledger net flow bridge bar chart signed category values",
        panelType: "cartesian",
        markType: "bar",
        preparedRows: ROWS,
        xField: "category",
        yField: "value",
        stageOrder: ["Rent", "Sales"],
      },
      ROWS,
    );
    expect(result.panel.type).toBe("cartesian");
    const validation = validateCartesianSpec(result.panel, { rows: result.rows });
    expect(validation.ok).toBe(true);
  });
});
