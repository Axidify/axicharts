import type { PanelSpec, SpecData } from "../types";

export type BlocksPlaygroundPreset = {
  id: string;
  label: string;
  description: string;
  intent?: string;
  panel: PanelSpec;
  rows: SpecData;
};

export const BLOCKS_PLAYGROUND_PRESETS: BlocksPlaygroundPreset[] = [
  {
    id: "revenue-target",
    label: "Revenue vs target",
    description: "Bar + line + quota rule + healthy band — canonical finance combo.",
    intent: "Weekly revenue bars with target line, quota at 50, and healthy band 44–52",
    panel: {
      specVersion: 1,
      type: "cartesian",
      title: "Revenue vs target",
      theme: "studio",
      mode: "static",
      height: 260,
      encoding: { x: { field: "week", label: "Week" } },
      marks: [
        { type: "bar", field: "revenue", label: "Revenue" },
        { type: "line", field: "target", label: "Target", curve: "monotone" },
        { type: "rule", value: 50, label: "Quota", tone: "warning" },
        { type: "band", min: 44, max: 52, label: "Healthy band", tone: "success" },
      ],
    },
    rows: [
      { week: "W1", revenue: 42, target: 40 },
      { week: "W2", revenue: 48, target: 44 },
      { week: "W3", revenue: 51, target: 48 },
      { week: "W4", revenue: 47, target: 50 },
      { week: "W5", revenue: 55, target: 52 },
      { week: "W6", revenue: 58, target: 54 },
    ],
  },
  {
    id: "ops-slo",
    label: "Ops SLO",
    description: "Latency trend with SLO rule and healthy band — live ops preset.",
    intent: "p95 latency line with SLO at 200ms and healthy band under 150ms",
    panel: {
      specVersion: 1,
      type: "cartesian",
      title: "API p95 latency",
      theme: "live",
      mode: "interactive",
      height: 240,
      encoding: { x: { field: "hour", label: "Hour" } },
      marks: [
        { type: "line", field: "latency_ms", label: "p95", tone: "info" },
        { type: "rule", value: 200, label: "SLO", tone: "critical" },
        { type: "band", min: 0, max: 150, label: "Healthy", tone: "success" },
      ],
    },
    rows: [
      { hour: "00", latency_ms: 92 },
      { hour: "04", latency_ms: 118 },
      { hour: "08", latency_ms: 164 },
      { hour: "12", latency_ms: 188 },
      { hour: "16", latency_ms: 142 },
      { hour: "20", latency_ms: 110 },
    ],
  },
  {
    id: "studio-cell",
    label: "Studio cell",
    description: "Single studio-themed bar mark — dashboard tile density.",
    intent: "Weekly revenue bars in studio theme for a KPI row cell",
    panel: {
      specVersion: 1,
      type: "cartesian",
      title: "Weekly revenue",
      theme: "studio",
      mode: "static",
      height: 200,
      encoding: { x: { field: "week" } },
      marks: [{ type: "bar", field: "revenue", label: "Revenue" }],
    },
    rows: [
      { week: "W1", revenue: 42 },
      { week: "W2", revenue: 48 },
      { week: "W3", revenue: 51 },
      { week: "W4", revenue: 47 },
    ],
  },
  {
    id: "dual-metric",
    label: "Dual metric",
    description: "Bar + line on different scales — dual-axis auto when magnitudes diverge.",
    intent: "Revenue bars with margin percent line on secondary scale",
    panel: {
      specVersion: 1,
      type: "cartesian",
      theme: "clean",
      mode: "static",
      height: 260,
      encoding: { x: { field: "month" } },
      marks: [
        { type: "bar", field: "revenue", label: "Revenue ($k)" },
        { type: "line", field: "margin_pct", label: "Margin %", curve: "linear" },
      ],
    },
    rows: [
      { month: "Jan", revenue: 120, margin_pct: 18 },
      { month: "Feb", revenue: 132, margin_pct: 19 },
      { month: "Mar", revenue: 128, margin_pct: 17 },
      { month: "Apr", revenue: 145, margin_pct: 21 },
    ],
  },
];

export function findPlaygroundPreset(id: string): BlocksPlaygroundPreset | undefined {
  return BLOCKS_PLAYGROUND_PRESETS.find((p) => p.id === id);
}

export function presetSpecJson(preset: BlocksPlaygroundPreset): string {
  return JSON.stringify(preset.panel, null, 2);
}
