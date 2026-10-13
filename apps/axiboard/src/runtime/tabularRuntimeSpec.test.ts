import { describe, expect, it } from "vitest";
import { createDefaultDashboard, parseDashboardSpec, parseRuntimeSpec, serializeRuntimeSpec } from "@axicharts/charts-runtime";
import { buildTabularRuntimeSpec } from "./tabularRuntimeSpec";
import type { OrchestratorChatResult } from "../api/orchestratorClient";

const samplePlan: OrchestratorChatResult = {
  dashboardIntent: "ledger overview",
  dashboardPlan: {
    title: "Ledger",
    subtitle: "MY general ledger",
    template: "finance-pnl",
    layout: "embed",
    feed: "static",
    presentation: false,
    panels: [],
    source: "rules",
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
  decisions: [
    { step: "L1 Profile", api: "profileTabular", status: "ok", notes: "3 fields" },
  ],
  dataProfile: { metrics: [], fields: [] },
  persona: "manager",
  vertical: "ledger",
  domain: {
    vertical: "ledger",
    confidence: 0.9,
    needsReview: false,
    scores: { finance: 0, ledger: 1, trading: 0, ops: 0, attendance: 0, sales: 0 },
    entities: [],
    signals: [],
  },
  summary: { kpiCount: 1, chartCount: 1, needsReview: false },
  followUpIntents: [],
  assistantMessage: "Planned dashboard",
  llm: { used: false },
};

const sourceCsv = "Date,Amount\n2026-01-01,10";

describe("buildTabularRuntimeSpec", () => {
  it("maps orchestrator result to panels runtime spec", () => {
    const spec = buildTabularRuntimeSpec(samplePlan, sourceCsv);
    expect(spec.layout).toBe("panels");
    if (spec.layout !== "panels") return;
    expect(spec.panels.vertical).toBe("ledger");
    expect(spec.panels.sourceCsv).toContain("Date,Amount");
    expect(spec.panels.kpis).toHaveLength(1);
    expect(spec.panels.charts).toHaveLength(1);
    expect(spec.panels.decisions).toHaveLength(1);
  });

  it("round-trips through workspace spec JSON", () => {
    const spec = buildTabularRuntimeSpec(samplePlan, sourceCsv);
    const dashboard = createDefaultDashboard("Ledger", spec);
    const parsed = parseDashboardSpec(dashboard);
    expect(parsed.layout).toBe("panels");
    if (parsed.layout !== "panels") return;
    expect(parsed.panels.sourceCsv).toBe(sourceCsv);
    expect(parsed.panels.decisions).toEqual(spec.panels.decisions);
    expect(parsed.panels.kpis).toHaveLength(1);
    expect(parsed.panels.charts).toHaveLength(1);

    const reloaded = parseRuntimeSpec(serializeRuntimeSpec(spec));
    expect(reloaded.layout).toBe("panels");
  });
});
