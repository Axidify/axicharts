import { describe, expect, it } from "vitest";
import { inferFieldRoles } from "../inferFieldRoles";
import { parseTabular } from "../parseTabular";
import { planDashboardFromRows } from "./planDashboardFromRows";

const PIPELINE_TEXT = `| Opportunity ID | Customer | Salesperson | Stage | Value (RM) | Probability | Expected Close | Source |
| OPP-001 | ABC | Amir | Proposal | 85,000 | 70% | 2026-08-15 | Referral |
| OPP-002 | Johor Port | Sarah | Negotiation | 240,000 | 90% | 2026-07-28 | Existing Client |
| OPP-003 | XYZ Logistics | Amir | Discovery | 45,000 | 30% | 2026-09-05 | Website |
| OPP-004 | Delta Tech | Jason | Closed Won | 68,000 | 100% | 2026-07-10 | Cold Call |`;

const LEDGER_TEXT = `| Date | Transaction ID | Category | Debit (RM) | Credit (RM) | Balance (RM) | Cost Center | Payment Method |
| 2026-07-01 | TXN-001 | Rent | 3500 | 0 | -3500 | HQ | Bank |
| 2026-07-02 | TXN-002 | Sales | 0 | 12000 | 8500 | Sales | Bank |
| 2026-07-03 | TXN-003 | Utilities | 450 | 0 | 8050 | HQ | Card |`;

const ATTENDANCE_TEXT = `| Employee ID | Name | Department | Date | Clock In | Clock Out | Hours | Status |
| EMP001 | Amir | IT | 2026-07-18 | 08:52 | 18:10 | 9.3 | Present |
| EMP002 | Sarah | HR | 2026-07-18 | 09:03 | 17:58 | 8.9 | Present |
| EMP003 | Jason | Sales | 2026-07-18 | - | - | 0 | Leave |`;

describe("C157 planDashboardFromRows", () => {
  it("plans sales pipeline dashboard with funnel stage chart", () => {
    const rows = parseTabular(PIPELINE_TEXT);
    const plan = planDashboardFromRows(rows, { persona: "executive" });
    expect(plan).not.toBeNull();
    expect(plan!.vertical).toBe("sales");
    expect(plan!.kpis).toHaveLength(4);
    expect(plan!.charts.length).toBeGreaterThanOrEqual(2);

    const stageChart = plan!.charts.find((block) => block.questionId === "sales.chart.by_stage");
    expect(stageChart?.panel.type).toBe("funnel");

    const forecastChart = plan!.charts.find((block) => block.questionId === "sales.chart.weighted_forecast");
    expect(forecastChart?.panel.type).toBe("cartesian");
  });

  it("plans ledger dashboard with balance trend and cost center", () => {
    const rows = parseTabular(LEDGER_TEXT);
    const plan = planDashboardFromRows(rows);
    expect(plan).not.toBeNull();
    expect(plan!.vertical).toBe("ledger");
    expect(plan!.kpis.some((block) => block.questionId === "ledger.kpi.balance")).toBe(true);

    const balanceTrend = plan!.charts.find((block) => block.questionId === "ledger.chart.balance_trend");
    expect(balanceTrend?.panel.type).toBe("cartesian");

    const costCenter = plan!.charts.find((block) => block.questionId === "ledger.chart.cost_center");
    expect(costCenter).toBeDefined();
  });

  it("plans attendance dashboard and adds follow-up charts", () => {
    const rows = parseTabular(ATTENDANCE_TEXT);
    const base = planDashboardFromRows(rows);
    expect(base).not.toBeNull();
    expect(base!.vertical).toBe("attendance");

    const withFollowUp = planDashboardFromRows(rows, {
      followUpIntents: ["show attendance table"],
    });
    expect(withFollowUp!.charts.some((block) => block.questionId === "attendance.table.log")).toBe(true);
    expect(withFollowUp!.decisions.some((decision) => decision.step === "Follow-up intent")).toBe(true);
  });

  it("records rankQuestions in decision log", () => {
    const rows = parseTabular(PIPELINE_TEXT);
    const plan = planDashboardFromRows(rows)!;
    const catalogStep = plan.decisions.find((decision) => decision.api === "rankQuestions");
    expect(catalogStep?.notes).toMatch(/persona/);
    expect(inferFieldRoles(rows).length).toBeGreaterThan(0);
  });
});
