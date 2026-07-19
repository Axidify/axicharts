import { describe, expect, it } from "vitest";
import { planFromIntent } from "../../charts-planner/src/plan";
import {
  fieldProfilesToDataProfile,
  inferFieldRoles,
  parseTabular,
  validateCartesianSpec,
} from "./index";
import { agentPlanPipelineDashboard } from "../../../apps/axiboard/src/rnd/agentPlanPipeline";
import { enrichPipeline } from "../../../apps/axiboard/src/rnd/pipelineEnrich";

const PIPELINE_TEXT = `| Opportunity ID | Customer          | Salesperson | Stage       | Value (RM) | Probability | Expected Close | Source          |
| -------------- | ----------------- | ----------- | ----------- | ---------: | ----------: | -------------- | --------------- |
| OPP-001        | ABC Manufacturing | Amir        | Proposal    |     85,000 |         70% | 2026-08-15     | Referral        |
| OPP-002        | Johor Port        | Sarah       | Negotiation |    240,000 |         90% | 2026-07-28     | Existing Client |
| OPP-003        | XYZ Logistics     | Amir        | Discovery   |     45,000 |         30% | 2026-09-05     | Website         |
| OPP-004        | Delta Tech        | Jason       | Closed Won  |     68,000 |        100% | 2026-07-10     | Cold Call       |
| OPP-005        | Alpha Solutions   | Amir        | Qualified   |    120,000 |         50% | 2026-08-22     | LinkedIn        |`;

describe("C154 sales pipeline agent integration", () => {
  it("fixes pre-C154 gaps (roles, planner panels, agent render)", () => {
    const rows = parseTabular(PIPELINE_TEXT);
    const roles = inferFieldRoles(rows);

    expect(roles.find((r) => r.name === "Opportunity ID")?.role).toBe("identifier");
    expect(roles.find((r) => r.name === "Expected Close")?.role).toBe("time");
    expect(roles.find((r) => r.name === "Probability")?.role).toBe("measure");

    const profile = fieldProfilesToDataProfile(roles);
    expect(profile.metrics.length).toBeGreaterThan(0);

    const plan = planFromIntent(
      profile,
      "Sales pipeline dashboard static CSV — value by stage, weighted forecast by salesperson",
    );
    expect(plan.panels.length).toBeGreaterThan(0);

    const enriched = enrichPipeline(rows)!;
    expect(enriched.kpis.opportunityCount).toBe(5);
    expect(enriched.kpis.openOpportunities).toBe(4);
    expect(enriched.kpis.totalPipeline).toBe(558000);
    expect(enriched.kpis.weightedForecast).toBe(417000);
    expect(enriched.kpis.wonValue).toBe(68000);
    expect(
      enriched.valueBySalesperson.find((r) => r.Salesperson === "Amir")?.value,
    ).toBe(250000);

    const agent = agentPlanPipelineDashboard(enriched);
    expect(agent.kpis.length).toBe(4);
    expect(agent.charts.length).toBeGreaterThanOrEqual(3);

    for (const block of agent.charts) {
      if (block.panel.type !== "cartesian" && block.panel.type !== "blocks") continue;
      const validation = validateCartesianSpec(block.panel, { rows: block.rows });
      expect(validation.ok, `${block.panel.title}: ${JSON.stringify(validation)}`).toBe(true);
    }
  });
});
