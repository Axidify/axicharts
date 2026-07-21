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

const INVENTORY_TEXT = `| SKU | Product | Stock | Reorder Level | Unit Cost | Unit Price |
| WIDGET-01 | Steel Bolt M8 | 120 | 50 | 0.45 | 1.20 |
| WIDGET-02 | Rubber Gasket | 18 | 40 | 2.10 | 5.50 |
| WIDGET-03 | Copper Wire 2mm | 8 | 25 | 12.00 | 28.00 |
| WIDGET-04 | Plastic Housing | 95 | 30 | 3.75 | 9.99 |`;

describe("C173/C175 generic compose", () => {
  it("plans inventory dashboard via L4b when vertical is generic", () => {
    const rows = parseTabular(INVENTORY_TEXT);
    const plan = planDashboardFromRows(rows);
    expect(plan).not.toBeNull();
    expect(plan!.planSource).toBe("l4b");
    expect(plan!.kpis.length).toBeGreaterThan(0);
    expect(plan!.charts.length).toBeGreaterThan(0);
    expect(plan!.layout?.variant).toBeTruthy();
    expect(plan!.decisions.some((decision) => decision.api === "suggestAnalyticsFromProfile")).toBe(true);
    for (const block of [...plan!.kpis, ...plan!.charts]) {
      expect(block.validationIssues, block.questionId).toEqual([]);
    }
  });

  it("adds below-reorder table on follow-up intent", () => {
    const rows = parseTabular(INVENTORY_TEXT);
    const plan = planDashboardFromRows(rows, {
      followUpIntents: ["Which items are below reorder level?"],
    });
    expect(plan).not.toBeNull();
    expect(
      plan!.charts.some(
        (block) =>
          block.questionId === "generic.table.below_reorder" ||
          block.panel.title.toLowerCase().includes("reorder"),
      ),
    ).toBe(true);
  });
});

describe("C157 planDashboardFromRows", () => {
  it("plans sales pipeline dashboard with funnel stage chart", () => {
    const rows = parseTabular(PIPELINE_TEXT);
    const plan = planDashboardFromRows(rows, { persona: "executive" });
    expect(plan).not.toBeNull();
    expect(plan!.vertical).toBe("sales");
    expect(plan!.kpis).toHaveLength(4);
    expect(plan!.charts.length).toBeGreaterThanOrEqual(2);

    const stageChart = plan!.charts.find((block) => block.questionId === "sales.chart.by_stage");
    expect(stageChart?.panel.type).toBe("distribution");
    expect(stageChart?.panel.marks?.some((mark) => mark.type === "funnel")).toBe(true);
    expect(stageChart?.decision.status).toBe("validated");
    expect(stageChart?.validationIssues).toEqual([]);

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

  it("flags ledger waterfall follow-up as Tier-2 needs_review", () => {
    const rows = parseTabular(LEDGER_TEXT);
    const plan = planDashboardFromRows(rows, {
      followUpIntents: ["waterfall by category"],
    });
    expect(plan).not.toBeNull();

    const waterfall = plan!.charts.find((block) => block.questionId === "ledger.chart.waterfall");
    expect(waterfall).toBeDefined();
    expect(waterfall?.panel.type).toBe("waterfall");
    expect(waterfall?.decision.status).toBe("needs_review");
    expect(waterfall?.validationIssues.some((issue) => issue.code === "TIER2_PANEL")).toBe(true);
    expect(
      plan!.decisions.some(
        (decision) =>
          decision.status === "needs_review" &&
          decision.notes.includes("Tier-2"),
      ),
    ).toBe(true);
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

  it("C170 applies panel budget caps", () => {
    const rows = parseTabular(PIPELINE_TEXT);
    const plan = planDashboardFromRows(rows)!;
    expect(plan.kpis.length).toBeLessThanOrEqual(4);
    expect(plan.charts.length).toBeLessThanOrEqual(4);
    expect(plan.decisions.some((decision) => decision.api === "panelBudget")).toBe(true);
  });
});
