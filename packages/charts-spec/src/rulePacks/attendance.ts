import type { PanelSpec } from "../types";
import type { VerticalPanelContext, VerticalRulePack } from "./types";

function applyAttendancePanelRules(panel: PanelSpec, ctx: VerticalPanelContext): PanelSpec {
  const name = ctx.metric.name.toLowerCase();
  const intent = ctx.intent?.toLowerCase() ?? "";
  const fields = ctx.profileFields ?? [];

  if (/kpi|stat|headline/.test(intent)) {
    return {
      ...panel,
      type: "stat",
      theme: "clean",
      mode: "interactive",
      encoding: { value: { field: ctx.metric.name, type: "quantitative" } },
      props: {
        label: ctx.metric.name,
        monospace: true,
      },
    };
  }

  if (/hours|attendance|timesheet/.test(name) || /hours|attendance|timesheet/.test(intent)) {
    const dimField =
      fields.find((f) => /department|team|division|site/i.test(f)) ?? "Department";
    const valueField = /hours/.test(name) ? ctx.metric.name : "Hours";
    return {
      ...panel,
      type: "cartesian",
      title: panel.title ?? "Hours by department",
      theme: "clean",
      mode: "interactive",
      encoding: {
        x: { field: dimField, type: "nominal" },
        y: { field: valueField, type: "quantitative", format: "number" },
      },
      marks: [
        {
          type: "bar",
          field: valueField,
          label: "Hours",
          labels: true,
          tone: "info",
        },
      ],
    };
  }

  if (/status|leave|present|absent/.test(name) || /status|leave|present|absent/.test(intent)) {
    const dimField = fields.find((f) => /status/i.test(f)) ?? "Status";
    return {
      ...panel,
      type: "cartesian",
      title: panel.title ?? "Attendance status",
      theme: "clean",
      mode: "interactive",
      encoding: { x: { field: dimField, type: "nominal" } },
      marks: [
        {
          type: "bar",
          field: "count",
          label: "Headcount",
          labels: true,
          tone: "success",
        },
      ],
    };
  }

  return panel;
}

export const attendanceRulePack: VerticalRulePack = {
  id: "attendance",
  colorFieldPriority: ["Status", "Department", "Name"],
  sizeFieldPriority: ["Hours", "headcount"],
  extraColorIntent: /by status|by department|breakdown/i,
  applyPanelRules: applyAttendancePanelRules,
};
