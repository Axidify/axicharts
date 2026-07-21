import { describe, expect, it } from "vitest";
import { parseTabular } from "@axicharts/charts-spec";
import { planDashboardForMcp } from "@axicharts/charts-mcp";
import { DATA_PROFILE_SCHEMA_URL } from "@axicharts/charts-mcp";
import {
  ATTENDANCE_CSV,
  INCIDENT_CSV,
  INVENTORY_CSV,
  LEDGER_CSV,
  RESTAURANT_CSV,
  SALES_CSV,
} from "../fixtures/tabularFixtures";
import { snapshotFromMcp, snapshotFromOrchestrator } from "./normalizePlan";
import { runTabularPlan } from "../orchestrator/plan";

type PlanOptions = {
  persona?: "executive" | "manager" | "analyst";
  followUpIntents?: string[];
  refinementIntent?: string;
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
    expect(stageChart?.panel.type).toBe("distribution");
    expect(stageChart?.panel.marks?.some((mark) => mark.type === "funnel")).toBe(true);
    expect(stageChart?.decision.status).toBe("validated");
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
      refinementIntent: "Which items are below reorder level?",
    });
    const orch = runTabularPlan(rows, {
      persona: "manager",
      followUpIntents: ["Which items are below reorder level?"],
      refinementIntent: "Which items are below reorder level?",
    });
    expect(
      orch!.charts.some(
        (block) =>
          block.questionId === "generic.table.below_reorder" ||
          String(block.panel.title ?? "").toLowerCase().includes("reorder"),
      ),
    ).toBe(true);
    expect(orch!.followUpQuestionIds).toContain("generic.table.below_reorder");
  });

  it("incident fixture plans agent compose dashboard", () => {
    const rows = parseTabular(INCIDENT_CSV);
    assertMcpOrchestratorParity(rows, { persona: "manager" });
    const orch = runTabularPlan(rows, { persona: "manager" });
    expect(orch!.kpis.length).toBeGreaterThanOrEqual(2);
    expect(orch!.charts.length).toBeGreaterThanOrEqual(2);
    expect(orch!.charts.some((block) => block.panel.title === "Incident tickets")).toBe(true);
    for (const block of [...orch!.kpis, ...orch!.charts]) {
      if (block.panel.type === "table" || block.panel.type === "stat") continue;
      expect(block.validationIssues, block.questionId).toEqual([]);
    }
  });

  it("incident follow-up adds open tickets table (C181)", () => {
    const rows = parseTabular(INCIDENT_CSV);
    const intent = "Show open tickets only";
    assertMcpOrchestratorParity(rows, {
      persona: "manager",
      followUpIntents: [intent],
      refinementIntent: intent,
    });
    const orch = runTabularPlan(rows, {
      persona: "manager",
      followUpIntents: [intent],
      refinementIntent: intent,
    });
    expect(orch!.followUpQuestionIds).toContain("agent.incident.followup.open_table");
    expect(orch!.charts.some((block) => block.panel.title === "Open tickets")).toBe(true);
  });

  it("restaurant fixture generic compose (C177)", () => {
    const rows = parseTabular(RESTAURANT_CSV);
    assertMcpOrchestratorParity(rows, { persona: "manager" });
    const orch = runTabularPlan(rows, { persona: "manager" });
    expect(orch!.planSource).toBe("l4b");
    expect(orch!.kpis.length).toBeGreaterThanOrEqual(1);
    expect(orch!.charts.length).toBeGreaterThanOrEqual(2);
    for (const block of [...orch!.kpis, ...orch!.charts]) {
      if (block.panel.type === "table" || block.panel.type === "stat") continue;
      expect(block.validationIssues, block.questionId).toEqual([]);
    }
  });
});
