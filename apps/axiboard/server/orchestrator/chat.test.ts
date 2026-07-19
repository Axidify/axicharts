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
});
