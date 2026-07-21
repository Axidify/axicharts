import { describe, expect, it } from "vitest";
import { parseTabular } from "../parseTabular";
import { profileTabular } from "../profileTabular";
import { collectFollowUpRecipes, recipesFromFollowUp } from "./followUpRecipes";
import { inferOrdinalOrder } from "./inferOrdinalOrder";

const INVENTORY_TEXT = `| SKU | Product | Stock | Reorder Level | Unit Cost |
| WIDGET-01 | Bolt | 120 | 50 | 0.45 |
| WIDGET-02 | Gasket | 18 | 40 | 2.10 |
| WIDGET-03 | Wire | 8 | 25 | 12.00 |`;

describe("inferOrdinalOrder", () => {
  it("returns priority order for Priority field", () => {
    expect(inferOrdinalOrder("Priority", ["High", "Low", "Critical"])).toEqual([
      "Critical",
      "High",
      "Low",
    ]);
  });
});

describe("recipesFromFollowUp", () => {
  const rows = parseTabular(INVENTORY_TEXT);
  const fieldProfiles = profileTabular(rows).fieldProfiles ?? [];

  it("adds below-reorder filtered table", () => {
    const recipes = recipesFromFollowUp("Which items are below reorder level?", rows, fieldProfiles);
    expect(recipes.some((recipe) => recipe.questionId === "generic.table.below_reorder")).toBe(true);
    const table = recipes.find((recipe) => recipe.questionId === "generic.table.below_reorder");
    expect(table?.preparedRows?.length).toBe(2);
  });

  it("adds top N table", () => {
    const recipes = recipesFromFollowUp("show top 2 by stock", rows, fieldProfiles);
    expect(recipes.some((recipe) => recipe.questionId.startsWith("generic.table.top_2"))).toBe(true);
  });

  it("adds breakdown chart with ordinal order on priority-like dims", () => {
    const incidentRows = parseTabular(`| Priority | Status |
| High | Open |
| Low | Closed |`);
    const profiles = profileTabular(incidentRows).fieldProfiles ?? [];
    const recipes = recipesFromFollowUp("breakdown by Priority", incidentRows, profiles);
    const chart = recipes.find((recipe) => recipe.questionId === "generic.followup.count.Priority");
    expect(chart?.stageOrder).toEqual(["High", "Low"]);
  });
});

describe("collectFollowUpRecipes", () => {
  it("dedupes question ids", () => {
    const rows = parseTabular(INVENTORY_TEXT);
    const fieldProfiles = profileTabular(rows).fieldProfiles ?? [];
    const { questionIds } = collectFollowUpRecipes(
      ["below reorder", "below reorder"],
      rows,
      fieldProfiles,
    );
    expect(new Set(questionIds).size).toBe(questionIds.length);
  });
});
