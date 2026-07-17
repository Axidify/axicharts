export type AdapterFieldRow = {
  field: string;
  type: string;
  required: boolean;
  defaultValue?: string;
  description: string;
};

export const ADAPTER_OVERVIEW = [
  {
    type: "static",
    useCase: "Fixtures, Storybook, offline demos",
    fields: "data",
  },
  {
    type: "rest",
    useCase: "Poll HTTP metrics or historians",
    fields: "url, intervalMs, staleAfterMs, mapResponse",
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
    fields: "url, tags, windowMs, intervalMs, mapResponse",
  },
] as const;

export const REST_FIELD_ROWS: AdapterFieldRow[] = [
  {
    field: "type",
    type: `"rest"`,
    required: true,
    description: "Discriminator for the REST poller adapter.",
  },
  {
    field: "url",
    type: "string",
    required: true,
    description: "HTTP endpoint polled on an interval. Relative paths resolve against the page origin.",
  },
  {
    field: "intervalMs",
    type: "number",
    required: false,
    defaultValue: "2000",
    description: "Poll cadence in milliseconds.",
  },
  {
    field: "staleAfterMs",
    type: "number",
    required: false,
    description: "Marks the panel stale when no successful update arrives within this window.",
  },
  {
    field: "fetch",
    type: "typeof fetch",
    required: false,
    description: "Inject a custom fetch implementation (tests, SSR, authenticated clients).",
  },
  {
    field: "mapResponse",
    type: "(payload) => Record",
    required: false,
    defaultValue: "defaultRestMapper",
    description: "Maps JSON payload into template data. Default passes the object through.",
  },
];

export const WEBSOCKET_FIELD_ROWS: AdapterFieldRow[] = [
  {
    field: "type",
    type: `"websocket"`,
    required: true,
    description: "Discriminator for the WebSocket push adapter.",
  },
  {
    field: "url",
    type: "string",
    required: true,
    description: "WebSocket URL (ws:// or wss://).",
  },
  {
    field: "staleAfterMs",
    type: "number",
    required: false,
    description: "Stale overlay when frames stop arriving.",
  },
  {
    field: "reconnectDelayMs",
    type: "number",
    required: false,
    description: "When set, reconnects after close/error using this delay.",
  },
  {
    field: "WebSocketImpl",
    type: "typeof WebSocket",
    required: false,
    description: "Inject WebSocket for Node tests or polyfills.",
  },
  {
    field: "parseMessage",
    type: "(payload) => Record",
    required: false,
    defaultValue: "defaultWebSocketMapper",
    description: "Parses each JSON frame. Return value is merged into the running data object.",
  },
];

export const HISTORIAN_FIELD_ROWS: AdapterFieldRow[] = [
  {
    field: "type",
    type: `"historian"`,
    required: true,
    description: "Discriminator for the historian REST poller.",
  },
  {
    field: "url",
    type: "string",
    required: true,
    description: "Historian endpoint. Query params from, to, and tags are appended automatically.",
  },
  {
    field: "tags",
    type: "string[]",
    required: false,
    description: "Tag names joined as a comma-separated tags query param.",
  },
  {
    field: "windowMs",
    type: "number",
    required: false,
    defaultValue: "3600000",
    description: "Rolling window length used to compute from/to timestamps.",
  },
  {
    field: "intervalMs",
    type: "number",
    required: false,
    defaultValue: "5000",
    description: "Poll cadence in milliseconds.",
  },
  {
    field: "staleAfterMs",
    type: "number",
    required: false,
    description: "Stale overlay when polls stop succeeding.",
  },
  {
    field: "mapResponse",
    type: "(payload) => Record",
    required: false,
    defaultValue: "defaultHistorianMapper",
    description: "Normalizes tag arrays into cells or series for templates.",
  },
];

export const MQTT_FIELD_ROWS: AdapterFieldRow[] = [
  {
    field: "type",
    type: `"mqtt"`,
    required: true,
    description: "Discriminator for the MQTT subscriber adapter.",
  },
  {
    field: "url",
    type: "string",
    required: true,
    description: "Broker URL (mqtt:// or mqtts://).",
  },
  {
    field: "topic",
    type: "string",
    required: true,
    description: "Topic subscribed after the client connects.",
  },
  {
    field: "staleAfterMs",
    type: "number",
    required: false,
    description: "Stale overlay when messages stop arriving.",
  },
  {
    field: "reconnectDelayMs",
    type: "number",
    required: false,
    description: "Reconnect delay after disconnect when set.",
  },
  {
    field: "clientId",
    type: "string",
    required: false,
    description: "Optional MQTT client id passed to connect().",
  },
  {
    field: "connect",
    type: "MqttConnectFn",
    required: true,
    description: "Inject at runtime (mqtt.js). Omitted from portable JSON fixtures.",
  },
  {
    field: "parsePayload",
    type: "(raw) => Record",
    required: false,
    defaultValue: "JSON.parse when string",
    description: "Maps each message payload into template data merged with prior frames.",
  },
];

