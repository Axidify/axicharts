import { describe, expect, it } from "vitest";
import { callTool, DATA_PROFILE_SCHEMA_URL, handlePlanDashboard } from "./tools";

const PIPELINE_CSV = `| Opportunity ID | Customer | Salesperson | Stage | Value (RM) | Probability | Expected Close | Source |
| OPP-001 | ABC | Amir | Proposal | 85,000 | 70% | 2026-08-15 | Referral |
| OPP-002 | Johor Port | Sarah | Negotiation | 240,000 | 90% | 2026-07-28 | Existing Client |
| OPP-003 | XYZ Logistics | Amir | Discovery | 45,000 | 30% | 2026-09-05 | Website |
| OPP-004 | Delta Tech | Jason | Closed Won | 68,000 | 100% | 2026-07-10 | Cold Call |`;

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

describe("C159 plan_dashboard MCP", () => {
  it("returns compiled panels, decisions, and persona from csv", () => {
    const result = handlePlanDashboard({
      csv: PIPELINE_CSV,
      persona: "executive",
      intent: "Sales pipeline board deck",
    });
    expect(result.isError).not.toBe(true);

    const payload = JSON.parse(result.content[0]!.text);
    expect(payload.ok).toBe(true);
    expect(payload.schema).toBe(DATA_PROFILE_SCHEMA_URL);
    expect(payload.persona).toBe("executive");
    expect(payload.vertical).toBe("sales");
    expect(payload.domain.vertical).toBe("sales");
    expect(payload.kpis.length).toBeGreaterThanOrEqual(3);
    expect(payload.charts.length).toBeGreaterThanOrEqual(2);
    expect(payload.decisions.some((entry: { api: string }) => entry.api === "rankQuestions")).toBe(
      true,
    );
    expect(payload.decisions.some((entry: { api: string }) => entry.api === "planDashboardShellFromIntent")).toBe(
      true,
    );
    expect(payload.dashboardPlan).toBeDefined();
    expect(payload.dashboardPlan.agentSafe).toBe(true);
    expect(payload.dashboardPlan.panels).toEqual([]);
    expect(payload.questions.ranked.length).toBeGreaterThan(0);

    const stageChart = payload.charts.find(
      (block: { questionId: string }) => block.questionId === "sales.chart.by_stage",
    );
    expect(stageChart?.panel.type).toBe("distribution");
    expect(stageChart?.panel.marks?.some((mark: { type: string }) => mark.type === "funnel")).toBe(
      true,
    );
    expect(payload.summary.needsReview).toBe(false);
  });

  it("adds follow-up charts from followUpIntents", () => {
    const result = handlePlanDashboard({
      rows: LEDGER_ROWS,
      persona: "manager",
      followUpIntents: ["show payment method breakdown"],
    });
    const payload = JSON.parse(result.content[0]!.text);
    expect(payload.vertical).toBe("ledger");
    expect(
      payload.decisions.some((entry: { step: string }) => entry.step === "Follow-up intent"),
    ).toBe(true);
    expect(
      payload.charts.some(
        (block: { questionId: string }) => block.questionId === "ledger.chart.payment_method",
      ),
    ).toBe(true);
  });

  it("errors when csv and rows are empty", () => {
    const result = callTool("plan_dashboard", { intent: "empty" });
    expect(result.isError).toBe(true);
    const payload = JSON.parse(result.content[0]!.text);
    expect(payload.ok).toBe(false);
  });
});
