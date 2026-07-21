import type { ChartBlockMarkSpec, DataProfile, FieldProfile, MetricProfile, PanelSpec } from "./types";
import { applySpecCompilers } from "./specCompiler";
import { inferColorEncodingForPanel } from "./colorEncodingPlan";
import { inferLineCurveForPanel } from "./curveEncodingPlan";
import { normalizeToCartesian } from "./normalizeToCartesian";
import { applyVerticalRules } from "./rulePacks/applyVerticalRules";
import { inferSizeEncodingForPanel } from "./sizeEncodingPlan";
import { inferCategoryFieldFromProfile } from "./profileInference";

export type PlanPanelsOptions = {
  intent?: string;
  allMetrics?: MetricProfile[];
  fieldProfiles?: FieldProfile[];
};

/**
 * Legacy profile planner — infers panel `type` from metric names/tags (pie, funnel, waterfall, …).
 *
 * **Not agent grammar.** For RFC-004 agent-safe panels use `planDashboardFromRows` (tabular rows)
 * or MCP `create_panel` / `validate_panel`. This API remains for charts-planner server, Storybook,
 * and CSV/profile demos only.
 */

function inferChartType(metric: MetricProfile): PanelSpec["type"] {
  const name = metric.name.toLowerCase();
  const kind = metric.kind;

  if (kind === "ohlc") return "candlestick";
  if (kind === "gauge") return "gauge";

  if (name.includes("donut") || name.includes("share") || name.includes("mix") || name.includes("split")) {
    return "donut";
  }
  if (kind === "distribution") return "pie";

  if (name.includes("position") || name.includes("blotter") || name.includes("order")) {
    return "table";
  }
  if (name.includes("waterfall") || name.includes("bridge") || name.includes("pnl")) {
    return "waterfall";
  }
  if (name.includes("correlation") || name.includes("heatmap")) {
    return "heatmap";
  }
  if (name.includes("radar") || name.includes("spider") || name.includes("scorecard")) {
    return "radar";
  }
  if (name.includes("funnel") || name.includes("pipeline") || name.includes("stage")) {
    return "funnel";
  }
  if (name.includes("burndown") || name.includes("burn")) {
    return "line";
  }
  if (
    name.includes("cpu") ||
    name.includes("memory") ||
    name.includes("latency") ||
    name.includes("rate") ||
    name.includes("rsi")
  ) {
    return "line";
  }
  if (name.includes("total") || name.includes("count") || name.includes("volume")) {
    return "bar";
  }
  return "line";
}

type CartesianDataMarkType = "line" | "bar" | "area";

function isCartesianDataType(type: PanelSpec["type"]): type is CartesianDataMarkType {
  return type === "line" || type === "bar" || type === "area";
}

function buildCartesianMarks(
  markType: CartesianDataMarkType,
  metric: MetricProfile,
  curve?: "linear" | "monotone",
): ChartBlockMarkSpec[] {
  return [
    {
      type: markType,
      field: metric.name,
      label: metric.name,
      ...(curve && markType !== "bar" ? { curve } : {}),
    },
  ];
}

function applyCurveToMarks(
  marks: ChartBlockMarkSpec[],
  curve: "linear" | "monotone",
): ChartBlockMarkSpec[] {
  return marks.map((mark) =>
    mark.type === "line" || mark.type === "area" ? { ...mark, curve } : mark,
  );
}

function finalizeCartesianPanel(panel: PanelSpec): PanelSpec {
  if (
    panel.type === "line" ||
    panel.type === "bar" ||
    panel.type === "area" ||
    panel.type === "combo"
  ) {
    return normalizeToCartesian(panel);
  }
  return panel;
}

function inferTheme(metric: MetricProfile): PanelSpec["theme"] {
  const tags = metric.tags ?? {};
  if (tags.vertical === "trading" || tags.vertical === "ops") return "live";
  if (tags.vertical === "finance") return "clean";
  if (tags.vertical === "resources") return "clean";
  return metric.kind === "gauge" ? "clean" : "industrial";
}

function inferMode(metric: MetricProfile): PanelSpec["mode"] {
  const tags = metric.tags ?? {};
  if (tags.refresh === "live" || tags.vertical === "ops" || tags.vertical === "trading") {
    return "live";
  }
  return "interactive";
}

