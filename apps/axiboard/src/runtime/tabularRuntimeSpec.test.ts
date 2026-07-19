import { describe, expect, it } from "vitest";
import { buildTabularRuntimeSpec } from "./tabularRuntimeSpec";
import type { OrchestratorChatResult } from "../api/orchestratorClient";

const samplePlan = {
  dashboardIntent: "ledger overview",
  dashboardPlan: {
    title: "Ledger",
    subtitle: "MY general ledger",
    template: "finance-pnl",
    layout: "embed",
    feed: "static",
    presentation: false,
    panels: [],
  },
  kpis: [
    {
      questionId: "kpi-1",
      panel: { type: "kpi", title: "Balance", marks: [] },
      rows: [{ balance: 1000 }],
      decision: { step: "compile", api: "compileRecipe", status: "ok", notes: "" },
      validationIssues: [],
    },
  ],
  charts: [
    {
      questionId: "chart-1",
      panel: { type: "cartesian", title: "By category", marks: [] },
      rows: [{ category: "Rent", amount: 100 }],
      decision: { step: "compile", api: "compileRecipe", status: "ok", notes: "" },
      validationIssues: [],
    },
  ],
  decisions: [],
  dataProfile: { fields: [] },
  persona: "manager",
  vertical: "ledger",
  domain: { vertical: "ledger", confidence: 0.9, needsReview: false, signals: [] },
  summary: { kpiCount: 1, chartCount: 1, needsReview: false },
  followUpIntents: [],
  assistantMessage: "Planned dashboard",
  llm: { used: false },
} as OrchestratorChatResult;

describe("buildTabularRuntimeSpec", () => {
  it("maps orchestrator result to panels runtime spec", () => {
    const spec = buildTabularRuntimeSpec(samplePlan, "Date,Amount\n2026-01-01,10");
    expect(spec.layout).toBe("panels");
    if (spec.layout !== "panels") return;
    expect(spec.panels.vertical).toBe("ledger");
    expect(spec.panels.sourceCsv).toContain("Date,Amount");
    expect(spec.panels.kpis).toHaveLength(1);
    expect(spec.panels.charts).toHaveLength(1);
  });
});
