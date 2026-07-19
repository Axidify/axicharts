import { describe, expect, it } from "vitest";
import { planFromIntent } from "../../charts-planner/src/plan";
import {
  fieldProfilesToDataProfile,
  inferFieldRoles,
  parseTabular,
  planDashboardFromRows,
  validateCartesianSpec,
} from "./index";

const ATTENDANCE_TEXT = `| Employee ID | Name        | Department | Date       | Clock In | Clock Out | Hours | Status  |
| ----------- | ----------- | ---------- | ---------- | -------- | --------- | ----: | ------- |
| EMP001      | Amir Hamzah | IT         | 2026-07-18 | 08:52    | 18:10     |   9.3 | Present |
| EMP002      | Sarah Lim   | HR         | 2026-07-18 | 09:03    | 17:58     |   8.9 | Present |
| EMP003      | Jason Tan   | Sales      | 2026-07-18 | -        | -         |     0 | Leave   |
| EMP004      | Nurul       | Finance    | 2026-07-18 | 08:45    | 17:47     |   9.0 | Present |`;

describe("C153 attendance agent integration", () => {
  it("fixes the pre-C153 gaps (roles, planner panels, agent render)", () => {
    const rows = parseTabular(ATTENDANCE_TEXT);
    const roles = inferFieldRoles(rows);

    expect(roles.find((r) => r.name === "Hours")?.role).toBe("measure");
    expect(roles.find((r) => r.name === "Employee ID")?.role).toBe("identifier");

    const profile = fieldProfilesToDataProfile(roles);
    expect(profile.metrics.length).toBeGreaterThan(0);

    const plan = planFromIntent(
      profile,
      "Attendance dashboard static CSV — hours by department, status breakdown",
    );
    expect(plan.panels.length).toBeGreaterThan(0);

    const agent = planDashboardFromRows(rows)!;
    expect(agent.vertical).toBe("attendance");
    expect(agent.kpis.length).toBe(4);
    expect(agent.charts.length).toBeGreaterThanOrEqual(3);

    for (const block of agent.charts) {
      if (block.panel.type !== "cartesian" && block.panel.type !== "blocks") continue;
      const validation = validateCartesianSpec(block.panel, { rows: block.rows });
      expect(validation.ok, `${block.panel.title}: ${JSON.stringify(validation)}`).toBe(true);
    }
  });
});
