import type { PanelRecipe } from "./recipes/types";
import type { TabularEnrichment } from "./enrich/types";
import { formatHours, formatRm } from "./enrich/types";

const KPI_FIELD_MAP: Record<string, string> = {
  "sales.kpi.total_pipeline": "totalPipeline",
  "sales.kpi.weighted_forecast": "weightedForecast",
  "sales.kpi.closed_won": "wonValue",
  "sales.kpi.open_deals": "openOpportunities",
  "ledger.kpi.balance": "balance",
  "ledger.kpi.net_flow": "netFlow",
  "ledger.kpi.total_credits": "totalCredits",
  "ledger.kpi.total_debits": "totalDebits",
  "attendance.kpi.total_hours": "totalHours",
  "attendance.kpi.present": "presentCount",
  "attendance.kpi.leave": "leaveCount",
  "attendance.kpi.avg_hours_present": "avgHoursPresent",
};

export function resolveKpiValue(questionId: string, enrichment: TabularEnrichment): number {
  const key = KPI_FIELD_MAP[questionId];
  if (!key) return 0;
  return enrichment.kpis[key] ?? 0;
}

export function formatKpiDisplay(questionId: string, value: number): string {
  if (questionId === "sales.kpi.open_deals" || questionId === "attendance.kpi.present" || questionId === "attendance.kpi.leave") {
    return String(value);
  }
  if (/attendance\.kpi/.test(questionId)) return formatHours(value);
  if (/sales\.kpi|ledger\.kpi/.test(questionId)) return formatRm(value);
  return String(value);
}

export function kpiTone(questionId: string): "success" | "warning" | undefined {
  if (questionId === "ledger.kpi.total_credits") return "success";
  if (questionId === "ledger.kpi.total_debits") return "warning";
  return undefined;
}

/**
 * C157 — bind enriched datasets to a panel recipe before compile.
 */
export function applyRecipeData(recipe: PanelRecipe, enrichment: TabularEnrichment): PanelRecipe {
  const fieldMap = enrichment.fieldMap;

  switch (recipe.questionId) {
    case "sales.chart.by_stage":
      return {
        ...recipe,
        preparedRows: enrichment.datasets.valueByStage,
        xField: fieldMap.stage,
        yField: "value",
      };
    case "sales.chart.open_by_stage":
      return {
        ...recipe,
        preparedRows: enrichment.datasets.openPipelineByStage,
        xField: fieldMap.stage,
        yField: "value",
      };
    case "sales.chart.by_salesperson":
      return {
        ...recipe,
        preparedRows: enrichment.datasets.valueBySalesperson,
        xField: fieldMap.salesperson,
        yField: "value",
      };
    case "sales.chart.weighted_forecast":
      return {
        ...recipe,
        preparedRows: enrichment.datasets.weightedBySalesperson,
        xField: fieldMap.salesperson,
        yField: "weightedValue",
        intent: "weighted forecast bar chart by salesperson with value labels",
      };
    case "sales.chart.by_source":
      return {
        ...recipe,
        preparedRows: enrichment.datasets.valueBySource,
        xField: fieldMap.source,
        yField: "value",
      };
    case "sales.table.opportunities":
      return {
        ...recipe,
        preparedRows: enrichment.derivedRows,
        tableColumns: [
          { key: fieldMap.customer, label: "Customer" },
          { key: fieldMap.salesperson, label: "Salesperson" },
          { key: fieldMap.stage, label: "Stage" },
          { key: fieldMap.value, label: "Value", align: "right" },
          { key: fieldMap.probability, label: "Probability", align: "right" },
          { key: fieldMap.expectedClose, label: "Expected close" },
        ],
      };
    case "ledger.chart.balance_trend":
      return {
        ...recipe,
        preparedRows: enrichment.datasets.byDate,
        xField: fieldMap.date,
        yField: "balance",
        intent: "balance line trend over time smooth monotone",
      };
    case "ledger.chart.expenses":
      return {
        ...recipe,
        preparedRows: enrichment.datasets.expensesByCategory,
        xField: fieldMap.category,
        yField: "debit",
        intent: "expenses bar chart with value labels",
      };
    case "ledger.chart.revenue":
      return {
        ...recipe,
        preparedRows: enrichment.datasets.revenueByCategory,
        xField: fieldMap.category,
        yField: "credit",
        intent: "revenue bar chart with value labels",
      };
    case "ledger.chart.payment_method":
      return {
        ...recipe,
        preparedRows: enrichment.datasets.volumeByPaymentMethod,
        xField: fieldMap.paymentMethod,
        yField: "volume",
      };
    case "ledger.chart.cost_center":
      return {
        ...recipe,
        title: "Spend by cost center",
        intent: "spend bar chart with value labels",
        preparedRows: enrichment.datasets.spendByCostCenter,
        xField: fieldMap.costCenter,
        yField: "spend",
      };
    case "ledger.chart.waterfall": {
      const waterfallItems = enrichment.extras?.waterfallByCategory;
      return {
        ...recipe,
        panelType: "waterfall",
        waterfallItems: Array.isArray(waterfallItems) ? waterfallItems : undefined,
        preparedRows: Array.isArray(waterfallItems) ? waterfallItems : [],
      };
    }
    case "ledger.table.transactions":
      return {
        ...recipe,
        preparedRows: enrichment.rows,
        tableColumns: [
          { key: fieldMap.date, label: "Date" },
          { key: fieldMap.category, label: "Category" },
          { key: fieldMap.debit, label: "Debit", align: "right" },
          { key: fieldMap.credit, label: "Credit", align: "right" },
          { key: fieldMap.paymentMethod, label: "Payment method" },
        ],
      };
    case "attendance.chart.hours_by_department":
      return {
        ...recipe,
        preparedRows: enrichment.datasets.hoursByDepartmentPresent ?? enrichment.datasets.hoursByDepartment,
        xField: fieldMap.department,
        yField: "hours",
        title: "Hours by department (present)",
        intent: "hours bar chart by department with value labels",
      };
    case "attendance.chart.status":
      return {
        ...recipe,
        preparedRows: enrichment.datasets.countByStatus,
        xField: fieldMap.status,
        yField: "count",
        intent: "status breakdown bar chart with value labels",
      };
    case "attendance.table.log":
      return {
        ...recipe,
        preparedRows: enrichment.rows,
        tableColumns: [
          { key: fieldMap.name, label: "Employee" },
          { key: fieldMap.department, label: "Department" },
          { key: fieldMap.hours, label: "Hours", align: "right" },
          { key: fieldMap.status, label: "Status" },
        ],
      };
    default:
      return recipe;
  }
}

export function applyKpiToRecipe(recipe: PanelRecipe, enrichment: TabularEnrichment): PanelRecipe {
  if (recipe.panelType !== "stat" || !recipe.questionId) return recipe;
  if (!(recipe.questionId in KPI_FIELD_MAP)) return recipe;
  const value = resolveKpiValue(recipe.questionId, enrichment);
  return {
    ...recipe,
    kpiValue: value,
    kpiLabel: recipe.title,
  };
}
