import { useMemo, type ReactElement } from "react";
import { ChartContainer } from "@axicharts/charts";
import {
  GanttChart,
  SAMPLE_GANTT_PROGRAM,
} from "@axicharts/charts-gantt";
import "@axicharts/charts-gantt/register";
import {
  MapChart,
  SAMPLE_US_TOPOLOGY,
  SAMPLE_US_VALUES,
} from "@axicharts/charts-map";
import "@axicharts/charts-map/register";
import {
  SankeyChart,
  SAMPLE_SANKEY_FLOW,
} from "@axicharts/charts-sankey";
import "@axicharts/charts-sankey/register";
import { cleanTheme } from "@axicharts/charts-theme";

const PLUGIN_W = 280;
const PLUGIN_H = 140;

type PluginCase = {
  id: string;
  title: string;
  designId: string;
  chart: ReactElement;
};

function PluginRow({ item }: { item: PluginCase }): ReactElement {
  return (
    <section
      id={`lane-c-plugin-${item.id}`}
      style={{ paddingBottom: 20, borderBottom: "1px solid #e2e8f0" }}
    >
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: "#0f172a" }}>
        {item.title}
        <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 500, color: "#94a3b8" }}>
          {item.designId} · {PLUGIN_W}×{PLUGIN_H}
        </span>
      </div>
      <div
        style={{
          width: PLUGIN_W,
          height: PLUGIN_H,
          border: "1px solid #e2e8f0",
          borderRadius: 8,
          overflow: "hidden",
          background: "#ffffff",
        }}
      >
        {item.chart}
      </div>
    </section>
  );
}

function buildPluginCases(): PluginCase[] {
  return [
    {
      id: "map-choropleth",
      title: "Map — US choropleth",
      designId: "D-412",
      chart: (
        <ChartContainer theme={cleanTheme} width={PLUGIN_W} height={PLUGIN_H}>
          <MapChart topology={SAMPLE_US_TOPOLOGY} values={SAMPLE_US_VALUES} />
        </ChartContainer>
      ),
    },
    {
      id: "sankey-flow",
      title: "Sankey — energy allocation",
      designId: "D-412",
      chart: (
        <ChartContainer theme={cleanTheme} width={PLUGIN_W} height={PLUGIN_H}>
          <SankeyChart {...SAMPLE_SANKEY_FLOW} />
        </ChartContainer>
      ),
    },
    {
      id: "gantt-program",
      title: "Gantt — program timeline",
      designId: "D-412",
      chart: (
        <ChartContainer theme={cleanTheme} width={PLUGIN_W} height={PLUGIN_H}>
          <GanttChart {...SAMPLE_GANTT_PROGRAM} today={11} />
        </ChartContainer>
      ),
    },
  ];
}

export function LaneCPluginsCompare(): ReactElement {
  const cases = useMemo(() => buildPluginCases(), []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, marginTop: 32 }}>
      <div>
        <h2 style={{ margin: "0 0 8px", fontSize: 18, color: "#0f172a" }}>
          Lane C — community plugins @ catalog
        </h2>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: "#64748b" }}>
          Internal consistency @ <strong>{PLUGIN_W}×{PLUGIN_H}</strong> — no Recharts parity; typography
          and margins only. Map, Sankey, Gantt ship as optional `@axicharts/charts-*` plugins.
        </p>
      </div>
      {cases.map((item) => (
        <PluginRow key={item.id} item={item} />
      ))}
    </div>
  );
}
