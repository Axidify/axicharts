import type { ReactElement } from "react";
import { ChartContainer } from "@axicharts/charts";
import { AndonBoard, SAMPLE_ANDON_STATIONS } from "@axicharts/charts-andon";
import "@axicharts/charts-andon/register";
import { GeoMapChart, SAMPLE_GEO_REGIONS } from "@axicharts/charts-geo";
import "@axicharts/charts-geo/register";
import { SankeyChart, SAMPLE_SANKEY_FLOW } from "@axicharts/charts-sankey";
import "@axicharts/charts-sankey/register";
import { GanttChart, SAMPLE_GANTT_PROGRAM } from "@axicharts/charts-gantt";
import "@axicharts/charts-gantt/register";
import { TankChart } from "@axicharts/charts-tank";
import "@axicharts/charts-tank/register";
import { cleanTheme, industrialTheme } from "@axicharts/charts-theme";

const GANTT_CODE = `import "@axicharts/charts-gantt/register";
import { GanttChart, SAMPLE_GANTT_PROGRAM } from "@axicharts/charts-gantt";

<ChartContainer theme={cleanTheme} height={240} width="100%">
  <GanttChart {...SAMPLE_GANTT_PROGRAM} today={11} />
</ChartContainer>`;

const TANK_CODE = `import "@axicharts/charts-tank/register";
import { TankChart } from "@axicharts/charts-tank";

<ChartContainer theme={industrialTheme} height={200} width={140}>
  <TankChart level={68} label="Tank 4" warningAt={75} criticalAt={90} />
</ChartContainer>`;

const GEO_CODE = `import "@axicharts/charts-geo/register";
import { GeoMapChart, SAMPLE_GEO_REGIONS } from "@axicharts/charts-geo";

<ChartContainer theme={cleanTheme} height={200} width={320}>
  <GeoMapChart regions={SAMPLE_GEO_REGIONS} />
</ChartContainer>`;

const ANDON_CODE = `import "@axicharts/charts-andon/register";
import { AndonBoard, SAMPLE_ANDON_STATIONS } from "@axicharts/charts-andon";

<ChartContainer theme={industrialTheme} height={220} width={420}>
  <AndonBoard stations={SAMPLE_ANDON_STATIONS} columns={4} />
</ChartContainer>`;

const SANKEY_CODE = `import "@axicharts/charts-sankey/register";
import { SankeyChart, SAMPLE_SANKEY_FLOW } from "@axicharts/charts-sankey";

<ChartContainer theme={cleanTheme} height={260} width={480}>
  <SankeyChart {...SAMPLE_SANKEY_FLOW} />
</ChartContainer>`;

function PluginSection({
  title,
  subtitle,
  preview,
  code,
}: {
  title: string;
  subtitle: string;
  preview: ReactElement;
  code: string;
}): ReactElement {
  return (
    <section
      style={{
        marginTop: 28,
        border: "1px solid #e2e8f0",
        borderRadius: 10,
        background: "#ffffff",
        overflow: "hidden",
      }}
    >
      <div style={{ padding: "12px 16px", borderBottom: "1px solid #e2e8f0" }}>
        <strong>{title}</strong>
        <span style={{ marginLeft: 8, fontSize: 12, color: "#64748b" }}>{subtitle}</span>
      </div>
      <div style={{ padding: 16 }}>{preview}</div>
      <pre
        style={{
          margin: 0,
          padding: 16,
          background: "#f8fafc",
          fontSize: 11,
          overflow: "auto",
        }}
      >
        {code}
      </pre>
    </section>
  );
}

export function PluginsPage(): ReactElement {
  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Community plugins</h1>
      <p style={{ color: "#475569", maxWidth: 640 }}>
        Extend AxiCharts with <code>registerChartType</code> packages — exotic visualizations
        without bloating core.
      </p>
      <PluginSection
        title="@axicharts/charts-tank"
        subtitle="Vertical level visualization"
        preview={
          <div style={{ display: "flex", gap: 16, background: "#0f172a", padding: 16, borderRadius: 8 }}>
            <ChartContainer theme={industrialTheme} width={140} height={200}>
              <TankChart level={42} label="Tank 1" />
            </ChartContainer>
            <ChartContainer theme={industrialTheme} width={140} height={200}>
              <TankChart level={68} label="Tank 2" warningAt={75} />
            </ChartContainer>
            <ChartContainer theme={industrialTheme} width={140} height={200}>
              <TankChart level={91} label="Tank 3" warningAt={75} criticalAt={90} />
            </ChartContainer>
          </div>
        }
        code={TANK_CODE}
      />
      <PluginSection
        title="@axicharts/charts-geo"
        subtitle="Regional cartogram — hover highlight + value scale"
        preview={
          <ChartContainer theme={cleanTheme} width={320} height={200}>
            <GeoMapChart regions={SAMPLE_GEO_REGIONS} />
          </ChartContainer>
        }
        code={GEO_CODE}
      />
      <PluginSection
        title="@axicharts/charts-andon"
        subtitle="Production line andon board"
        preview={
          <ChartContainer theme={industrialTheme} width={420} height={220}>
            <AndonBoard stations={SAMPLE_ANDON_STATIONS} columns={4} />
          </ChartContainer>
        }
        code={ANDON_CODE}
      />
      <PluginSection
        title="@axicharts/charts-sankey"
        subtitle="Energy / cost flow — theme-aware ECharts palette"
        preview={
          <ChartContainer theme={cleanTheme} width={480} height={260}>
            <SankeyChart {...SAMPLE_SANKEY_FLOW} />
          </ChartContainer>
        }
        code={SANKEY_CODE}
      />
      <PluginSection
        title="@axicharts/charts-gantt"
        subtitle="Program timeline — milestones, today marker, hover"
        preview={
          <div style={{ display: "grid", gap: 16 }}>
            <ChartContainer theme={cleanTheme} width={520} height={240}>
              <GanttChart {...SAMPLE_GANTT_PROGRAM} today={11} />
            </ChartContainer>
            <ChartContainer theme={industrialTheme} width={520} height={240}>
              <GanttChart {...SAMPLE_GANTT_PROGRAM} today={11} />
            </ChartContainer>
          </div>
        }
        code={GANTT_CODE}
      />
    </div>
  );
}