export const REST_OPS_PAYLOAD = `{
  "categories": ["08:00", "09:00", "10:00", "11:00"],
  "cells": [
    { "title": "CPU", "data": [22, 28, 31, 34], "suffix": "%" },
    { "title": "Memory", "data": [55, 58, 60, 59], "suffix": "%" },
    { "title": "Errors", "data": [1, 2, 5, 3], "suffix": "/min", "tone": "warning" },
    { "title": "p95", "data": [42, 38, 55, 49], "suffix": "ms" }
  ],
  "alarms": [
    { "id": "cpu", "message": "CPU above warn threshold", "severity": "warning" }
  ]
}`;

export const WEBSOCKET_TELEMETRY_FRAME = `{
  "cells": [
    { "title": "Throughput", "data": [980, 1020, 1100] }
  ],
  "alarms": [
    { "id": "line-stop", "message": "Line stopped", "severity": "alarm" }
  ]
}`;

export const HISTORIAN_TAG_PAYLOAD = `{
  "tags": [
    {
      "name": "throughput",
      "timestamps": ["08:00", "09:00", "10:00", "11:00"],
      "values": [980, 1020, 1100, 1180],
      "suffix": " u/hr"
    },
    {
      "name": "reject-rate",
      "timestamps": ["08:00", "09:00", "10:00", "11:00"],
      "values": [1.2, 1.4, 1.1, 0.9],
      "suffix": "%",
      "tone": "warning"
    }
  ]
}`;

export const BUILD_HISTORIAN_URL = `import { buildHistorianUrl } from "@axicharts/charts-runtime";

const url = buildHistorianUrl({
  url: "/api/historian/tags",
  tags: ["throughput", "reject-rate"],
  windowMs: 3_600_000,
});
// => /api/historian/tags?from=...&to=...&tags=throughput,reject-rate`;

export const MQTT_PORTABLE_SPEC = `{
  "layout": "embed",
  "dashboard": {
    "template": "ops-2x2",
    "mode": "live",
    "dataSource": {
      "type": "mqtt",
      "url": "mqtt://broker.example.com",
      "topic": "plant/line3/metrics",
      "staleAfterMs": 10000,
      "reconnectDelayMs": 3000
    }
  }
}`;

export const MQTT_SPARKPLUG_PAYLOAD = `{
  "categories": ["08:00", "09:00", "10:00"],
  "cells": [
    { "title": "CPU", "data": [24, 27, 29], "suffix": "%" },
    { "title": "Memory", "data": [58, 59, 61], "suffix": "%" }
  ],
  "alarms": [
    { "id": "reject-high", "message": "Reject rate elevated", "severity": "warning" }
  ]
}`;

export const REST_EMBED_SPEC = `{
  "layout": "embed",
  "dashboard": {
    "template": "ops-2x2",
    "mode": "live",
    "dataSource": {
      "type": "rest",
      "url": "/api/line3/metrics",
      "intervalMs": 2000,
      "staleAfterMs": 5000
    }
  }
}`;

export const WEBSOCKET_MOSAIC_SPEC = `{
  "layout": "mosaic",
  "wall": {
    "columns": 2,
    "dataSources": [
      {
        "id": "telemetry",
        "type": "websocket",
        "url": "wss://ops.example.com/ws/line3",
        "reconnectDelayMs": 3000,
        "staleAfterMs": 8000
      }
    ],
    "cells": [
      { "id": "ops", "template": "ops-2x2", "dataSourceId": "telemetry" }
    ]
  }
}`;

export const HISTORIAN_SPEC = `{
  "layout": "embed",
  "dashboard": {
    "template": "line-overview",
    "mode": "live",
    "dataSource": {
      "type": "historian",
      "url": "/api/historian/tags",
      "tags": ["throughput", "reject-rate"],
      "windowMs": 3600000,
      "intervalMs": 5000
    }
  }
}`;

export const MQTT_SPEC = `import mqtt from "mqtt";
import { RuntimeDashboard } from "@axicharts/charts-runtime";

<RuntimeDashboard
  spec={{
    layout: "embed",
    dashboard: {
      template: "ops-2x2",
      mode: "live",
      dataSource: {
        type: "mqtt",
        url: "mqtt://broker.example.com",
        topic: "plant/line3/metrics",
        connect: (url, options) => mqtt.connect(url, options),
        parsePayload: (raw) => JSON.parse(String(raw)),
      },
    },
  }}
/>`;

export const CUSTOM_MAP_RESPONSE = `import { defaultRestMapper } from "@axicharts/charts-runtime";

const dataSource = {
  type: "rest" as const,
  url: "/api/metrics",
  intervalMs: 2000,
  mapResponse: (payload: unknown) => {
    const base = defaultRestMapper(payload);
    return {
      ...base,
      cells: (base.cells as Array<{ title: string; data: number[] }>).map((cell) => ({
        ...cell,
        suffix: cell.suffix ?? "%",
      })),
    };
  },
};`;

export const WEBSOCKET_PARSE_MESSAGE = `const dataSource = {
  type: "websocket" as const,
  url: "wss://ops.example.com/ws/tags",
  parseMessage: (payload: unknown) => {
    if (typeof payload !== "object" || payload === null) return {};
    const row = payload as { tag?: string; value?: number };
    if (!row.tag || row.value == null) return {};
    return {
      cells: [{ title: row.tag, data: [row.value] }],
    };
  },
};`;
