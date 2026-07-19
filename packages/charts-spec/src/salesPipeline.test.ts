import { describe, expect, it } from "vitest";
import { planFromIntent } from "../../charts-planner/src/plan";
import {
  aggregateRows,
  createCartesianPanel,
  fieldProfilesToDataProfile,
  inferFieldRoles,
  parseTabular,
  planPanelFromMetric,
  validateCartesianSpec,
} from "./index";

const PIPELINE_TEXT = `| Opportunity ID | Customer          | Salesperson | Stage       | Value (RM) | Probability | Expected Close | Source          |
| -------------- | ----------------- | ----------- | ----------- | ---------: | ----------: | -------------- | --------------- |
| OPP-001        | ABC Manufacturing | Amir        | Proposal    |     85,000 |         70% | 2026-08-15     | Referral        |
| OPP-002        | Johor Port        | Sarah       | Negotiation |    240,000 |         90% | 2026-07-28     | Existing Client |
| OPP-003        | XYZ Logistics     | Amir        | Discovery   |     45,000 |         30% | 2026-09-05     | Website         |
| OPP-004        | Delta Tech        | Jason       | Closed Won  |     68,000 |        100% | 2026-07-10     | Cold Call       |
| OPP-005        | Alpha Solutions   | Amir        | Qualified   |    120,000 |         50% | 2026-08-22     | LinkedIn        |`;

describe("C154 sales pipeline sample", () => {
  it("profiles, plans, and aggregates CRM pipeline rows", () => {
    const rows = parseTabular(PIPELINE_TEXT);
    expect(rows).toHaveLength(5);
    expect(rows[0]?.["Value (RM)"]).toBe(85000);
    expect(rows[0]?.Probability).toBe(70);

    const roles = inferFieldRoles(rows);
    const roleMap = Object.fromEntries(roles.map((r) => [r.name, r.role]));

    expect(roleMap["Opportunity ID"]).toBe("identifier");
    expect(roleMap["Customer"]).toBe("dimension");
    expect(roleMap["Salesperson"]).toBe("dimension");
    expect(roleMap["Stage"]).toBe("dimension");
    expect(roleMap["Value (RM)"]).toBe("measure");
    expect(roleMap["Probability"]).toBe("measure");
    expect(roleMap["Expected Close"]).toBe("time");
    expect(roleMap["Source"]).toBe("dimension");

    const profile = fieldProfilesToDataProfile(roles);
    expect(profile.metrics.map((m) => m.name)).toEqual(["Value (RM)", "Probability"]);

    const plan = planFromIntent(
      profile,
      "Sales pipeline dashboard static CSV — value by stage, weighted forecast by salesperson",
    );
    expect(plan.feed).toBe("static");
    expect(plan.panels.length).toBeGreaterThan(0);

    const byStage = aggregateRows(rows, {
      groupBy: "Stage",
      aggregates: { value: { op: "sum", field: "Value (RM)" } },
    });
    expect(byStage.length).toBe(5);

    const bySalesperson = aggregateRows(rows, {
      groupBy: "Salesperson",
      aggregates: { value: { op: "sum", field: "Value (RM)" } },
    });
    expect(bySalesperson.find((r) => r.Salesperson === "Amir")?.value).toBe(250000);

    const openOnly = aggregateRows(rows, {
      groupBy: "Stage",
      where: [{ field: "Stage", op: "neq", value: "Closed Won" }],
      aggregates: { value: { op: "sum", field: "Value (RM)" } },
    });
    expect(openOnly.length).toBe(4);

    const stagePanel = createCartesianPanel({
      intent: "pipeline value bar chart by stage with value labels",
      fields: Object.keys(byStage[0] ?? {}),
      xField: "Stage",
      yField: "value",
    });
    expect(validateCartesianSpec(stagePanel.panel, { rows: byStage }).ok).toBe(true);

    const kpi = planPanelFromMetric(
      { name: "Value (RM)", tags: { vertical: "sales" } },
      {
        intent: "kpi headline stat panel sales pipeline",
        profileFields: profile.fields,
      },
    );
    expect(kpi.type).toBe("stat");
  });
});
