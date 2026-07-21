import type { DataProfile } from "../../types";
import type { AnalyticalQuestion } from "../types";
import type { FieldProfile } from "../../types";
import type { VerticalId } from "../../rulePacks/types";
import { inferChartGeometry } from "./inferGeometry";
import type { PanelRecipe } from "./types";
import { findField } from "./types";

const STAGE_ORDER = [
  "Discovery",
  "Qualified",
  "Proposal",
  "Negotiation",
  "Closed Won",
  "Closed Lost",
] as const;

const CATEGORY_ORDER = [
  "Payroll",
  "Rent",
  "Marketing",
  "Operations",
  "Travel",
  "Software",
  "Utilities",
] as const;

const PAYMENT_METHOD_ORDER = ["Card", "ACH", "Wire", "Check", "Cash"] as const;

function resolveStageOrder(question: AnalyticalQuestion): readonly string[] | undefined {
  if (question.dimensionKey === "stage") return STAGE_ORDER;
  if (question.dimensionKey === "category") return CATEGORY_ORDER;
  if (question.dimensionKey === "payment_method") return PAYMENT_METHOD_ORDER;
  return undefined;
}

function resolveMeasure(fieldProfiles: FieldProfile[], pattern?: RegExp): string | undefined {
  return findField(fieldProfiles, pattern ?? /value|amount|revenue|hours|balance|debit|credit/i, "measure");
}

function resolveDimension(fieldProfiles: FieldProfile[], pattern: RegExp): string | undefined {
  return findField(fieldProfiles, pattern, "dimension");
}

function resolveTime(fieldProfiles: FieldProfile[]): string | undefined {
  return findField(fieldProfiles, /date|time|period|week|month/i, "time");
}

function geometryHints(profile?: Pick<DataProfile, "grain" | "timeSpan" | "cardinalities">) {
  return {
    grain: profile?.grain,
    timeSpan: profile?.timeSpan,
    cardinalities: profile?.cardinalities,
  };
}

/**
 * C158 — build a panel recipe from a catalog question + field profiles.
 */
export function questionToRecipe(
  question: AnalyticalQuestion,
  fieldProfiles: FieldProfile[],
  dataProfile?: Pick<DataProfile, "grain" | "timeSpan" | "cardinalities">,
): PanelRecipe | null {
  const vertical = question.verticals[0];
  const requires = question.requires;

  if (question.kind === "kpi") {
    const geometry = inferChartGeometry({
      kind: "kpi",
      intent: question.intent,
      fieldProfiles,
      ...geometryHints(dataProfile),
    });
    return {
      questionId: question.id,
      title: question.text,
      intent: question.intent,
      panelType: geometry.panelType,
      vertical,
      kpiLabel: question.text,
    };
  }

  if (question.kind === "table") {
    const geometry = inferChartGeometry({
      kind: "table",
      intent: question.intent,
      fieldProfiles,
      ...geometryHints(dataProfile),
    });
    return {
      questionId: question.id,
      title: question.text,
      intent: question.intent,
      panelType: geometry.panelType,
      vertical,
      tableColumns: buildTableColumns(question.id, fieldProfiles),
    };
  }

  const dimPattern = requires?.dimensionPattern ?? /category|department|stage|source/i;
  const measurePattern = requires?.measurePattern ?? /value|amount|hours|debit|credit/i;
  const xField =
    resolveDimension(fieldProfiles, dimPattern) ??
    (requires?.timeField ? resolveTime(fieldProfiles) : undefined);
  const yField =
    question.id.includes("weighted")
      ? "weightedValue"
      : question.id.includes("status") || question.id.includes("count")
        ? "count"
        : "value";

  const measureField = resolveMeasure(fieldProfiles, measurePattern);
  if (!xField && question.id !== "ledger.chart.balance_trend") return null;

  const balanceTrend = question.id === "ledger.chart.balance_trend";
  const timeField = balanceTrend ? resolveTime(fieldProfiles) : xField;
  const valueField = balanceTrend ? resolveMeasure(fieldProfiles, /balance/i) : measureField;

  const geometry = inferChartGeometry({
    kind: "chart",
    intent: question.intent,
    fieldProfiles,
    xField: timeField ?? xField,
    yField,
    dimensionKey: question.dimensionKey,
    ...geometryHints(dataProfile),
  });

  const recipe: PanelRecipe = {
    questionId: question.id,
    title: question.text,
    intent: buildCartesianIntent(geometry, question.intent),
    panelType: geometry.panelType,
    markType: geometry.markType,
    orientation: geometry.orientation,
    vertical,
    groupBy: timeField ?? xField,
    xField: timeField ?? xField,
    yField,
    aggregates: valueField
      ? { [yField]: { op: "sum", field: valueField } }
      : { [yField]: { op: "count" } },
    stageOrder: resolveStageOrder(question),
  };

  if (question.id === "sales.chart.open_by_stage") {
    const stageField = resolveDimension(fieldProfiles, /stage|phase/i);
    if (stageField) {
      recipe.where = [{ field: stageField, op: "neq", value: "Closed Won" }];
      recipe.title = "Open pipeline by stage";
    }
  }

  if (question.id === "ledger.chart.waterfall") {
    recipe.panelType = "waterfall";
  }

  if (/stacked|debit.*credit/.test(question.intent)) {
    const debit = resolveMeasure(fieldProfiles, /debit/i);
    const credit = resolveMeasure(fieldProfiles, /credit/i);
    if (debit && credit) {
      recipe.yFields = [debit, credit];
      recipe.stack = true;
      recipe.intent = "stacked debit and credit bar chart by category with value labels";
    }
  }

  return recipe;
}

