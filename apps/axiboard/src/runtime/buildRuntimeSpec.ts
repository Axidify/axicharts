import type { TemplateId } from "@axicharts/charts-spec";
import type {
  DataSourceSpec,
  MosaicWallSpec,
  MqttConnectFn,
  RuntimeDashboardSpec,
} from "@axicharts/charts-runtime";
import {
  buildMosaicPreset,
  type MosaicPresetId,
} from "@axicharts/charts-runtime/mosaic-presets";

export type { MosaicPresetId } from "@axicharts/charts-runtime/mosaic-presets";
export { listMosaicPresets } from "@axicharts/charts-runtime";

export const CATEGORIES = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00"];

export const DEFAULT_MOSAIC_PRESET: MosaicPresetId = "ops-finance";

export const FINANCE_DATA = {
  kpis: [
    { value: "$1.33M", label: "Net revenue" },
    { value: "62.4%", label: "Gross margin", tone: "success" },
    { value: "+18%", label: "QoQ growth" },
  ],
  waterfall: [
    { name: "Q1", value: 1100000, isTotal: true },
    { name: "New ARR", value: 240000 },
    { name: "Churn", value: -80000, tone: "critical" },
    { name: "Q2", value: 1330000, isTotal: true },
  ],
  categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  revenue: [820, 932, 901, 1034, 1290, 1330],
};

export const OPS_DATA = {
  categories: CATEGORIES,
  cells: [
    { title: "CPU", data: [22, 28, 31, 34, 30, 34, 32], suffix: "%" },
    { title: "Memory", data: [55, 58, 60, 59, 61, 62, 61], suffix: "%" },
    { title: "Errors", data: [1, 2, 5, 3, 2, 4, 3], suffix: "/min", tone: "warning" },
    { title: "p95", data: [42, 38, 55, 49, 62, 58, 71], suffix: "ms" },
  ],
};

export type LayoutMode = "embed" | "mosaic";
export type FeedMode = "static" | "historian" | "websocket" | "mqtt" | "rest" | "mock-live";
export type LiveFeedMode = Exclude<FeedMode, "static">;

const OPS_ALARMS = [
  { id: "cpu-high", message: "CPU above warn threshold", severity: "warning" as const },
];

export function isLiveFeed(feed: FeedMode): feed is LiveFeedMode {
  return feed !== "static";
}

export function feedSubtitle(feed: LiveFeedMode): string {
  switch (feed) {
    case "historian":
      return "Historian · 2s window";
    case "rest":
      return "REST · 2s poll";
    case "websocket":
      return "WebSocket · push";
    case "mqtt":
      return "MQTT · plant/line3/#";
    case "mock-live":
      return "Mock-live · synthetic drift";
  }
}

export function mutateHistorianTags(data: Record<string, unknown>): Record<string, unknown> {
  const tags =
    (data.tags as Array<{
      name: string;
      timestamps: string[];
      values: number[];
      suffix?: string;
      tone?: string;
    }>) ?? [];

  return {
    tags: tags.map((tag) => {
      const values = [...tag.values];
      const last = values[values.length - 1] ?? 0;
      values.push(Math.max(0, last + (Math.random() - 0.5) * 8));
      if (values.length > CATEGORIES.length) values.shift();
      return {
        ...tag,
        timestamps: CATEGORIES,
        values,
      };
    }),
  };
}

function mockHistorianPayload(): Record<string, unknown> {
  return mutateHistorianTags({
    tags: [
      { name: "CPU", timestamps: CATEGORIES, values: [22, 28, 31, 34, 30, 34, 32], suffix: "%" },
      { name: "Memory", timestamps: CATEGORIES, values: [55, 58, 60, 59, 61, 62, 61], suffix: "%" },
      {
        name: "Errors",
        timestamps: CATEGORIES,
        values: [1, 2, 5, 3, 2, 4, 3],
        suffix: "/min",
        tone: "warning",
      },
      { name: "p95", timestamps: CATEGORIES, values: [42, 38, 55, 49, 62, 58, 71], suffix: "ms" },
    ],
    alarms: OPS_ALARMS,
  });
}

function mockOpsPayload(tick = 0): Record<string, unknown> {
  const drift = tick % 4;
  return {
    categories: CATEGORIES,
    cells: OPS_DATA.cells.map((cell) => ({
      ...cell,
      data: cell.data.map((value) => value + drift),
    })),
    alarms: OPS_ALARMS,
  };
}

