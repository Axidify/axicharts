import type { DataProfile, MetricProfile, PanelSpec } from "./types";

function inferChartType(metric: MetricProfile): PanelSpec["type"] {
  const name = metric.name.toLowerCase();
  const kind = metric.kind;

  if (kind === "ohlc") return "candlestick";
  if (kind === "distribution") return "pie";
  if (kind === "gauge") return "gauge";

  if (name.includes("waterfall") || name.includes("bridge") || name.includes("pnl")) {
    return "waterfall";
  }
  if (name.includes("correlation") || name.includes("heatmap")) {
    return "heatmap";
  }
  if (name.includes("share") || name.includes("mix") || name.includes("split")) {
    return "pie";
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

export function planPanelFromMetric(metric: MetricProfile): PanelSpec {
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

  return panel;
}

export function planPanelsFromProfile(profile: DataProfile): PanelSpec[] {
  return profile.metrics.map(planPanelFromMetric);
}

export function suggestTemplate(profile: DataProfile): string {
  const tags = profile.metrics.flatMap((metric) =>
    Object.entries(metric.tags ?? {}).map(([key, value]) => `${key}:${value}`),
  );

  if (tags.some((tag) => tag.includes("vertical:finance"))) return "finance-pnl";
  if (tags.some((tag) => tag.includes("vertical:trading"))) return "trading-blotter";
  if (tags.some((tag) => tag.includes("vertical:resources"))) return "capacity-grid";
  if (profile.metrics.length >= 4 && profile.metrics.every((m) => m.kind !== "ohlc")) {
    return "ops-2x2";
  }
  if (profile.metrics.length <= 2) return "line-overview";
  return "line-overview";
}