function buildCartesianIntent(
  geometry: ReturnType<typeof inferChartGeometry>,
  fallback: string,
): string {
  if (geometry.panelType === "funnel") return fallback;
  if (geometry.panelType === "matrix") return `${fallback} heatmap grid intensity`;
  if (geometry.markType === "line") return `${fallback} line chart over time monotone`;
  if (geometry.markType === "area") return `${fallback} area chart cumulative`;
  return `${fallback} bar chart with value labels`;
}

function buildTableColumns(
  questionId: string,
  fieldProfiles: FieldProfile[],
): PanelRecipe["tableColumns"] {
  const names = fieldProfiles.map((profile) => profile.name);
  const pick = (pattern: RegExp) => names.find((name) => pattern.test(name));

  if (questionId === "sales.table.opportunities") {
    return [
      { key: pick(/customer|account/i) ?? "Customer", label: "Customer" },
      { key: pick(/stage|phase/i) ?? "Stage", label: "Stage" },
      { key: pick(/value|amount/i) ?? "Value", label: "Value", align: "right" },
      { key: pick(/probability/i) ?? "Probability", label: "Probability", align: "right" },
      { key: pick(/salesperson|rep/i) ?? "Salesperson", label: "Salesperson" },
    ];
  }

  if (questionId === "ledger.table.transactions") {
    return [
      { key: pick(/date/i) ?? "Date", label: "Date" },
      { key: pick(/category/i) ?? "Category", label: "Category" },
      { key: pick(/debit/i) ?? "Debit", label: "Debit", align: "right" },
      { key: pick(/credit/i) ?? "Credit", label: "Credit", align: "right" },
      { key: pick(/payment/i) ?? "Payment Method", label: "Payment method" },
    ];
  }

  if (questionId === "attendance.table.log") {
    return [
      { key: pick(/name/i) ?? "Name", label: "Employee" },
      { key: pick(/department/i) ?? "Department", label: "Department" },
      { key: pick(/hours/i) ?? "Hours", label: "Hours", align: "right" },
      { key: pick(/status/i) ?? "Status", label: "Status" },
    ];
  }

  return names.slice(0, 6).map((name) => ({ key: name, label: name }));
}

export function questionsToRecipes(
  questions: AnalyticalQuestion[],
  fieldProfiles: FieldProfile[],
  dataProfile?: Pick<DataProfile, "grain" | "timeSpan" | "cardinalities">,
): PanelRecipe[] {
  return questions
    .map((question) => questionToRecipe(question, fieldProfiles, dataProfile))
    .filter((recipe): recipe is PanelRecipe => recipe != null);
}
