import type { TemplateId } from "@axicharts/charts-spec";
import type { MosaicWallSpec, RuntimeDashboardSpec } from "@axicharts/charts-runtime";
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
export type FeedMode = "static" | "historian";

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
    alarms: [{ id: "cpu-high", message: "CPU above warn threshold", severity: "warning" }],
  });
}

export function createHistorianSource(feed: FeedMode) {
  return {
    type: "historian" as const,
    url: "/api/historian/tags",
    tags: ["cpu", "memory", "errors", "p95"],
    windowMs: 3_600_000,
    intervalMs: 2000,
    mapResponse: (payload: unknown) => {
      if (feed === "static") {
        return OPS_DATA;
      }
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
        json: async () => (feed === "static" ? { tags: [] } : mockHistorianPayload()),
      }) as Response,
  };
}

function applyHistorianToMosaicWall(
  wall: MosaicWallSpec,
  feed: FeedMode,
): MosaicWallSpec {
  const historianSource = createHistorianSource(feed);
  const opsIndex = wall.dataSources?.findIndex((source) => source.id === "ops") ?? -1;

  if (opsIndex >= 0 && wall.dataSources) {
    const dataSources = [...wall.dataSources];
    dataSources[opsIndex] = { id: "ops", ...historianSource };
    return {
      ...wall,
      dataSources,
      mode: "live",
      subtitle: "Historian · 2s window",
    };
  }

  return {
    ...wall,
    dataSource: historianSource,
    mode: "live",
    subtitle: "Historian · 2s window",
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
  const mode = presentation ? "presentation" : feed === "historian" ? "live" : "interactive";

  if (layout === "mosaic") {
    let wall = buildMosaicPreset(mosaicPreset, {
      theme: presentation ? "presentation" : undefined,
      mode,
    });

    if (feed === "historian") {
      wall = applyHistorianToMosaicWall(wall, feed);
    } else if (feed === "static") {
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
      title: "Dashboarder runtime",
      subtitle: feed === "historian" ? "Historian feed" : "Static feed",
      theme,
      mode,
      template,
      staleAfterMs: 5000,
      data: {
        ...(data ?? {}),
        alarms: [{ id: "cpu-high", message: "CPU above warn threshold", severity: "warning" }],
      },
      dataSource:
        feed === "historian" && template === "ops-2x2" ? createHistorianSource(feed) : undefined,
    },
  };
}

export function hydrateRuntimeSpec(
  spec: RuntimeDashboardSpec,
  feed: FeedMode,
  presentation = false,
): RuntimeDashboardSpec {
  if (presentation) return spec;

  const historianSource = createHistorianSource(feed);

  if (spec.layout === "mosaic") {
    if (feed !== "historian") return spec;
    return {
      ...spec,
      wall: applyHistorianToMosaicWall(spec.wall, feed),
    };
  }

  if (
    feed === "historian" &&
    spec.dashboard.template === "ops-2x2" &&
    spec.dashboard.dataSource?.type === "historian"
  ) {
    return {
      ...spec,
      dashboard: {
        ...spec.dashboard,
        dataSource: historianSource,
        mode: "live" as const,
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