export function createHistorianSource() {
  return {
    type: "historian" as const,
    url: "/api/historian/tags",
    tags: ["cpu", "memory", "errors", "p95"],
    windowMs: 3_600_000,
    intervalMs: 2000,
    staleAfterMs: 5000,
    mapResponse: (payload: unknown) => {
      const record = payload as Record<string, unknown>;
      const tags = record.tags as Array<{
        name: string;
        timestamps: string[];
        values: number[];
        suffix?: string;
        tone?: string;
      }>;
      return {
        categories: tags[0]?.timestamps ?? CATEGORIES,
        cells: tags.map((tag) => ({
          title: tag.name,
          data: tag.values,
          suffix: tag.suffix,
          tone: tag.tone,
        })),
      };
    },
    fetch: async () =>
      ({
        ok: true,
        json: async () => mockHistorianPayload(),
      }) as Response,
  };
}

export function createRestSource() {
  let tick = 0;

  return {
    type: "rest" as const,
    url: "/api/metrics",
    intervalMs: 2000,
    staleAfterMs: 5000,
    mapResponse: (payload: unknown) => {
      const record = payload as Record<string, unknown>;
      return record.cells ? record : mockOpsPayload(tick);
    },
    fetch: async () => {
      tick += 1;
      return {
        ok: true,
        json: async () => mockOpsPayload(tick),
      } as Response;
    },
  };
}

function mockLiveMutate(data: Record<string, unknown>): Record<string, unknown> {
  const cells =
    (data.cells as Array<{
      title: string;
      data: number[];
      suffix?: string;
      tone?: string;
    }>) ?? [];

  return {
    ...data,
    categories: CATEGORIES,
    cells: cells.map((cell) => {
      const values = [...cell.data];
      const last = values[values.length - 1] ?? 0;
      values.push(Math.max(0, last + (Math.random() - 0.5) * 8));
      if (values.length > CATEGORIES.length) values.shift();
      return { ...cell, data: values };
    }),
    alarms: OPS_ALARMS,
  };
}

export function createMockLiveSource() {
  return {
    type: "mock-live" as const,
    intervalMs: 1000,
    staleAfterMs: 5000,
    data: {
      categories: CATEGORIES,
      cells: OPS_DATA.cells.map((cell) => ({ ...cell, data: [...cell.data] })),
      alarms: OPS_ALARMS,
    },
    mutate: mockLiveMutate,
  };
}

export function createWebSocketSource() {
  let tick = 0;

  class MockWebSocket {
    private listeners: Record<string, Array<(...args: unknown[]) => void>> = {};
    private timer: ReturnType<typeof setInterval> | undefined;

    constructor(_url: string) {
      queueMicrotask(() => {
        this.emit("open");
        this.push();
        this.timer = setInterval(() => this.push(), 2000);
      });
    }

    addEventListener(event: string, listener: (...args: unknown[]) => void) {
      this.listeners[event] = this.listeners[event] ?? [];
      this.listeners[event].push(listener);
    }

    close() {
      if (this.timer) clearInterval(this.timer);
      this.emit("close");
    }

    private emit(event: string, data?: unknown) {
      this.listeners[event]?.forEach((listener) => listener(data));
    }

    private push() {
      tick += 1;
      this.emit("message", { data: JSON.stringify(mockOpsPayload(tick)) });
    }
  }

  return {
    type: "websocket" as const,
    url: "wss://telemetry.test/line3",
    staleAfterMs: 5000,
    WebSocketImpl: MockWebSocket as unknown as typeof WebSocket,
  };
}

export function createMqttSource() {
  const connect: MqttConnectFn = () => {
    const handlers: Record<string, Array<(...args: unknown[]) => void>> = {};
    let tick = 0;
    let timer: ReturnType<typeof setInterval> | undefined;

    const client = {
      on(event: string, listener: (...args: unknown[]) => void) {
        handlers[event] = handlers[event] ?? [];
        handlers[event].push(listener);
        if (event === "connect") {
          queueMicrotask(() => listener());
        }
      },
      subscribe() {
        const push = () => {
          tick += 1;
          handlers.message?.forEach((listener) =>
            listener("plant/line3/metrics", JSON.stringify(mockOpsPayload(tick))),
          );
        };
        push();
        timer = setInterval(push, 2000);
      },
      end() {
        if (timer) clearInterval(timer);
        handlers.close?.forEach((listener) => listener());
      },
    };

    return client;
  };

  return {
    type: "mqtt" as const,
    url: "wss://broker.test/mqtt",
    topic: "plant/line3/#",
    staleAfterMs: 5000,
    connect,
  };
}

