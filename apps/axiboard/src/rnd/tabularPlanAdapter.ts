import { planFromIntent } from "@axicharts/charts-planner";
import type { TabularDashboardPlan, TabularEnrichment } from "@axicharts/charts-spec";
import type { AgentPlanResult } from "./agentPlan";
import type { AttendanceEnrichment } from "./attendanceEnrich";
import type { LedgerEnrichment } from "./ledgerEnrich";
import type { PipelineEnrichment } from "./pipelineEnrich";

export function fromPipelineEnrichment(enriched: PipelineEnrichment): TabularEnrichment {
  return {
    vertical: "sales",
    rows: enriched.rows,
    derivedRows: enriched.derivedRows,
    fieldProfiles: enriched.fieldProfiles,
    fieldMap: enriched.fields,
    kpis: enriched.kpis,
    datasets: {
      valueByStage: enriched.valueByStage,
      openPipelineByStage: enriched.openPipelineByStage,
      valueBySalesperson: enriched.valueBySalesperson,
      weightedBySalesperson: enriched.weightedBySalesperson,
      valueBySource: enriched.valueBySource,
    },
  };
}

export function fromLedgerEnrichment(enriched: LedgerEnrichment): TabularEnrichment {
  return {
    vertical: "ledger",
    rows: enriched.rows,
    derivedRows: enriched.rows,
    fieldProfiles: enriched.fieldProfiles,
    fieldMap: enriched.fields,
    kpis: enriched.kpis,
    datasets: {
      byDate: enriched.byDate,
      expensesByCategory: enriched.expensesByCategory,
      revenueByCategory: enriched.revenueByCategory,
      spendByCostCenter: enriched.spendByCostCenter,
      volumeByPaymentMethod: enriched.volumeByPaymentMethod,
    },
    extras: { waterfallByCategory: enriched.waterfallByCategory },
  };
}

export function fromAttendanceEnrichment(enriched: AttendanceEnrichment): TabularEnrichment {
  return {
    vertical: "attendance",
    rows: enriched.rows,
    derivedRows: enriched.rows,
    fieldProfiles: enriched.fieldProfiles,
    fieldMap: enriched.fields,
    kpis: enriched.kpis,
    datasets: {
      hoursByDepartment: enriched.hoursByDepartment,
      hoursByDepartmentPresent: enriched.hoursByDepartmentPresent,
      countByStatus: enriched.countByStatus,
    },
  };
}

export function toAgentPlanResult(plan: TabularDashboardPlan): AgentPlanResult {
  const dashboardPlan = planFromIntent(plan.dataProfile, plan.dashboardIntent);
  const mapBlock = (block: TabularDashboardPlan["kpis"][number]) => ({
    panel: block.panel,
    rows: block.rows,
    decision: block.decision,
    validationIssues: block.validationIssues,
  });

  return {
    dashboardIntent: plan.dashboardIntent,
    dashboardPlan,
    kpis: plan.kpis.map(mapBlock),
    charts: plan.charts.map(mapBlock),
    decisions: [
      ...plan.decisions,
      {
        step: "Dashboard shell",
        api: "planFromIntent",
        intent: plan.dashboardIntent,
        status: "ok" as const,
        notes: `template ${dashboardPlan.template}, feed ${dashboardPlan.feed}, panels ${dashboardPlan.panels.length}`,
      },
    ],
    dataProfile: plan.dataProfile,
  };
}
