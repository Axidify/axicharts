import type { TemplateId } from "@axicharts/charts-spec";
import type { RuntimeDashboardSpec } from "@axicharts/charts-runtime";

export const CATEGORIES = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00"];

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

export function buildRuntimeSpec(options: {
  template: TemplateId;
  layout: LayoutMode;
  feed: FeedMode;
}): RuntimeDashboardSpec {
  const { template, layout, feed } = options;
  const historianSource = createHistorianSource(feed);

  if (layout === "mosaic") {
    return {
      layout: "mosaic",
      wall: {
        title: "Packaging Line 3",
        subtitle: feed === "historian" ? "Historian · 2s window" : "Static snapshot",
        theme: "industrial",
        mode: feed === "historian" ? "live" : "interactive",
        columns: 2,
        staleAfterMs: 5000,
        dataSource: feed === "historian" ? historianSource : undefined,
        data: feed === "static" ? { ops: OPS_DATA, finance: FINANCE_DATA } : undefined,
        cells:
          feed === "historian"
            ? [
                { id: "ops", template: "ops-2x2", title: "Line 3" },
                {
                  id: "finance",
                  template: "finance-pnl",
                  title: "Shift P&L",
                  data: FINANCE_DATA,
                },
              ]
            : [
                { id: "ops", template: "ops-2x2", title: "Line 3", dataPath: "ops" },
                {
                  id: "finance",
                  template: "finance-pnl",
                  title: "Shift P&L",
                  dataPath: "finance",
                },
              ],
      },
    };
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
      theme: template === "ops-2x2" ? "industrial" : "clean",
      mode: feed === "historian" ? "live" : "interactive",
      template,
      staleAfterMs: 5000,
      data: {
        ...(data ?? {}),
        alarms: [{ id: "cpu-high", message: "CPU above warn threshold", severity: "warning" }],
      },
      dataSource:
        feed === "historian" && template === "ops-2x2" ? historianSource : undefined,
    },
  };
}

export function hydrateRuntimeSpec(
  spec: RuntimeDashboardSpec,
  feed: FeedMode,
): RuntimeDashboardSpec {
  const historianSource = createHistorianSource(feed);

  if (spec.layout === "mosaic") {
    if (feed !== "historian") return spec;
    return {
      ...spec,
      wall: {
        ...spec.wall,
        dataSource: historianSource,
        mode: "live" as const,
      },
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
