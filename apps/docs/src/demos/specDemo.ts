import type { DataProfile, PanelSpec } from "@axicharts/charts-spec";

export const SPEC_PANEL: PanelSpec = {
  specVersion: 1,
  type: "line",
  title: "p95 latency",
  theme: "clean",
  fill: true,
  height: 200,
  encoding: {
    x: { field: "day", type: "nominal" },
    y: { field: "value", type: "quantitative" },
  },
  valueSuffix: " ms",
};

export const SPEC_PANEL_DATA = [
  { day: "Mon", value: 42 },
  { day: "Tue", value: 38 },
  { day: "Wed", value: 55 },
  { day: "Thu", value: 49 },
  { day: "Fri", value: 62 },
  { day: "Sat", value: 58 },
  { day: "Sun", value: 71 },
];

export const SPEC_PROFILE: DataProfile = {
  metrics: [
    { name: "cpu", unit: "%", tags: { vertical: "ops", refresh: "live" } },
    { name: "p95_latency", unit: "ms", tags: { vertical: "ops" } },
    { name: "errors", unit: "/min", tags: { vertical: "ops" } },
    { name: "memory", unit: "%", tags: { vertical: "ops" } },
  ],
};