export function planPanelFromMetric(
  metric: MetricProfile,
  options: PlanPanelsOptions & { profileFields?: string[] } = {},
): PanelSpec {
  const inferredType = inferChartType(metric);
  const cartesian = isCartesianDataType(inferredType);
  const encodingType: PanelSpec["type"] = cartesian ? "cartesian" : inferredType;
  const theme = inferTheme(metric);
  const mode = inferMode(metric);
  const metricNames =
    options.allMetrics?.map((m) => m.name) ?? [metric.name];
  const xField = inferCategoryFieldFromProfile(options.profileFields, metricNames);

  const panel: PanelSpec = {
    specVersion: 1,
    type: encodingType,
    title: metric.name,
    theme,
    mode,
    encoding: cartesian
      ? { x: { field: xField, type: "nominal" } }
      : {
          x: { field: xField, type: "nominal" },
          y: { field: metric.name, type: "quantitative" },
          value: { field: "value", type: "quantitative" },
        },
    marks: cartesian ? buildCartesianMarks(inferredType, metric) : undefined,
    valueSuffix: metric.unit ? ` ${metric.unit}` : undefined,
  };

  if (inferredType === "gauge") {
    panel.encoding = { value: { field: metric.name, type: "quantitative" } };
    panel.props = { label: metric.name, unit: metric.unit ?? "%" };
  }

  if (inferredType === "table") {
    panel.encoding = undefined;
    panel.props = {
      columns: [
        { key: "name", label: metric.name },
        { key: "value", label: "Value", align: "right", monospace: true },
      ],
      rows: [],
      compact: true,
      surface: inferTheme(metric) === "live" ? "dark" : "light",
    };
  }

  const colorEncoding = inferColorEncodingForPanel({
    type: encodingType,
    metric,
    intent: options.intent,
    profileFields: options.profileFields,
    xField,
  });
  if (colorEncoding && panel.encoding) {
    panel.encoding = { ...panel.encoding, color: colorEncoding };
  }

  const sizeEncoding = inferSizeEncodingForPanel({
    type: encodingType,
    metric,
    intent: options.intent,
    profileFields: options.profileFields,
  });
  if (sizeEncoding && panel.encoding) {
    panel.encoding = { ...panel.encoding, size: sizeEncoding };
  }

  const lineCurve = inferLineCurveForPanel({
    type: encodingType,
    metric,
    intent: options.intent,
  });

  const ruled = applyVerticalRules(panel, {
    metric,
    intent: options.intent,
    profileFields: options.profileFields,
    fieldProfiles: options.fieldProfiles,
    allMetrics: options.allMetrics,
  });

  const finalized = finalizeCartesianPanel(ruled);

  if (lineCurve && finalized.type === "cartesian" && finalized.marks) {
    return {
      ...finalized,
      marks: applyCurveToMarks(finalized.marks as ChartBlockMarkSpec[], lineCurve),
    };
  }

  return finalized;
}

/** @see planPanelFromMetric — legacy profile planner; not agent grammar. */
export function planPanelsFromProfile(
  profile: DataProfile,
  options: PlanPanelsOptions = {},
): PanelSpec[] {
  const profileFields = profile.fields ?? [];
  return profile.metrics.map((metric) =>
    applySpecCompilers(
      planPanelFromMetric(metric, {
        intent: options.intent,
        profileFields,
        fieldProfiles: options.fieldProfiles ?? profile.fieldProfiles,
        allMetrics: profile.metrics,
      }),
      [],
      profile,
    ),
  );
}

export function suggestTemplate(profile: DataProfile): string {
  const tags = profile.metrics.flatMap((metric) =>
    Object.entries(metric.tags ?? {}).map(([key, value]) => `${key}:${value}`),
  );

  if (tags.some((tag) => tag.includes("vertical:plugins"))) return "plugins-wall";
  if (tags.some((tag) => tag.includes("vertical:program"))) return "program-dashboard";
  if (tags.some((tag) => tag.includes("vertical:finance"))) return "finance-pnl";
  if (tags.some((tag) => tag.includes("vertical:trading"))) return "trading-blotter";
  if (tags.some((tag) => tag.includes("vertical:resources"))) return "capacity-grid";
  if (tags.some((tag) => tag.includes("vertical:sre"))) return "sre-incident";
  if (tags.some((tag) => tag.includes("vertical:saas"))) return "saas-growth";
  if (profile.metrics.length >= 4 && profile.metrics.every((m) => m.kind !== "ohlc")) {
    return "ops-2x2";
  }
  if (profile.metrics.length <= 2) return "line-overview";
  return "line-overview";
}
