import { describe, expect, it } from "vitest";
import { classifyTabularDomain, enrichProfileWithDomain } from "../../classifyTabularDomain";
import { fieldProfilesToDataProfile, inferFieldRoles } from "../../inferFieldRoles";
import { parseTabular } from "../../parseTabular";
import { validateCartesianSpec } from "../../cartesianValidation";
import { SALES_QUESTIONS } from "../catalogs/sales";
import { compileRecipe } from "./compileRecipe";
import { inferChartGeometry } from "./inferGeometry";
import { questionToRecipe } from "./questionToRecipe";

const PIPELINE_TEXT = `| Opportunity ID | Customer | Salesperson | Stage | Value (RM) | Probability | Expected Close | Source |
| OPP-001 | ABC | Amir | Proposal | 85,000 | 70% | 2026-08-15 | Referral |
| OPP-002 | Johor Port | Sarah | Negotiation | 240,000 | 90% | 2026-07-28 | Referral |
| OPP-003 | XYZ Logistics | Amir | Discovery | 45,000 | 30% | 2026-09-05 | Website |`;

const LEDGER_TEXT = `| Date | Category | Debit (RM) | Credit (RM) | Balance (RM) |
| 2026-07-01 | Rent | 3500 | 0 | -3500 |
| 2026-07-02 | Sales | 0 | 1200 | -2300 |
| 2026-07-03 | Utilities | 320 | 0 | -2620 |`;

describe("C158 panel recipes + chart geometry", () => {
  it("infers funnel geometry for pipeline by stage", () => {
    const geometry = inferChartGeometry({
      kind: "chart",
      intent: "pipeline value bar chart by stage with value labels",
      fieldProfiles: [
        { name: "Stage", role: "dimension" },
        { name: "Value (RM)", role: "measure" },
      ],
      xField: "Stage",
      yField: "value",
      dimensionKey: "stage",
    });

    expect(geometry.panelType).toBe("funnel");
    expect(geometry.rules).toContain("geometry:stage-funnel");
  });

  it("infers line geometry for balance over time", () => {
    const geometry = inferChartGeometry({
      kind: "chart",
      intent: "balance line chart over time monotone",
      fieldProfiles: [
        { name: "Date", role: "time" },
        { name: "Balance (RM)", role: "measure" },
      ],
      xField: "Date",
      yField: "balance",
    });

    expect(geometry.panelType).toBe("cartesian");
    expect(geometry.markType).toBe("line");
  });

  it("compiles stage question to funnel panel", () => {
    const rows = parseTabular(PIPELINE_TEXT);
    const fieldProfiles = inferFieldRoles(rows);
    const question = SALES_QUESTIONS.find((q) => q.id === "sales.chart.by_stage")!;
    const recipe = questionToRecipe(question, fieldProfiles)!;

    expect(recipe.panelType).toBe("funnel");

    const derivedRows = rows.map((row) => ({
      ...row,
      weightedValue: (Number(row["Value (RM)"]) * Number(row.Probability)) / 100,
    }));

    const { profile } = enrichProfileWithDomain({
      ...fieldProfilesToDataProfile(fieldProfiles),
      fieldProfiles,
    });
    const domain = classifyTabularDomain({ fieldProfiles });
    expect(domain.vertical).toBe("sales");

    const compiled = compileRecipe(recipe, derivedRows, { dataProfile: profile });
    expect(compiled.panel.type).toBe("funnel");
    expect(compiled.panel.props?.stages).toHaveLength(3);
    expect(compiled.matchedRules).toContain("geometry:stage-funnel");
  });

  it("compiles weighted forecast as bar cartesian", () => {
    const rows = parseTabular(PIPELINE_TEXT);
    const fieldProfiles = inferFieldRoles(rows);
    const question = SALES_QUESTIONS.find((q) => q.id === "sales.chart.weighted_forecast")!;
    const recipe = questionToRecipe(question, fieldProfiles)!;

    expect(recipe.panelType).toBe("cartesian");
    expect(recipe.markType).toBe("bar");

    const prepared = [
      { Salesperson: "Amir", weightedValue: 100000 },
      { Salesperson: "Sarah", weightedValue: 200000 },
    ];

    const { profile } = enrichProfileWithDomain({
      ...fieldProfilesToDataProfile(fieldProfiles),
      fieldProfiles,
    });

    const compiled = compileRecipe(
      { ...recipe, preparedRows: prepared, xField: "Salesperson", yField: "weightedValue" },
      rows,
      { dataProfile: profile },
    );

    expect(compiled.panel.type).toBe("cartesian");
    const validation = validateCartesianSpec(compiled.panel, { rows: prepared, dataProfile: profile });
    expect(validation.ok).toBe(true);
  });

  it("compiles high-cardinality bar recipes as horizontal cartesian panels", () => {
    const rows = Array.from({ length: 14 }, (_, index) => ({
      Category: `Category ${index + 1}`,
      Amount: (index + 1) * 10,
    }));
    const fieldProfiles = inferFieldRoles(rows);
    const recipe = {
      questionId: "generic.spend.category",
      title: "Spend by category",
      intent: "spend by category bar chart",
      panelType: "cartesian" as const,
      markType: "bar" as const,
      xField: "Category",
      yField: "Amount",
    };

    const { profile } = enrichProfileWithDomain({
      ...fieldProfilesToDataProfile(fieldProfiles),
      fieldProfiles,
      cardinalities: { Category: 14 },
    });

    const compiled = compileRecipe(recipe, rows, { dataProfile: profile });
    expect(compiled.panel.orientation).toBe("horizontal");
    expect(compiled.panel.height).toBeGreaterThanOrEqual(14 * 28 + 48);
    expect(compiled.matchedRules).toContain("geometry:high-cardinality-horizontal-bar");
  });

  it("compiles generic KPI stat without cartesian UNKNOWN_FIELD", () => {
    const recipe = {
      questionId: "generic.kpi.rows",
      title: "Rows",
      intent: "kpi headline stat panel",
      panelType: "stat" as const,
      vertical: "ops" as const,
      kpiValue: 4,
      kpiLabel: "Rows",
    };

    const compiled = compileRecipe(recipe, [{ SKU: "A" }]);
    expect(compiled.panel.type).toBe("stat");
    expect(compiled.panel.props?.value).toBe("4");
  });

  it("compiles ledger balance trend as line chart", () => {
    const rows = parseTabular(LEDGER_TEXT);
    const fieldProfiles = inferFieldRoles(rows);
    const recipe = questionToRecipe(
      {
        id: "ledger.chart.balance_trend",
        text: "Balance over time",
        intent: "balance line chart over time monotone",
        verticals: ["ledger"],
        personas: ["executive"],
        basePriority: 9,
        kind: "chart",
        requires: { timeField: true, measurePattern: /balance/i },
      },
      fieldProfiles,
    )!;

    expect(recipe.markType).toBe("line");

    const { profile } = enrichProfileWithDomain({
      ...fieldProfilesToDataProfile(fieldProfiles),
      fieldProfiles,
    });

    const compiled = compileRecipe(recipe, rows, { dataProfile: profile });
    expect(compiled.panel.type).toBe("cartesian");
    expect(compiled.panel.marks?.[0]?.type).toBe("line");
  });
});
