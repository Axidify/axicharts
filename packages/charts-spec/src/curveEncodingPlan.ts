import type { MetricProfile, PanelSpec } from "./types";

function isLinePanelType(type: PanelSpec["type"]): boolean {
  return type === "line" || type === "area" || type === "cartesian";
}

export function intentWantsLinearCurve(intent?: string): boolean {
  if (!intent) return false;
  return /\blinear\b|straight\s*line|point[\s-]to[\s-]point|angular|no\s*smooth|sharp\s*angles/i.test(
    intent,
  );
}

export function intentWantsMonotoneCurve(intent?: string): boolean {
  if (!intent) return false;
  return /\bmonotone\b|smooth\s*curve|curved\s*line|spline|bezier/i.test(
    intent,
  );
}

function metricSuggestsSmoothCurve(metric: MetricProfile): boolean {
  const name = metric.name.toLowerCase();
  return /latency|trend|burndown|velocity|rate|p\d+|cpu|memory|throughput/.test(
    name,
  );
}

export function inferLineCurveForPanel(args: {
  type: PanelSpec["type"];
  metric: MetricProfile;
  intent?: string;
}): "linear" | "monotone" | undefined {
  if (!isLinePanelType(args.type)) return undefined;

  if (intentWantsLinearCurve(args.intent)) return "linear";

  const explicit = args.metric.tags?.lineCurve;
  if (explicit === "linear" || explicit === "monotone") return explicit;

  if (intentWantsMonotoneCurve(args.intent)) return "monotone";
  if (metricSuggestsSmoothCurve(args.metric) && args.intent) return "monotone";

  return undefined;
}
