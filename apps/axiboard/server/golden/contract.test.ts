import { describe, expect, it } from "vitest";
import { parseTabular } from "@axicharts/charts-spec";
import { planDashboardForMcp } from "@axicharts/charts-mcp";
import { DATA_PROFILE_SCHEMA_URL } from "@axicharts/charts-mcp";
import {
  ATTENDANCE_CSV,
  INVENTORY_CSV,
  LEDGER_CSV,
  SALES_CSV,
} from "../fixtures/tabularFixtures";
import { snapshotFromMcp, snapshotFromOrchestrator } from "./normalizePlan";
import { runTabularPlan } from "../orchestrator/plan";

type PlanOptions = {
  persona?: "executive" | "manager" | "analyst";
  followUpIntents?: string[];
  intent?: string;
};

function assertMcpOrchestratorParity(
  rows: Record<string, unknown>[],
  options: PlanOptions = {},
): void {
  const mcp = planDashboardForMcp(rows, options, DATA_PROFILE_SCHEMA_URL);
  expect(mcp.ok).toBe(true);
  if (!mcp.ok) return;

  const orchestrator = runTabularPlan(rows, options);
  expect(orchestrator).not.toBeNull();

  expect(snapshotFromMcp(mcp)).toEqual(snapshotFromOrchestrator(orchestrator!));
}

describe("C161 golden contract — MCP plan_dashboard ≡ orchestrator plan", () => {
  it("ledger fixture (manager)", () => {
    const rows = parseTabular(LEDGER_CSV);
    assertMcpOrchestratorParity(rows, { persona: "manager" });
    const orch = runTabularPlan(rows, { persona: "manager" });
    expect(orch!.vertical).toBe("ledger");
    expect(orch!.kpis.length).toBeGreaterThanOrEqual(3);
    expect(orch!.charts.length).toBeGreaterThanOrEqual(2);
  });

  it("sales pipeline fixture (executive)", () => {
    const rows = parseTabular(SALES_CSV);
    assertMcpOrchestratorParity(rows, {
      persona: "executive",
      intent: "Sales pipeline board deck",
    });
    const orch = runTabularPlan(rows, {
      persona: "executive",
      intent: "Sales pipeline board deck",
    });
    expect(orch!.vertical).toBe("sales");
    const stageChart = orch!.charts.find((block) => block.questionId === "sales.chart.by_stage");
    expect(stageChart?.panel.type).toBe("funnel");
  });

  it("attendance fixture (manager)", () => {
    const rows = parseTabular(ATTENDANCE_CSV);
    assertMcpOrchestratorParity(rows, { persona: "manager" });
    const orch = runTabularPlan(rows, { persona: "manager" });
    expect(orch!.vertical).toBe("attendance");
  });

  it("ledger follow-up intents match on both surfaces", () => {
    const rows = parseTabular(LEDGER_CSV);
    assertMcpOrchestratorParity(rows, {
      persona: "manager",
      followUpIntents: ["show payment method breakdown"],
    });
    const orch = runTabularPlan(rows, {
      persona: "manager",
      followUpIntents: ["show payment method breakdown"],
    });
    expect(
      orch!.charts.some((block) => block.questionId === "ledger.chart.payment_method"),
    ).toBe(true);
  });

  it("inventory follow-up adds below-reorder table (C181)", () => {
    const rows = parseTabular(INVENTORY_CSV);
    assertMcpOrchestratorParity(rows, {
      persona: "manager",
      followUpIntents: ["Which items are below reorder level?"],
    });
    const orch = runTabularPlan(rows, {
      persona: "manager",
      followUpIntents: ["Which items are below reorder level?"],
    });
    expect(
      orch!.charts.some(
        (block) =>
          block.questionId === "generic.table.below_reorder" ||
          String(block.panel.title ?? "").toLowerCase().includes("reorder"),
      ),
    ).toBe(true);
  });
});
