import { describe, expect, it } from "vitest";
import { parseTabular } from "../parseTabular";
import { profileTabular } from "../profileTabular";
import { compileRecipe } from "./recipes";
import { detectIncidentTable, suggestIncidentAnalytics } from "./composeIncidentDashboard";
import { planDashboardFromRows } from "./planDashboardFromRows";

const INCIDENT_CSV = `| Ticket ID | Priority | Status      | Category | Assigned To | Opened     | Closed     | Resolution Time (hrs) |
| INC-1001  | High     | Closed      | Network  | Amir        | 2026-07-15 | 2026-07-15 |                   2.4 |
| INC-1002  | Medium   | In Progress | Software | Sarah       | 2026-07-16 | -          |                     - |
| INC-1003  | Low      | Closed      | Hardware | Jason       | 2026-07-16 | 2026-07-17 |                  15.6 |
| INC-1004  | Critical | Closed      | Server   | Amir        | 2026-07-17 | 2026-07-17 |                   1.8 |`;

describe("composeIncidentDashboard", () => {
  const rows = parseTabular(INCIDENT_CSV);
  const profile = profileTabular(rows);

  it("detects incident-shaped tables", () => {
    expect(detectIncidentTable(profile.fieldProfiles ?? [])).toBe(true);
  });

  it("plans agent KPIs and semantic charts", () => {
    const recipes = suggestIncidentAnalytics(rows, profile.fieldProfiles ?? []);
    const titles = recipes.map((recipe) => recipe.title);
    expect(titles).toContain("Open tickets");
    expect(titles).toContain("Tickets by status");
    expect(titles).toContain("Avg resolution by priority");
    expect(titles).toContain("Tickets by assignee");
    expect(titles).toContain("Incident tickets");
    expect(titles).not.toContain("Count by Ticket ID");

    const openKpi = recipes.find((recipe) => recipe.questionId === "agent.incident.kpi.open");
    expect(openKpi?.kpiValue).toBe(1);

    const avgKpi = recipes.find((recipe) => recipe.questionId === "agent.incident.kpi.avg_resolution");
    expect(avgKpi?.kpiValue).toBe(6.6);

    const priorityChart = recipes.find(
      (recipe) => recipe.questionId === "agent.incident.chart.resolution_by_priority",
    );
    const compiled = compileRecipe(priorityChart!, rows, { dataProfile: profile });
    expect(compiled.rows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ Priority: "Critical", "Avg resolution (hrs)": 1.8 }),
        expect.objectContaining({ Priority: "High", "Avg resolution (hrs)": 2.4 }),
      ]),
    );
    expect(compiled.panel.encoding?.color).toEqual({
      field: "Priority",
      type: "nominal",
    });
    expect(compiled.matchedRules).toContain("encoding:nominal-color");
  });

  it("uses agent compose in planDashboardFromRows generic path", () => {
    const plan = planDashboardFromRows(rows, { persona: "manager" });
    expect(plan).not.toBeNull();
    expect(plan!.decisions.some((decision) => decision.api === "composeIncidentDashboard")).toBe(true);
    expect(plan!.kpis.some((block) => block.panel.title === "Open tickets")).toBe(true);
    expect(plan!.charts.some((block) => block.panel.title === "Incident tickets")).toBe(true);
    expect(plan!.charts.some((block) => /count by ticket id/i.test(block.panel.title ?? ""))).toBe(
      false,
    );
    expect(plan!.layout?.variant).toBe("table-pinned-bottom");
  });
});
