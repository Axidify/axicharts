import { describe, expect, it } from "vitest";
import { parseTabular } from "../parseTabular";
import { planDashboardFromRows } from "./planDashboardFromRows";

const LEDGER_TEXT = `| Date | Category | Debit (RM) | Credit (RM) | Balance (RM) | Cost Center | Payment Method |
| 2026-07-01 | Rent | 3500 | 0 | -3500 | HQ | Bank |
| 2026-07-02 | Sales | 0 | 12000 | 8500 | Sales | Bank |`;

const INVENTORY_TEXT = `| SKU | Product | Stock | Reorder Level | Unit Cost |
| WIDGET-01 | Bolt | 120 | 50 | 0.45 |
| WIDGET-02 | Gasket | 8 | 40 | 2.10 |`;

const INCIDENT_TEXT = `| Ticket ID | Priority | Status | Category | Assigned To | Resolution Time (hrs) |
| INC-1001 | High | Closed | Network | Amir | 2.4 |
| INC-1002 | Medium | In Progress | Software | Sarah | - |`;

function assertNoTier2Charts(
  label: string,
  rows: Record<string, unknown>[],
  options: Parameters<typeof planDashboardFromRows>[1] = {},
): void {
  const plan = planDashboardFromRows(rows, options);
  expect(plan, label).not.toBeNull();
  for (const block of [...plan!.kpis, ...plan!.charts]) {
    if (block.panel.type === "stat" || block.panel.type === "table") continue;
    expect(block.decision.status, `${label} · ${block.questionId}`).not.toBe("needs_review");
    expect(block.validationIssues, `${label} · ${block.questionId}`).toEqual([]);
  }
}

describe("Track B — agent grammar gate (B1)", () => {
  it("ledger + inventory + incident fixtures have no Tier-2 chart panels", () => {
    assertNoTier2Charts("ledger", parseTabular(LEDGER_TEXT));
    assertNoTier2Charts("ledger waterfall follow-up", parseTabular(LEDGER_TEXT), {
      followUpIntents: ["waterfall by category"],
    });
    assertNoTier2Charts("inventory", parseTabular(INVENTORY_TEXT));
    assertNoTier2Charts("inventory reorder follow-up", parseTabular(INVENTORY_TEXT), {
      followUpIntents: ["Which items are below reorder level?"],
      refinementIntent: "Which items are below reorder level?",
    });
    assertNoTier2Charts("incident", parseTabular(INCIDENT_TEXT));
    assertNoTier2Charts("incident open follow-up", parseTabular(INCIDENT_TEXT), {
      followUpIntents: ["Show open tickets only"],
      refinementIntent: "Show open tickets only",
    });
  });
});
