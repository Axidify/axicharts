import { describe, expect, it } from "vitest";
import { parseTabular } from "@axicharts/charts-spec/planning";
import { isAgentRuntimePanel } from "@axicharts/charts-spec/planning";
import {
  callTool,
  handleCreateCartesianPanel,
  handleCreatePanel,
  handleCreateTablePanel,
  handlePlanDashboard,
} from "./tools";

const LEDGER_CSV = `| Date | Category | Debit (RM) | Credit (RM) | Balance (RM) |
| 2026-07-01 | Rent | 3500 | 0 | -3500 |
| 2026-07-02 | Sales | 0 | 12000 | 8500 |`;

describe("B3 — MCP agent path has no legacy profile planner panels", () => {
  it("create_panel never emits donut/gauge/waterfall panel types", () => {
    const intents = [
      { family: "cartesian" as const, intent: "bar chart of debit by category" },
      { family: "distribution" as const, intent: "browser share donut chart" },
      { family: "matrix" as const, intent: "latency heatmap by hour and day" },
    ];
    for (const args of intents) {
      const payload = JSON.parse(handleCreatePanel(args).content[0]!.text);
      expect(isAgentRuntimePanel(payload.panel)).toBe(true);
      expect(["donut", "gauge", "waterfall", "pie", "funnel"]).not.toContain(
        payload.panel.type,
      );
    }
  });

  it("create_cartesian_panel with aggregation stays agent-runtime", () => {
    const payload = JSON.parse(
      handleCreateCartesianPanel({
        intent: "bar chart of count by category",
        rows: [
          { category: "Rent", value: 1 },
          { category: "Sales", value: 2 },
        ],
        groupBy: "category",
        aggregates: { count: { op: "count" } },
        xField: "category",
        yField: "count",
      }).content[0]!.text,
    );
    expect(payload.panel.type).toBe("cartesian");
  });

  it("create_table_panel emits table widget only", () => {
    const payload = JSON.parse(handleCreateTablePanel({ title: "Rows" }).content[0]!.text);
    expect(payload.panel.type).toBe("table");
  });

  it("plan_dashboard charts are agent-runtime on ledger fixture", () => {
    const payload = JSON.parse(
      handlePlanDashboard({
        csv: LEDGER_CSV,
        followUpIntents: ["waterfall by category"],
      }).content[0]!.text,
    );
    expect(payload.ok).toBe(true);
    for (const block of [...payload.kpis, ...payload.charts]) {
      expect(isAgentRuntimePanel(block.panel), block.questionId).toBe(true);
    }
  });

  it("smoke: MCP tool chain does not surface legacy types", () => {
    const created = JSON.parse(
      callTool("create_panel", {
        family: "distribution",
        intent: "revenue share breakdown donut",
        fields: ["segment", "revenue"],
      }).content[0]!.text,
    );
    expect(created.panel.type).toBe("distribution");
    const rows = parseTabular(LEDGER_CSV);
    const planned = JSON.parse(
      callTool("plan_dashboard", { rows, persona: "manager" }).content[0]!.text,
    );
    for (const block of [...planned.kpis, ...planned.charts]) {
      expect(block.panel.type).not.toBe("donut");
      expect(block.panel.type).not.toBe("gauge");
    }
  });
});
