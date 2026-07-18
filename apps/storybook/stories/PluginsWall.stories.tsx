import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Stat } from "@axicharts/charts";
import { compileTemplate } from "@axicharts/charts-spec";
import "@axicharts/charts-andon/register";
import "@axicharts/charts-geo/register";
import "@axicharts/charts-sankey/register";
import "@axicharts/charts-tank/register";

const PLUGIN_CHIPS = ["tank", "geo", "andon", "sankey"] as const;

function KpiTile({ children }: { children: ReactElement }): ReactElement {
  return (
    <div
      style={{
        background: "#111827",
        border: "1px solid #334155",
        borderRadius: 8,
        padding: "10px 12px",
      }}
    >
      {children}
    </div>
  );
}

function PluginChip({ name }: { name: string }): ReactElement {
  return (
    <span
      style={{
        fontSize: 10,
        padding: "2px 8px",
        borderRadius: 999,
        background: "#1e293b",
        color: "#94a3b8",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
      }}
    >
      {name}
    </span>
  );
}

function PluginsWallMockup(): ReactElement {
  return (
    <div
      style={{
        maxWidth: 960,
        border: "1px solid #1e293b",
        borderRadius: 10,
        background: "#0b1220",
        boxShadow: "0 12px 32px rgba(2, 6, 23, 0.45)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 16px",
          borderBottom: "1px solid #334155",
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>
          Community plugins
        </span>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {PLUGIN_CHIPS.map((name) => (
            <PluginChip key={name} name={name} />
          ))}
        </div>
        <span style={{ flex: 1 }} />
        <span
          style={{
            fontSize: 10,
            padding: "2px 8px",
            borderRadius: 999,
            background: "#1e3a5f",
            color: "#93c5fd",
          }}
        >
          compilePanel
        </span>
        <span
          style={{
            fontSize: 11,
            color: "#94a3b8",
            background: "#111827",
            borderRadius: 999,
            padding: "3px 8px",
          }}
        >
          registerChartType
        </span>
      </div>

      <div style={{ padding: 16 }}>
        <div
          style={{
            marginBottom: 12,
            fontSize: 11,
            color: "#fecaca",
            background: "rgba(127, 29, 29, 0.25)",
            border: "1px solid #7f1d1d",
            borderRadius: 8,
            padding: "8px 10px",
          }}
        >
          Andon fault — Inspector station reject rate high · Filler hopper low (warn)
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 10,
            marginBottom: 14,
          }}
        >
          <KpiTile>
            <Stat value="4" label="Plugin panels" surface="dark" monospace />
          </KpiTile>
          <KpiTile>
            <Stat value="68%" label="Tank level" tone="warning" surface="dark" monospace />
          </KpiTile>
          <KpiTile>
            <Stat value="91%" label="NE load peak" tone="warning" surface="dark" monospace />
          </KpiTile>
        </div>

        {compileTemplate("plugins-wall", {}, { theme: "industrial", mode: "interactive" })}

        <p style={{ marginTop: 10, fontSize: 11, color: "#64748b" }}>
          plugins-wall template · tank, geo, andon, sankey via registry · panel
          titles from spec
        </p>
      </div>
    </div>
  );
}

const meta = {
  title: "Mockups/P · Plugins Wall",
  component: PluginsWallMockup,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Round 3 acceptance target (5/5) — plugin registry chips, fault callout, KPI strip, plugins-wall template mosaic with compilePanel + registerChartType.",
      },
    },
  },
} satisfies Meta<typeof PluginsWallMockup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CommunityWall: Story = {
  render: () => <PluginsWallMockup />,
};
