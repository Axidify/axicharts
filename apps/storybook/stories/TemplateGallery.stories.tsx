import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  compileTemplate,
  isRegisteredTemplate,
  listTemplateMeta,
  registerDashboardTemplate,
} from "@axicharts/charts-spec";
import { registerBuiltinChartTypes } from "@axicharts/charts/registry";
import "@axicharts/charts-andon/register";
import "@axicharts/charts-tank/register";

registerBuiltinChartTypes();

const GALLERY_FIXTURES: Record<string, Record<string, unknown>> = {
  "finance-pnl": {
    kpis: [
      { value: "$1.33M", label: "Net revenue" },
      { value: "62.4%", label: "Gross margin", tone: "success" },
    ],
    waterfall: [
      { name: "Q1", value: 1100000, isTotal: true },
      { name: "New ARR", value: 240000 },
      { name: "Churn", value: -80000, tone: "critical" },
      { name: "Q2", value: 1330000, isTotal: true },
    ],
    categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    revenue: [820, 932, 901, 1034, 1290, 1330],
  },
  "capacity-grid": {
    kpis: [
      { value: "78%", label: "CPU pool", tone: "warning" },
      { value: "64%", label: "Memory", tone: "success" },
      { value: "12", label: "Pending jobs" },
    ],
    gauges: [
      { value: 78, label: "Compute", warningAt: 70, criticalAt: 90 },
      { value: 64, label: "Storage", warningAt: 75, criticalAt: 92 },
      { value: 41, label: "Network", warningAt: 80, criticalAt: 95 },
    ],
    slices: [
      { name: "On-demand", value: 52 },
      { name: "Reserved", value: 31 },
      { name: "Spot", value: 17 },
    ],
    bar: {
      categories: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      values: [72, 78, 81, 76, 79],
    },
  },
  "line-overview": {
    kpis: [
      { value: "12.4k", label: "Active users" },
      { value: "+8.2%", label: "WoW growth", tone: "success" },
    ],
    categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    series: [{ name: "Signups", data: [820, 932, 901, 1034, 1290, 1330, 1320] }],
    weekly: { categories: ["W1", "W2", "W3", "W4"], values: [4200, 4800, 5100, 5400] },
  },
  "ops-2x2": {
    categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    cells: [
      { title: "CPU", data: [22, 28, 31, 34, 30, 34, 32], suffix: "%" },
      { title: "Memory", data: [55, 58, 60, 59, 61, 62, 61], suffix: "%" },
      { title: "Errors", data: [1, 2, 5, 3, 2, 4, 3], suffix: "/min", tone: "warning" },
      { title: "p95", data: [42, 38, 55, 49, 62, 58, 71], suffix: "ms" },
    ],
  },
  "trading-blotter": {
    kpis: [
      { value: "$184.00", label: "Last" },
      { value: "+1.2%", label: "Day", tone: "success" },
      { value: "48", label: "RSI" },
      { value: "1.3M", label: "Volume" },
    ],
    categories: ["09:30", "10:00", "10:30", "11:00", "11:30", "12:00"],
    ohlc: [
      { open: 182.4, high: 183.2, low: 181.9, close: 182.8 },
      { open: 182.8, high: 184.1, low: 182.5, close: 183.6 },
      { open: 183.6, high: 183.9, low: 182.1, close: 182.4 },
      { open: 182.4, high: 185.0, low: 182.2, close: 184.7 },
      { open: 184.7, high: 185.4, low: 184.0, close: 184.2 },
      { open: 184.2, high: 184.8, low: 183.5, close: 184.0 },
    ],
    volume: [1_200_000, 1_800_000, 1_100_000, 2_400_000, 1_600_000, 1_300_000],
    rsi: [38, 42, 35, 58, 52, 48],
    heatmap: {
      xCategories: ["Tech", "Energy", "Finance", "Health"],
      yCategories: ["Tech", "Energy", "Finance", "Health"],
      values: [
        [1.0, 0.42, 0.61, 0.38],
        [0.42, 1.0, 0.55, 0.29],
        [0.61, 0.55, 1.0, 0.47],
        [0.38, 0.29, 0.47, 1.0],
      ],
    },
  },
  "saas-growth": {
    weekly: { categories: ["W1", "W2", "W3", "W4"], values: [62000, 68000, 71000, 74000] },
  },
};

function TemplateGallery(): ReactElement {
  const entries = listTemplateMeta();

  return (
    <div style={{ display: "grid", gap: 24 }}>
      {entries.map((entry) => (
        <section
          key={entry.id}
          style={{
            border: "1px solid #e2e8f0",
            borderRadius: 12,
            padding: 16,
            background: "#f8fafc",
          }}
        >
          <header style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <strong>{entry.label}</strong>
              <code style={{ fontSize: 12 }}>{entry.id}</code>
              {entry.vertical ? (
                <span style={{ fontSize: 11, color: "#64748b" }}>{entry.vertical}</span>
              ) : null}
              <span
                style={{
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  color: entry.source === "community" ? "#7c3aed" : "#0f766e",
                }}
              >
                {entry.source}
              </span>
            </div>
          </header>
          {compileTemplate(entry.id, GALLERY_FIXTURES[entry.id] ?? {}, {
            theme: entry.id === "trading-blotter" || entry.id === "sre-incident" ? "live" : "clean",
            mode: entry.id === "ops-2x2" ? "live" : "interactive",
          })}
        </section>
      ))}
    </div>
  );
}

const meta = {
  title: "Spec/Template gallery",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "C91 — all builtin and community dashboard templates via `listTemplateMeta` + `compileTemplate`. Community slot: `registerDashboardTemplate`.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllTemplates: Story = {
  render: () => <TemplateGallery />,
};

export const CommunitySlot: Story = {
  render: () => {
    if (!isRegisteredTemplate("gallery-demo")) {
      registerDashboardTemplate({
        id: "gallery-demo",
        label: "Gallery demo (community)",
        vertical: "custom",
        render: () => (
          <div
            style={{
              padding: 16,
              borderRadius: 8,
              border: "1px dashed #7c3aed",
              background: "#faf5ff",
              color: "#5b21b6",
              maxWidth: 420,
            }}
          >
            Community template registered at runtime — no charts-spec fork required.
          </div>
        ),
      });
    }

    return <TemplateGallery />;
  },
};
