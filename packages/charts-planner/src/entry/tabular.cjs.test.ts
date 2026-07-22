import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const tabularCjs = require(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "../../dist/entry/tabular.cjs"),
) as typeof import("./tabular");

describe("tabular CJS entry", () => {
  it("supports require() for planDashboardFromRows", () => {
    const plan = tabularCjs.planDashboardFromRows(
      [
        { status: "open", amount: 10 },
        { status: "done", amount: 25 },
      ],
      { intent: "pie chart by status" },
    );

    expect(plan).not.toBeNull();
    const pie = plan!.charts.find((block) => block.questionId.startsWith("generic.chart.pie."));
    expect(pie?.panel.type).toBe("distribution");
    expect(pie?.panel.marks?.some((mark) => mark.type === "arc")).toBe(true);
  });
});
