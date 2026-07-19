import { describe, expect, it } from "vitest";
import { runOrchestratorChat } from "./chat";
import { runTabularPlan } from "./plan";
import { clearSessions } from "./sessionStore";

const LEDGER_ROWS = [
  {
    Date: "2026-07-01",
    Category: "Rent",
    "Debit (RM)": 3500,
    "Credit (RM)": 0,
    "Balance (RM)": -3500,
    "Cost Center": "HQ",
    "Payment Method": "Bank",
  },
  {
    Date: "2026-07-02",
    Category: "Sales",
    "Debit (RM)": 0,
    "Credit (RM)": 12000,
    "Balance (RM)": 8500,
    "Cost Center": "Sales",
    "Payment Method": "Bank",
  },
];

describe("axiboard orchestrator", () => {
  it("plans ledger dashboard rules-only", () => {
    const plan = runTabularPlan(LEDGER_ROWS, { persona: "manager" });
    expect(plan).not.toBeNull();
    expect(plan!.vertical).toBe("ledger");
    expect(plan!.kpis.length).toBeGreaterThanOrEqual(3);
    expect(plan!.decisions.some((entry) => entry.api === "rankQuestions")).toBe(true);
  });

  it("chat turn adds follow-up intent without LLM", async () => {
    clearSessions();
    const result = await runOrchestratorChat(
      LEDGER_ROWS,
      {
        persona: "manager",
        message: "show payment method breakdown",
      },
      undefined,
    );
    expect(result.llm.used).toBe(false);
    expect(result.followUpIntents).toContain("show payment method breakdown");
    expect(
      result.charts.some((block) =>
        String(block.panel.title ?? "").toLowerCase().includes("payment"),
      ),
    ).toBe(true);
  });

  it("infers executive persona from board deck message", async () => {
    const result = await runOrchestratorChat(
      LEDGER_ROWS,
      {
        message: "Board deck for CFO — balance overview",
      },
      undefined,
    );
    expect(result.persona).toBe("executive");
  });

  it("does not treat build-dashboard message as follow-up intent", async () => {
    const result = await runOrchestratorChat(
      LEDGER_ROWS,
      {
        persona: "manager",
        message: "Build a dashboard for this data",
      },
      undefined,
    );
    expect(result.followUpIntents).not.toContain("Build a dashboard for this data");
  });

  it("does not treat build-a-project-dashboard message as follow-up intent", async () => {
    const result = await runOrchestratorChat(
      LEDGER_ROWS,
      {
        persona: "manager",
        message: "Build a project task dashboard",
      },
      undefined,
    );
    expect(result.followUpIntents).not.toContain("Build a project task dashboard");
  });

  it("composes project task dashboard from task tracker CSV", async () => {
    const rows = [
      {
        "Task ID": "T001",
        Project: "ERP Upgrade",
        Task: "Database Migration",
        Owner: "Amir",
        Priority: "High",
        Status: "In Progress",
        "Start Date": "2026-07-10",
        "Due Date": "2026-07-25",
        Progress: "75%",
      },
      {
        "Task ID": "T002",
        Project: "ERP Upgrade",
        Task: "UAT Testing",
        Owner: "Sarah",
        Priority: "Medium",
        Status: "Not Started",
        "Start Date": "2026-07-26",
        "Due Date": "2026-08-05",
        Progress: "0%",
      },
    ];
    const result = await runOrchestratorChat(
      rows,
      { persona: "manager", message: "Build a project task dashboard" },
      undefined,
    );
    expect(result.decisions.some((decision) => decision.api === "composeProjectTaskDashboard")).toBe(true);
    expect(result.kpis.some((block) => block.panel.title === "Total tasks")).toBe(true);
    expect(result.charts.some((block) => block.panel.title === "Tasks by status")).toBe(true);
    expect(result.assistantMessage.toLowerCase()).toContain("project task dashboard");
  });

  it("explains inventory reorder refinement in assistant message", async () => {
    const inventoryRows = [
      { SKU: "W1", Product: "Bolt", Stock: 8, "Reorder Level": 25, "Unit Cost": 1, "Unit Price": 2 },
      { SKU: "W2", Product: "Gasket", Stock: 120, "Reorder Level": 40, "Unit Cost": 2, "Unit Price": 5 },
    ];
    const base = await runOrchestratorChat(
      inventoryRows,
      { persona: "manager", message: "Build a dashboard for this data" },
      undefined,
    );
    expect(base.followUpIntents).toHaveLength(0);

    const refined = await runOrchestratorChat(
      inventoryRows,
      {
        persona: "manager",
        followUpIntents: base.followUpIntents,
        message: "Which items are below reorder level?",
      },
      undefined,
    );
    expect(refined.assistantMessage.toLowerCase()).toContain("below reorder");
    expect(
      refined.charts.some((block) => block.questionId === "generic.table.below_reorder"),
    ).toBe(true);
  });
});
