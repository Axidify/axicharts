import type { ReactElement } from "react";
import { ChartContainer } from "@axicharts/charts";
import { AndonBoard, SAMPLE_ANDON_STATIONS } from "@axicharts/charts-andon";
import { GeoMapChart, SAMPLE_GEO_REGIONS } from "@axicharts/charts-geo";
import { SankeyChart, SAMPLE_SANKEY_FLOW } from "@axicharts/charts-sankey";
import { TankChart } from "@axicharts/charts-tank";
import { cleanTheme, industrialTheme } from "@axicharts/charts-theme";

export function PluginStrip(): ReactElement {
  return (
    <section style={{ marginTop: 32 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 12,
        }}
      >
        <strong style={{ fontSize: 14 }}>Community plugins</strong>
        <span style={{ fontSize: 12, color: "#94a3b8" }}>
          registerChartType · charts-spec compiler
        </span>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 12,
          alignItems: "end",
        }}
      >
        <ChartContainer theme={industrialTheme} width={140} height={200}>
          <TankChart level={68} label="Tank 2" warningAt={75} />
        </ChartContainer>
        <ChartContainer theme={cleanTheme} width={200} height={160}>
          <GeoMapChart regions={SAMPLE_GEO_REGIONS} width={200} height={160} />
        </ChartContainer>
        <ChartContainer theme={industrialTheme} width={280} height={180}>
          <AndonBoard stations={SAMPLE_ANDON_STATIONS.slice(0, 4)} columns={2} width={280} height={180} />
        </ChartContainer>
        <ChartContainer theme={cleanTheme} width={280} height={180}>
          <SankeyChart {...SAMPLE_SANKEY_FLOW} width={280} height={180} />
        </ChartContainer>
      </div>
    </section>
  );
}
