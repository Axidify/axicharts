import type { PanelSpec } from "../types";

export type DistributionPlaygroundPreset = {
  id: string;
  label: string;
  description: string;
  intent: string;
  panel: PanelSpec;
  rows: Record<string, unknown>[];
};

export const DISTRIBUTION_PLAYGROUND_PRESETS: DistributionPlaygroundPreset[] = [
  {
    id: "browser-share-donut",
    label: "Browser share donut",
    description: "Part-to-whole breakdown with donut hole and slice labels.",
    intent: "browser share donut breakdown with labels",
    panel: {
      type: "distribution",
      encoding: {
        angle: { field: "share", type: "quantitative" },
        color: { field: "browser", type: "nominal" },
      },
      marks: [
        { type: "arc", field: "share" },
        { type: "donut", innerRadius: 42 },
        { type: "label", show: true },
      ],
      theme: "clean",
      mode: "static",
    },
    rows: [
      { browser: "Chrome", share: 48 },
      { browser: "Safari", share: 32 },
      { browser: "Firefox", share: 20 },
    ],
  },
  {
    id: "status-pie",
    label: "Status pie",
    description: "Simple pie without donut hole — arc + labels only.",
    intent: "status distribution pie chart",
    panel: {
      type: "distribution",
      encoding: {
        angle: { field: "count", type: "quantitative" },
        color: { field: "status", type: "nominal" },
      },
      marks: [
        { type: "arc", field: "count" },
        { type: "label", show: true },
      ],
      theme: "clean",
      mode: "static",
    },
    rows: [
      { status: "Open", count: 12 },
      { status: "In progress", count: 8 },
      { status: "Done", count: 24 },
    ],
  },
  {
    id: "segment-tones",
    label: "Segment tones",
    description: "Per-slice semantic tones via cell marks.",
    intent: "revenue share donut with success tone on top segment",
    panel: {
      type: "distribution",
      encoding: {
        angle: { field: "revenue", type: "quantitative" },
        color: { field: "segment", type: "nominal" },
      },
      marks: [
        { type: "arc", field: "revenue" },
        { type: "donut", innerRadius: 40 },
        { type: "cell", dataKey: "Enterprise", tone: "success" },
        { type: "cell", dataKey: "SMB", tone: "info" },
        { type: "label", show: true },
      ],
      theme: "clean",
      mode: "static",
    },
    rows: [
      { segment: "Enterprise", revenue: 620 },
      { segment: "SMB", revenue: 280 },
      { segment: "Self-serve", revenue: 140 },
    ],
  },
];

export function findDistributionPreset(id: string): DistributionPlaygroundPreset | undefined {
  return DISTRIBUTION_PLAYGROUND_PRESETS.find((preset) => preset.id === id);
}

export function distributionPresetSpecJson(preset: DistributionPlaygroundPreset): string {
  return JSON.stringify(preset.panel, null, 2);
}
