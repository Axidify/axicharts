import { describe, expect, it } from "vitest";
import { parseTabular } from "../parseTabular";
import { planDashboardFromRows } from "./planDashboardFromRows";
import {
  detectProjectTaskTable,
  suggestProjectTaskAnalytics,
} from "./composeProjectTaskDashboard";

const PROJECT_CSV = `Task ID,Project,Task,Owner,Priority,Status,Start Date,Due Date,Progress
T001,ERP Upgrade,Database Migration,Amir,High,In Progress,2026-07-10,2026-07-25,75%
T002,ERP Upgrade,UAT Testing,Sarah,Medium,Not Started,2026-07-26,2026-08-05,0%
T003,Mobile App,API Integration,Jason,High,Completed,2026-07-01,2026-07-15,100%
T004,Website,UI Redesign,Lisa,Low,In Review,2026-07-05,2026-07-20,95%`;

describe("composeProjectTaskDashboard", () => {
  const rows = parseTabular(PROJECT_CSV);

  it("detects project task tables", () => {
    const plan = planDashboardFromRows(rows, { persona: "manager" });
    expect(plan).not.toBeNull();
    expect(detectProjectTaskTable(plan!.dataProfile.fieldProfiles ?? [])).toBe(true);
  });

  it("suggests status, priority, owner charts and task register", () => {
    const recipes = suggestProjectTaskAnalytics(rows, planDashboardFromRows(rows)!.dataProfile.fieldProfiles ?? []);
    const titles = recipes.map((recipe) => recipe.title);
    expect(titles).toContain("Tasks by status");
    expect(titles).toContain("Tasks by priority");
    expect(titles).toContain("Tasks by owner");
    expect(titles).toContain("Task register");
    expect(titles).not.toContain("Count by Task ID");
  });

  it("uses agent compose in planDashboardFromRows generic path", () => {
    const plan = planDashboardFromRows(rows, { persona: "manager" });
    expect(plan?.planSource).toBe("l4b");
    expect(plan?.decisions.some((decision) => decision.api === "composeProjectTaskDashboard")).toBe(true);
    expect(plan?.kpis.some((block) => block.panel.title === "Total tasks")).toBe(true);
    expect(plan?.charts.some((block) => block.panel.title === "Tasks by status")).toBe(true);
  });
});
