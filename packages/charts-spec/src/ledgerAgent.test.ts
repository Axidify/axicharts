import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { parseTabular, validateCartesianSpec } from "./index";
import { agentPlanLedgerDashboard } from "../../../apps/axiboard/src/rnd/agentPlan";
import { enrichLedger } from "../../../apps/axiboard/src/rnd/ledgerEnrich";

const sampleLedgerPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../../apps/axiboard/src/rnd/sampleLedger.ts",
);

function loadRows() {
  const source = readFileSync(sampleLedgerPath, "utf8");
  const match = source.match(/export const SAMPLE_LEDGER_TEXT = `([\s\S]*?)`;/);
  if (!match) throw new Error("sample ledger not found");
  return parseTabular(match[1]);
}

describe("ledger agent panels validate", () => {
  it("all cartesian panels pass validateCartesianSpec", () => {
    const enriched = enrichLedger(loadRows());
    expect(enriched).not.toBeNull();

    const plan = agentPlanLedgerDashboard(enriched!, {
      followUpIntents: [
        "show payment method breakdown",
        "show transaction table",
        "waterfall by category",
        "stacked debit and credit",
      ],
    });

    const failures: string[] = [];
    for (const block of [...plan.kpis, ...plan.charts]) {
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
