import type { PanelSpec } from "../types";
import type { VerticalPanelContext, VerticalRulePack } from "./types";

function applyOpsPanelRules(panel: PanelSpec, ctx: VerticalPanelContext): PanelSpec {
  const name = ctx.metric.name.toLowerCase();
  const intent = ctx.intent?.toLowerCase() ?? "";
  const kind = ctx.metric.kind;

  if (
    /alarm\s*panel|active\s*alarms|alert\s*panel|andon/.test(intent) ||
    /^alarms?$/.test(name)
  ) {
    return {
      ...panel,
      type: "alert",
      theme: "live",
      mode: "live",
      encoding: undefined,
      props: {
        title: panel.title ?? "Active alarms",
        surface: "dark",
      },
    };
  }

  if (kind === "gauge" || /utilization|capacity|fill|level|tank/.test(name)) {
    return {
      ...panel,
      type: "gauge",
      theme: "live",
      mode: "live",
      encoding: { value: { field: ctx.metric.name, type: "quantitative" } },
      props: {
        label: ctx.metric.name,
        unit: ctx.metric.unit ?? "%",
        warningAt: 75,
        criticalAt: 90,
      },
    };
  }

  if (/errors?|fault|defect|reject/.test(name)) {
    return {
      ...panel,
      type: "bar",
      theme: "live",
      mode: "live",
    };
  }

  if (
    /latency|p\d+|slo|response|throughput/.test(name) ||
    /slo|threshold|alarm|telemetry/.test(intent)
  ) {
    const sloMax = /p99|p95/.test(name) ? 500 : 200;
    return {
      ...panel,
      type: panel.type === "bar" ? "line" : panel.type,
      theme: "live",
      mode: "live",
      props: {
        ...panel.props,
        thresholdBands: [
          { min: 0, max: sloMax, label: "SLO band", tone: "warning" },
        ],
        annotations: [
          {
            type: "line",
            value: sloMax,
            label: "SLO limit",
            tone: "critical",
          },
        ],
      },
    };
  }

  return panel;
}

export const opsRulePack: VerticalRulePack = {
  id: "ops",
  colorFieldPriority: [
    "aboveSlo",
    "above_slo",
    "meetsSlo",
    "meets_slo",
    "severity",
    "alarm",
    "alarmed",
    "status",
    "healthy",
    "aboveTarget",
    "above_target",
  ],
  sizeFieldPriority: [
    "load",
    "throughput",
    "requests",
    "connections",
    "count",
    "samples",
    "inventory",
    "population",
    "volume",
  ],
  extraColorIntent:
    /alarm\s*severity|color\s*by\s*severity|above\s*slo|meets?\s*slo|healthy\s*\/\s*alarm/i,
  extraSizeIntent: /size\s*by\s*load|sized?\s*by\s*throughput|bar\s*width\s*by\s*count/i,
  applyPanelRules: applyOpsPanelRules,
};
