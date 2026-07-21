/**
 * A4 — M1 demo script (DESIGN.md § demo-script-target).
 * Rules-only path on inventory + ledger; no BYOK.
 */
import { describe, expect, it } from "vitest";
import { parseTabular, validatePanel } from "@axicharts/charts-spec";
import { saveDashboardSpec } from "@axicharts/charts-runtime";
import { createDefaultWorkspaceStore } from "@axicharts/charts-runtime/workspace";
import { buildTabularRuntimeSpec } from "../../src/runtime/tabularRuntimeSpec";
import { INVENTORY_CSV, LEDGER_CSV } from "../fixtures/tabularFixtures";
import { runOrchestratorChat } from "../orchestrator/chat";
import { clearSessions } from "../orchestrator/sessionStore";

function assertAgentPanelsValid(
  blocks: Array<{ panel: import("@axicharts/charts-spec").PanelSpec; rows: Record<string, unknown>[]; questionId: string }>,
): void {
  for (const block of blocks) {
    if (block.panel.type === "stat" || block.panel.type === "table") continue;
    const validation = validatePanel(block.panel, { rows: block.rows, strict: true });
    expect(validation.ok, `${block.questionId}: ${JSON.stringify(validation)}`).toBe(true);
  }
}

async function runDemoFlow(csv: string, label: string): Promise<void> {
  clearSessions();
  const rows = parseTabular(csv);

  const build = await runOrchestratorChat(
    rows,
    { persona: "manager", message: "Build a dashboard for this inventory" },
    undefined,
  );
  expect(build.llm.used).toBe(false);
  expect(build.kpis.length).toBeGreaterThanOrEqual(1);
  expect(build.charts.length).toBeGreaterThanOrEqual(2);
  expect(build.layout?.columns).toBeGreaterThanOrEqual(1);
  expect(build.layout?.variant).toBeTruthy();
  assertAgentPanelsValid([...build.kpis, ...build.charts]);

  const refined = await runOrchestratorChat(
    rows,
    {
      persona: "manager",
      followUpIntents: build.followUpIntents,
      message:
        label === "inventory"
          ? "Which items are below reorder level?"
          : "show payment method breakdown",
    },
    undefined,
  );
  expect(refined.llm.used).toBe(false);
  expect(refined.charts.length).toBeGreaterThanOrEqual(build.charts.length);
  if (label === "inventory") {
    expect(refined.assistantMessage.toLowerCase()).toContain("below reorder");
    expect(
      refined.charts.some((block) => block.questionId === "generic.table.below_reorder"),
    ).toBe(true);
    expect(refined.followUpQuestionIds?.length).toBeGreaterThan(0);
  }
  assertAgentPanelsValid([...refined.kpis, ...refined.charts]);

  const spec = buildTabularRuntimeSpec(refined, csv);
  expect(spec.layout).toBe("panels");
  expect(spec.panels.kpis.length).toBeGreaterThan(0);
  expect(spec.panels.charts.length).toBeGreaterThan(0);
  expect(spec.panels.sourceCsv).toContain("|");

  const seed = createDefaultWorkspaceStore({ layout: "embed", panels: [] });
  const saved = saveDashboardSpec(seed, seed.activeWorkspaceId, seed.activeDashboardId, spec, {
    meta: {
      layout: "panels",
      feed: "static",
      source: "tabular",
      persona: "manager",
      followUpIntents: refined.followUpIntents,
      vertical: refined.vertical,
      dashboardIntent: refined.dashboardIntent,
      presentation: false,
    },
  });
  const dashboard = saved.workspaces[0]?.dashboards.find((d) => d.id === saved.activeDashboardId);
  expect(dashboard?.specJson).toContain("panels");
  expect(dashboard?.meta?.source).toBe("tabular");
}

describe("A4 M1 demo script (rules-only)", () => {
  it("inventory: build → below-reorder refinement → save", async () => {
    await runDemoFlow(INVENTORY_CSV, "inventory");
  });

  it("ledger: build → payment method follow-up → save", async () => {
    await runDemoFlow(LEDGER_CSV, "ledger");
  });
});
