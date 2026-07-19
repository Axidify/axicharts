import type { ReactElement } from "react";
import type { DashboardPlan } from "@axicharts/charts-planner";
import { PanelSpecGrid } from "@axicharts/charts-spec";
import { opsStaticRows } from "./runtime/buildRuntimeSpec";

export type PlannerPanelsWorkspaceProps = {
  plan: DashboardPlan;
};

/** C151 — render planner `plan.panels` against static ops rows. */
export function PlannerPanelsWorkspace({ plan }: PlannerPanelsWorkspaceProps): ReactElement {
  const rows = opsStaticRows();

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 16, fontWeight: 700 }}>
          {plan.title ?? "Planner panels"}
        </div>
        {plan.subtitle ? (
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>{plan.subtitle}</div>
        ) : null}
        <div style={{ fontSize: 12, color: "#64748b", marginTop: 8 }}>
          Static feed · {plan.panels.length} panel{plan.panels.length === 1 ? "" : "s"} ·{" "}
          {rows.length} rows
        </div>
      </div>
      <PanelSpecGrid
        panels={plan.panels.map((panel) => ({ panel }))}
        data={{ rows }}
        columns={2}
        chartHeight={260}
      />
    </div>
  );
}
