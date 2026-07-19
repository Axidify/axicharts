import { describe, expect, it } from "vitest";
import { planFromIntent } from "../../charts-planner/src/plan";
import {
  aggregateRows,
  createCartesianPanel,
  createTablePanel,
  fieldProfilesToDataProfile,
  inferFieldRoles,
  parseTabular,
  planPanelFromMetric,
  validateCartesianSpec,
} from "./index";

const ATTENDANCE_TEXT = `| Employee ID | Name        | Department | Date       | Clock In | Clock Out | Hours | Status  |
| ----------- | ----------- | ---------- | ---------- | -------- | --------- | ----: | ------- |
| EMP001      | Amir Hamzah | IT         | 2026-07-18 | 08:52    | 18:10     |   9.3 | Present |
| EMP002      | Sarah Lim   | HR         | 2026-07-18 | 09:03    | 17:58     |   8.9 | Present |
| EMP003      | Jason Tan   | Sales      | 2026-07-18 | -        | -         |     0 | Leave   |
| EMP004      | Nurul       | Finance    | 2026-07-18 | 08:45    | 17:47     |   9.0 | Present |`;

describe("C153 attendance sample", () => {
  it("profiles, plans, and charts attendance rows", () => {
    const rows = parseTabular(ATTENDANCE_TEXT);
    expect(rows).toHaveLength(4);

    const roles = inferFieldRoles(rows);
    expect(roles.find((r) => r.name === "Date")?.role).toBe("time");
    expect(roles.find((r) => r.name === "Employee ID")?.role).toBe("identifier");
    expect(roles.find((r) => r.name === "Department")?.role).toBe("dimension");
    expect(roles.find((r) => r.name === "Hours")?.role).toBe("measure");
    expect(roles.find((r) => r.name === "Status")?.role).toBe("dimension");

    const profile = fieldProfilesToDataProfile(roles);
    const plan = planFromIntent(
      profile,
      "Attendance dashboard static CSV — hours by department, status breakdown",
    );
    expect(plan.feed).toBe("static");
    expect(plan.panels.length).toBeGreaterThan(0);

    const byDept = aggregateRows(rows, {
      groupBy: "Department",
      aggregates: { hours: { op: "sum", field: "Hours" } },
    });
    expect(byDept).toHaveLength(4);

    const presentOnly = aggregateRows(rows, {
      groupBy: "Department",
      where: [{ field: "Status", op: "eq", value: "Present" }],
      aggregates: { hours: { op: "sum", field: "Hours" } },
    });
    expect(presentOnly).toHaveLength(3);

    const hoursPanel = createCartesianPanel({
      intent: "hours bar chart by department with value labels",
      fields: Object.keys(byDept[0] ?? {}),
      xField: "Department",
      yField: "hours",
    });
    expect(validateCartesianSpec(hoursPanel.panel, { rows: byDept }).ok).toBe(true);

    const kpi = planPanelFromMetric(
      { name: "Hours", tags: { vertical: "attendance" } },
      {
        intent: "kpi headline stat panel attendance",
        profileFields: profile.fields,
      },
    );
    expect(kpi.type).toBe("stat");

    const table = createTablePanel({ title: "Attendance log" });
    expect(table.type).toBe("table");
  });
});
