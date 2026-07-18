import type { DataProfile, MetricProfile, PanelSpec } from "./types";
import { applySpecCompilers } from "./specCompiler";
import { inferColorEncodingForPanel } from "./colorEncodingPlan";
import { inferLineCurveForPanel } from "./curveEncodingPlan";
import { applyVerticalRules } from "./rulePacks/applyVerticalRules";
import { inferSizeEncodingForPanel } from "./sizeEncodingPlan";

export type PlanPanelsOptions = {
  intent?: string;
  allMetrics?: MetricProfile[];
};

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
  const type = inferChartType(metric);
  const theme = inferTheme(metric);
  const mode = inferMode(metric);

  const panel: PanelSpec = {
    specVersion: 1,
    type,
    title: metric.name,
    theme,
    mode,
    encoding: {
      x: { field: "time", type: "nominal" },
      y: { field: metric.name, type: "quantitative" },
      value: { field: "value", type: "quantitative" },
    },
    valueSuffix: metric.unit ? ` ${metric.unit}` : undefined,
  };

  if (type === "gauge") {
    panel.encoding = { value: { field: metric.name, type: "quantitative" } };
    panel.props = { label: metric.name, unit: metric.unit ?? "%" };
  }

  if (type === "table") {
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
    type,
    metric,
    intent: options.intent,
    profileFields: options.profileFields,
  });
  if (colorEncoding && panel.encoding) {
    panel.encoding = { ...panel.encoding, color: colorEncoding };
  }

  const sizeEncoding = inferSizeEncodingForPanel({
    type,
    metric,
    intent: options.intent,
    profileFields: options.profileFields,
  });
  if (sizeEncoding && panel.encoding) {
    panel.encoding = { ...panel.encoding, size: sizeEncoding };
  }

  const lineCurve = inferLineCurveForPanel({
    type,
    metric,
    intent: options.intent,
  });
  if (lineCurve) {
    const existingStyle =
      panel.props?.style && typeof panel.props.style === "object"
        ? (panel.props.style as Record<string, unknown>)
        : {};
    panel.props = {
      ...panel.props,
      style: {
        ...existingStyle,
        line: { curve: lineCurve },
      },
    };
  }

  return applyVerticalRules(panel, {
    metric,
    intent: options.intent,
    profileFields: options.profileFields,
    allMetrics: options.allMetrics,
  });
}

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
