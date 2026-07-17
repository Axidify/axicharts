import type { RuntimeDashboardSpec } from "@axicharts/charts-runtime";

const CATEGORIES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const ADAPTER_ROWS = [
  {
    type: "static",
    useCase: "Fixtures, Storybook, offline demos",
    fields: "data",
  },
  {
    type: "rest",
    useCase: "Poll HTTP metrics or historians",
    fields: "url, intervalMs, staleAfterMs",
  },
  {
    type: "websocket",
    useCase: "Push JSON telemetry streams",
    fields: "url, staleAfterMs, reconnectDelayMs, parseMessage",
  },
  {
    type: "mock-live",
    useCase: "Dev panels with synthetic drift",
    fields: "data, intervalMs, mutate",
  },
  {
    type: "mqtt",
    useCase: "Sparkplug / plain MQTT (inject connect)",
    fields: "url, topic, staleAfterMs, reconnectDelayMs, connect, parsePayload",
  },
  {
    type: "historian",
    useCase: "Rolling tag window over REST",
    fields: "url, tags, windowMs, intervalMs",
  },
] as const;

export const EMBED_RUNTIME_SPEC: RuntimeDashboardSpec = {
  layout: "embed",
  dashboard: {
    title: "prod-api-01",
    subtitle: "Static demo",
    template: "ops-2x2",
    theme: "industrial",
    mode: "live",
    data: {
      categories: CATEGORIES,
      cells: [
        { title: "CPU", data: [22, 28, 31, 34, 30, 34, 32], suffix: "%" },
        { title: "Memory", data: [55, 58, 60, 59, 61, 62, 61], suffix: "%" },
        {
          title: "Errors",
          data: [1, 2, 5, 3, 2, 4, 3],
          suffix: "/min",
          tone: "warning",
        },
        { title: "p95", data: [42, 38, 55, 49, 62, 58, 71], suffix: "ms" },
      ],
      alarms: [{ id: "cpu", message: "CPU above warn threshold", severity: "warning" }],
    },
  },
};

export const MOSAIC_PRESET_CODE = `import { buildMosaicPreset } from "@axicharts/charts-runtime/mosaic-presets";
import { listMosaicPresets } from "@axicharts/charts-runtime";

listMosaicPresets(); // ops-finance, ops-overview, trading-program, command-center

const wall = buildMosaicPreset("trading-program");
// => trading-blotter + program-dashboard cells with static fixtures`;

export const MOSAIC_RUNTIME_SPEC: RuntimeDashboardSpec = {
  layout: "mosaic",
  wall: {
    title: "Packaging Line 3",
    subtitle: "Multi-source mosaic",
    theme: "industrial",
    mode: "interactive",
    columns: 2,
    dataSourceId: "ops",
    dataSources: [
      {
        id: "ops",
        type: "static",
        data: {
          categories: ["Mon", "Tue", "Wed", "Thu"],
          cells: [
            { title: "CPU", data: [22, 28, 31, 34], suffix: "%" },
            { title: "Memory", data: [55, 58, 60, 59], suffix: "%" },
            { title: "Errors", data: [1, 2, 5, 3], suffix: "/min", tone: "warning" },
            { title: "p95", data: [42, 38, 55, 49], suffix: "ms" },
          ],
        },
      },
      {
        id: "kpi",
        type: "static",
        data: {
          kpis: [
            { value: "98.2%", label: "Uptime" },
            { value: "1.2k", label: "Units/hr" },
          ],
          categories: ["08:00", "09:00", "10:00", "11:00", "12:00"],
          series: [{ name: "Throughput", data: [980, 1020, 1100, 1180, 1210] }],
        },
      },
    ],
    data: {
      alarms: [
        {
          id: "cpu-high",
          message: "CPU above warn threshold",
          severity: "warning",
        },
      ],
    },
    cells: [
      {
        id: "ops",
        template: "ops-2x2",
        title: "Line 3",
        dataSourceId: "ops",
      },
      {
        id: "kpi",
        template: "line-overview",
        title: "Throughput",
        dataSourceId: "kpi",
      },
    ],
  },
};
