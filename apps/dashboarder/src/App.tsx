import { useEffect, useMemo, useState, type ReactElement } from "react";
import type { TemplateId } from "@axicharts/charts-spec";
import {
  RuntimeDashboard,
  TemplatePicker,
  parseRuntimeSpec,
  serializeRuntimeSpec,
  type RuntimeDashboardSpec,
} from "@axicharts/charts-runtime";

const STORAGE_KEY = "dashboarder.runtime.spec";

const CATEGORIES = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00"];

function mutateHistorianTags(data: Record<string, unknown>): Record<string, unknown> {
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

const FINANCE_DATA = {
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

const OPS_DATA = {
  categories: CATEGORIES,
  cells: [
    { title: "CPU", data: [22, 28, 31, 34, 30, 34, 32], suffix: "%" },
    { title: "Memory", data: [55, 58, 60, 59, 61, 62, 61], suffix: "%" },
    { title: "Errors", data: [1, 2, 5, 3, 2, 4, 3], suffix: "/min", tone: "warning" },
    { title: "p95", data: [42, 38, 55, 49, 62, 58, 71], suffix: "ms" },
  ],
};

type LayoutMode = "embed" | "mosaic";
type FeedMode = "static" | "historian";

const buttonStyle = {
  fontSize: 12,
  padding: "4px 10px",
  borderRadius: 6,
  border: "1px solid #475569",
  background: "#1e293b",
  color: "#e2e8f0",
  cursor: "pointer",
} as const;

export function App(): ReactElement {
  const [template, setTemplate] = useState<TemplateId>("ops-2x2");
  const [layout, setLayout] = useState<LayoutMode>("embed");
  const [feed, setFeed] = useState<FeedMode>("historian");
  const [importedSpec, setImportedSpec] = useState<RuntimeDashboardSpec | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
      setImportedSpec(parseRuntimeSpec(saved));
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const builtSpec = useMemo((): RuntimeDashboardSpec => {
    const historianSource = {
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
          json: async () =>
            feed === "static"
              ? { tags: [] }
              : mutateHistorianTags({
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
                }),
        }) as Response,
    };

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
  }, [feed, layout, template]);

  const activeSpec = importedSpec ?? builtSpec;

  const handleExport = (): void => {
    const portable = serializeRuntimeSpec(activeSpec);
    localStorage.setItem(STORAGE_KEY, portable);
    const blob = new Blob([portable], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "dashboard.runtime.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (): void => {
    const next = window.prompt("Paste runtime JSON");
    if (!next) return;
    const parsed = parseRuntimeSpec(next);
    setImportedSpec(parsed);
    localStorage.setItem(STORAGE_KEY, serializeRuntimeSpec(parsed));
  };

  const handleReset = (): void => {
    setImportedSpec(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", color: "#e2e8f0" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 24px",
          borderBottom: "1px solid #334155",
        }}
      >
        <div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Dashboarder</div>
          <div style={{ fontSize: 12, color: "#94a3b8" }}>C4 runtime shell · @axicharts/charts-runtime</div>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <label style={{ fontSize: 12, display: "inline-flex", gap: 8, alignItems: "center" }}>
            Layout
            <select
              value={layout}
              onChange={(event) => setLayout(event.target.value as LayoutMode)}
              style={{ fontSize: 12, padding: "4px 8px", borderRadius: 6 }}
            >
              <option value="embed">Single embed</option>
              <option value="mosaic">Mosaic wall</option>
            </select>
          </label>
          <label style={{ fontSize: 12, display: "inline-flex", gap: 8, alignItems: "center" }}>
            Feed
            <select
              value={feed}
              onChange={(event) => setFeed(event.target.value as FeedMode)}
              style={{ fontSize: 12, padding: "4px 8px", borderRadius: 6 }}
            >
              <option value="historian">Historian (mock)</option>
              <option value="static">Static</option>
            </select>
          </label>
          {layout === "embed" ? (
            <TemplatePicker value={template} onChange={setTemplate} label="Template" />
          ) : null}
          <button type="button" onClick={handleExport} style={buttonStyle}>
            Export
          </button>
          <button type="button" onClick={handleImport} style={buttonStyle}>
            Import
          </button>
          {importedSpec ? (
            <button type="button" onClick={handleReset} style={buttonStyle}>
              Reset
            </button>
          ) : null}
        </div>
      </header>
      <main style={{ padding: 24, maxWidth: 1080, margin: "0 auto" }}>
        <RuntimeDashboard spec={activeSpec} />
      </main>
    </div>
  );
}
