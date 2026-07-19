import { describe, expect, it } from "vitest";
import { parseTabular, planDashboardFromRows, validateCartesianSpec } from "./index";
import { SAMPLE_LEDGER_TEXT } from "../../../apps/axiboard/src/tabular/sampleLedger";

describe("ledger agent panels validate", () => {
  it("all cartesian panels pass validateCartesianSpec", () => {
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
      if (block.panel.type === "table" || block.panel.type === "waterfall") continue;
      if (block.panel.type === "stat") continue;
      if (block.panel.type !== "cartesian" && block.panel.type !== "blocks") continue;
      const validation = validateCartesianSpec(block.panel, { rows: block.rows });
      if (!validation.ok) {
        failures.push(
          `${block.panel.title}: ${validation.errors.map((e) => e.message).join("; ")} | keys=${Object.keys(block.rows[0] ?? {}).join(",")} | marks=${block.panel.marks?.map((m) => m.field).join(",")}`,
        );
      }
    }
    expect(failures, failures.join("\n")).toEqual([]);
  });
});
