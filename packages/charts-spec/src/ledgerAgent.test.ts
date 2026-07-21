import { describe, expect, it } from "vitest";
import { parseTabular, planDashboardFromRows, validateCartesianSpec } from "./index";
import { SAMPLE_LEDGER_TEXT } from "../../../apps/axiboard/src/tabular/sampleLedger";

describe("ledger agent panels validate", () => {
  it("all chart panels pass agent grammar including waterfall bridge", () => {
    const rows = parseTabular(SAMPLE_LEDGER_TEXT);
    const plan = planDashboardFromRows(rows, {
      followUpIntents: [
        "show payment method breakdown",
        "show transaction table",
        "waterfall by category",
        "stacked debit and credit",
      ],
    });
    expect(plan).not.toBeNull();

    const failures: string[] = [];
    for (const block of [...plan!.kpis, ...plan!.charts]) {
      if (block.panel.type === "table" || block.panel.type === "stat") continue;
      expect(block.decision.status, block.questionId).not.toBe("needs_review");
      expect(block.validationIssues, block.questionId).toEqual([]);
      if (block.panel.type !== "cartesian" && block.panel.type !== "blocks") {
        failures.push(`${block.questionId}: unexpected panel type ${block.panel.type}`);
        continue;
      }
      const validation = validateCartesianSpec(block.panel, { rows: block.rows });
      if (!validation.ok) {
        failures.push(
          `${block.panel.title}: ${validation.errors.map((e) => e.message).join("; ")}`,
        );
      }
    }
    expect(failures, failures.join("\n")).toEqual([]);

    const bridge = plan!.charts.find((block) => block.questionId === "ledger.chart.waterfall");
    expect(bridge?.panel.type).toBe("cartesian");
  });
});
