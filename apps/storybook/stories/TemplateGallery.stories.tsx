import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  compileTemplate,
  listTemplateMeta,
  registerDashboardTemplate,
} from "@axicharts/charts-spec";
import { registerBuiltinChartTypes } from "@axicharts/charts/registry";
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

    return <TemplateGallery />;
  },
};
