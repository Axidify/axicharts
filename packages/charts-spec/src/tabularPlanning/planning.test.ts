import { describe, expect, it } from "vitest";
import { classifyTabularDomain, inferFieldRoles, parseTabular } from "../index";
import {
  findQuestionsForIntent,
  inferPersonaFromIntent,
  rankQuestions,
  resolvePersona,
} from "../tabularPlanning";

const PIPELINE_TEXT = `| Opportunity ID | Customer | Salesperson | Stage | Value (RM) | Probability | Expected Close | Source |
| OPP-001 | ABC | Amir | Proposal | 85,000 | 70% | 2026-08-15 | Referral |`;

const LEDGER_TEXT = `| Date | Transaction ID | Category | Debit (RM) | Credit (RM) | Balance (RM) | Payment Method |
| 2026-07-01 | TXN-001 | Rent | 3500 | 0 | -3500 | Bank |
| 2026-07-02 | TXN-002 | Payroll | 12000 | 0 | -15500 | Bank |
| 2026-07-03 | TXN-003 | Sales | 0 | 8500 | -7000 | Cash |`;

describe("C156 planning — persona + question catalogs", () => {
  it("infers executive persona from board deck intent", () => {
    expect(inferPersonaFromIntent("Board deck for CEO — pipeline overview")).toBe("executive");
    expect(resolvePersona({ intent: "weekly manager report" })).toBe("manager");
    expect(resolvePersona({ persona: "analyst" })).toBe("analyst");
  });

  it("ranks weighted forecast first for executive on sales data", () => {
    const rows = parseTabular(PIPELINE_TEXT);
    const fieldProfiles = inferFieldRoles(rows);
    const domain = classifyTabularDomain({ fieldProfiles });

    const result = rankQuestions({
      fieldProfiles,
      domain,
      context: { persona: "executive" },
      kinds: ["chart"],
      limit: 4,
    });

    expect(result.persona).toBe("executive");
    expect(result.ranked[0]?.question.id).toBe("sales.chart.weighted_forecast");
    expect(result.ranked.some((r) => r.question.id === "sales.chart.by_stage")).toBe(true);
  });

  it("ranks stage chart higher for manager persona", () => {
    const rows = parseTabular(PIPELINE_TEXT);
    const fieldProfiles = inferFieldRoles(rows);
    const domain = classifyTabularDomain({ fieldProfiles });

    const executive = rankQuestions({
      fieldProfiles,
      domain,
      context: { persona: "executive" },
      kinds: ["chart"],
    });
    const manager = rankQuestions({
      fieldProfiles,
      domain,
      context: { persona: "manager" },
      kinds: ["chart"],
    });

    const execStage = executive.ranked.find((r) => r.question.id === "sales.chart.by_stage")?.score ?? 0;
    const mgrStage = manager.ranked.find((r) => r.question.id === "sales.chart.by_stage")?.score ?? 0;
    expect(mgrStage).toBeGreaterThanOrEqual(execStage);
  });

  it("finds follow-up questions from NL intent", () => {
    const matches = findQuestionsForIntent("weighted forecast by salesperson", "sales");
    expect(matches.map((q) => q.id)).toContain("sales.chart.weighted_forecast");

    const stage = findQuestionsForIntent("pipeline by stage open only", "sales");
    expect(stage.some((q) => q.id === "sales.chart.by_stage" || q.id === "sales.chart.open_by_stage")).toBe(
      true,
    );
  });

  it("filters ledger questions by available fields", () => {
    const rows = parseTabular(LEDGER_TEXT);
    const fieldProfiles = inferFieldRoles(rows);
    const domain = classifyTabularDomain({ fieldProfiles });

    const ranked = rankQuestions({
      fieldProfiles,
      domain,
      context: { persona: "analyst" },
      kinds: ["table", "chart"],
    });

    expect(ranked.ranked.some((r) => r.question.id === "ledger.table.transactions")).toBe(true);
    expect(ranked.ranked.some((r) => r.question.id === "ledger.chart.payment_method")).toBe(true);
  });
});

describe("C165 planDashboardFromRows — L1 profile", () => {
  it("records profileTabular grain and time span in decisions", async () => {
    const { planDashboardFromRows } = await import("./planDashboardFromRows");
    const rows = parseTabular(LEDGER_TEXT);
    const plan = planDashboardFromRows(rows);
    expect(plan).not.toBeNull();
    expect(plan!.dataProfile.grain).toBe("transaction");
    expect(plan!.dataProfile.timeSpan?.from).toBe("2026-07-01");

    const l1 = plan!.decisions.find((entry) => entry.api === "profileTabular");
    expect(l1).toBeDefined();
    expect(l1!.notes).toMatch(/grain transaction/);
  });
});