export function createLiveSource(feed: LiveFeedMode): DataSourceSpec {
  switch (feed) {
    case "historian":
      return createHistorianSource();
    case "rest":
      return createRestSource();
    case "websocket":
      return createWebSocketSource();
    case "mqtt":
      return createMqttSource();
    case "mock-live":
      return createMockLiveSource();
  }
}

function applyLiveFeedToMosaicWall(wall: MosaicWallSpec, feed: LiveFeedMode): MosaicWallSpec {
  const liveSource = createLiveSource(feed);
  const opsIndex = wall.dataSources?.findIndex((source) => source.id === "ops") ?? -1;

  if (opsIndex >= 0 && wall.dataSources) {
    const dataSources = [...wall.dataSources];
    dataSources[opsIndex] = { id: "ops", ...liveSource };
    return {
      ...wall,
      dataSources,
      mode: "live",
      subtitle: feedSubtitle(feed),
    };
  }

  return {
    ...wall,
    dataSource: liveSource,
    mode: "live",
    subtitle: feedSubtitle(feed),
  };
}

export function buildRuntimeSpec(options: {
  template: TemplateId;
  layout: LayoutMode;
  feed: FeedMode;
  presentation?: boolean;
  mosaicPreset?: MosaicPresetId;
}): RuntimeDashboardSpec {
  const {
    template,
    layout,
    feed,
    presentation = false,
    mosaicPreset = DEFAULT_MOSAIC_PRESET,
  } = options;
  const theme = presentation
    ? "presentation"
    : layout === "mosaic"
      ? "industrial"
      : template === "ops-2x2"
        ? "industrial"
        : "clean";
  const mode = presentation ? "presentation" : isLiveFeed(feed) ? "live" : "interactive";

  if (layout === "mosaic") {
    let wall = buildMosaicPreset(mosaicPreset, {
      theme: presentation ? "presentation" : undefined,
      mode,
    });

    if (isLiveFeed(feed)) {
      wall = applyLiveFeedToMosaicWall(wall, feed);
    } else {
      wall = {
        ...wall,
        subtitle: "Static snapshot",
      };
    }

    if (presentation) {
      wall = { ...wall, theme: "presentation", mode: "presentation" };
    }

    return { layout: "mosaic", wall };
  }

  const data =
    template === "finance-pnl"
      ? FINANCE_DATA
      : template === "ops-2x2" && feed === "static"
        ? OPS_DATA
        : undefined;

  return {
    layout: "embed",
    dashboard: {
      title: "Axiboard runtime",
      subtitle: isLiveFeed(feed) ? feedSubtitle(feed) : "Static feed",
      theme,
      mode,
      template,
      staleAfterMs: 5000,
      data: {
        ...(data ?? {}),
        alarms: OPS_ALARMS,
      },
      dataSource:
        isLiveFeed(feed) && template === "ops-2x2" ? createLiveSource(feed) : undefined,
    },
  };
}

const LIVE_SOURCE_TYPES = new Set(["historian", "rest", "websocket", "mqtt", "mock-live"]);

export function hydrateRuntimeSpec(
  spec: RuntimeDashboardSpec,
  feed: FeedMode,
  presentation = false,
): RuntimeDashboardSpec {
  if (presentation) return spec;

  if (spec.layout === "mosaic") {
    if (!isLiveFeed(feed)) return spec;
    return {
      ...spec,
      wall: applyLiveFeedToMosaicWall(spec.wall, feed),
    };
  }

  const sourceType = spec.dashboard.dataSource?.type;
  if (
    isLiveFeed(feed) &&
    spec.dashboard.template === "ops-2x2" &&
    sourceType &&
    LIVE_SOURCE_TYPES.has(sourceType)
  ) {
    return {
      ...spec,
      dashboard: {
        ...spec.dashboard,
        dataSource: createLiveSource(feed),
        mode: "live" as const,
        subtitle: feedSubtitle(feed),
      },
    };
  }

  return spec;
}

export function defaultSeedSpec(): RuntimeDashboardSpec {
  return buildRuntimeSpec({
    template: "ops-2x2",
    layout: "embed",
    feed: "historian",
  });
}
