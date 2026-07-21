import { describe, expect, it } from "vitest";
import { ejectPanel } from "./eject";

describe("ejectPanel", () => {
  it("emits Layer 1 JSX for a line panel", () => {
    const jsx = ejectPanel(
      {
        type: "line",
        encoding: {
          x: { field: "date" },
          y: { field: "revenue" },
        },
        theme: "clean",
        height: 240,
        fill: true,
        valueSuffix: " USD",
      },
      "rows",
    );

    expect(jsx).toContain('import { ChartContainer, LineChart }');
    expect(jsx).toContain("cleanTheme");
    expect(jsx).toContain("rows.map((row) => String(row.date))");
    expect(jsx).toContain("fill");
    expect(jsx).toContain('valueSuffix=" USD"');
  });

  it("emits stat without ChartContainer", () => {
    const jsx = ejectPanel({
      type: "stat",
      title: "CPU",
      props: { value: "42%", label: "CPU", tone: "warning" },
    });

    expect(jsx).toContain("<Stat");
    expect(jsx).not.toContain("ChartContainer");
  });

  it("emits stacked flag on cartesian panels", () => {
    const jsx = ejectPanel({
      type: "bar",
      stacked: true,
      encoding: {
        x: { field: "quarter" },
        y: { field: "revenue" },
      },
    });

    expect(jsx).toContain("stacked");
  });

  it("emits innerRadius for donut panels", () => {
    const jsx = ejectPanel({
      type: "donut",
      encoding: {
        name: { field: "segment" },
        value: { field: "amount" },
      },
    });

    expect(jsx).toContain("innerRadius={42}");
  });

  it("emits table without ChartContainer", () => {
    const jsx = ejectPanel({
      type: "table",
      props: {
        columns: [{ key: "symbol", label: "Symbol" }],
        rows: [{ symbol: "AAPL" }],
        compact: true,
      },
    });

    expect(jsx).toContain("<DataTable");
    expect(jsx).toContain("compact={true}");
    expect(jsx).not.toContain("ChartContainer");
  });

  it("emits markdown without ChartContainer", () => {
    const jsx = ejectPanel({
      type: "markdown",
      title: "Shift notes",
      props: {
        content: "# Handoff\n\nLine 3 is stable.",
      },
    });

    expect(jsx).toContain("<MarkdownPanel");
    expect(jsx).toContain('content={"# Handoff');
    expect(jsx).toContain('title={"Shift notes"}');
    expect(jsx).not.toContain("ChartContainer");
  });

  it("emits createTheme when props.style overrides are present", () => {
    const jsx = ejectPanel({
      type: "bar",
      theme: "clean",
      encoding: {
        x: { field: "week" },
        y: { field: "throughput" },
      },
      props: {
        style: {
          bar: { radius: 10 },
          grid: { opacity: 0.35 },
        },
      },
    });

    expect(jsx).toContain("createTheme");
    expect(jsx).toContain('"radius":10');
    expect(jsx).not.toContain("style=");
  });

  it("emits Cell fills for encoding.color on bar panels", () => {
    const jsx = ejectPanel({
      type: "bar",
      theme: "clean",
      encoding: {
        x: { field: "week" },
        y: { field: "throughput" },
        color: { field: "aboveTarget", type: "semantic" },
      },
      props: { showValues: true },
    });

    expect(jsx).toContain("resolveColorFill");
    expect(jsx).toContain("<Cell");
    expect(jsx).toContain("row.aboveTarget");
    expect(jsx).toContain("<Bar dataKey=\"throughput\">");
    expect(jsx).not.toContain("encoding.color");
  });

  it("emits bubble size encoding for scatter panels", () => {
    const jsx = ejectPanel({
      type: "scatter",
      encoding: {
        x: { field: "risk" },
        y: { field: "returnPct" },
        size: { field: "marketCap", range: [8, 24] },
      },
      props: {
        xLabel: "Risk",
        yLabel: "Return %",
        showPointLabels: true,
      },
    });

    expect(jsx).toContain("resolveSizeMark");
    expect(jsx).toContain("size: resolveSizeMark");
    expect(jsx).toContain("showSizeLegend");
    expect(jsx).toContain('xLabel={"Risk"}');
  });

  it("emits Cell size for encoding.size on line panels", () => {
    const jsx = ejectPanel({
      type: "line",
      encoding: {
        x: { field: "week" },
        y: { field: "latency" },
        size: { field: "weight", range: [4, 12] },
      },
    });

    expect(jsx).toContain("resolveSizeMark");
    expect(jsx).toContain("radius={resolveSizeMark");
    expect(jsx).toContain("<Cell");
    expect(jsx).not.toContain("encoding.size");
  });

  it("emits line curve type from props.style.line.curve", () => {
    const jsx = ejectPanel({
      type: "line",
      encoding: {
        x: { field: "week" },
        y: { field: "latency" },
      },
      props: {
        style: { line: { curve: "monotone" } },
      },
    });

    expect(jsx).toContain('curve="monotone"');
  });

  it("emits chrome variants on ChartContainer", () => {
    const jsx = ejectPanel({
      type: "line",
      encoding: {
        x: { field: "week" },
        y: { field: "revenue" },
      },
      props: {
        legendVariant: "inline",
        tooltipVariant: "dense",
      },
    });

    expect(jsx).toContain('legendVariant="inline"');
    expect(jsx).toContain('tooltipVariant="dense"');
  });

  it("emits ComboChart with dualAxis and mixed series kinds", () => {
    const jsx = ejectPanel(
      {
        type: "combo",
        encoding: {
          x: { field: "week" },
          y: [
            { field: "volume", label: "Volume", kind: "bar" },
            { field: "avg", label: "Daily avg", kind: "line" },
          ],
        },
        props: { dualAxis: "auto", showValues: true },
      },
      "rows",
    );

    expect(jsx).toContain("ComboChart");
    expect(jsx).toContain('kind: "bar"');
    expect(jsx).toContain('kind: "line"');
    expect(jsx).toContain('dualAxis="auto"');
    expect(jsx).toContain("showValues");
    expect(jsx).toContain("row.volume");
    expect(jsx).toContain("row.avg");
  });

  it("emits EChartsOptionChart for raw option panels", () => {
    const jsx = ejectPanel(
      {
        type: "echarts",
        props: {
          option: {
            series: [{ type: "bar", data: [4, 8, 2] }],
          },
        },
      },
      "panelData",
    );

    expect(jsx).toContain("EChartsOptionChart");
    expect(jsx).toContain("panelData.option");
    expect(jsx).toContain('"type":"bar"');
  });

  it("emits SankeyChart from plugin package", () => {
    const jsx = ejectPanel(
      {
        type: "sankey",
        props: {
          nodes: [{ name: "Solar" }, { name: "Grid" }],
          links: [{ source: "Solar", target: "Grid", value: 12 }],
        },
      },
      "flow",
    );

    expect(jsx).toContain('import { SankeyChart } from "@axicharts/charts-sankey"');
    expect(jsx).toContain("<SankeyChart");
    expect(jsx).toContain("flow.nodes");
  });

  it("emits GeoMapChart from plugin package", () => {
    const jsx = ejectPanel({
      type: "geo",
      props: {
        regions: [{ id: "west", label: "West", value: 72, x: 8, y: 28, width: 72, height: 54 }],
        showScale: true,
      },
    });

    expect(jsx).toContain('import { GeoMapChart } from "@axicharts/charts-geo"');
    expect(jsx).toContain("<GeoMapChart");
    expect(jsx).toContain("West");
  });

  it("emits MapChart from plugin package", () => {
    const jsx = ejectPanel({
      type: "map",
      props: {
        topology: { type: "Topology", objects: {}, arcs: [] },
        values: { CA: 82 },
        showScale: true,
      },
    });

    expect(jsx).toContain('import { MapChart } from "@axicharts/charts-map"');
    expect(jsx).toContain("<MapChart");
    expect(jsx).toContain("CA");
  });

  it("emits map drilldown props from spec", () => {
    const jsx = ejectPanel({
      type: "map",
      props: {
        topology: { type: "Topology", objects: {}, arcs: [] },
        values: { west: 65 },
        drilldown: true,
        hierarchy: {
          levels: [{ objectKey: "regions" }, { objectKey: "states", parentIdKey: "region" }],
        },
        drillPath: ["west"],
        drillLabels: ["West"],
      },
    });

    expect(jsx).toContain("drilldown");
    expect(jsx).toContain("hierarchy=");
    expect(jsx).toContain('drillPath={["west"]}');
    expect(jsx).toContain('drillLabels={["West"]}');
  });

  it("emits GanttChart from plugin package", () => {
    const jsx = ejectPanel(
      {
        type: "gantt",
        props: {
          tasks: [{ name: "Build", start: 7, end: 16, progress: 0.55 }],
          today: 11,
        },
      },
      "timeline",
    );

    expect(jsx).toContain('import { GanttChart } from "@axicharts/charts-gantt"');
    expect(jsx).toContain("<GanttChart");
    expect(jsx).toContain("timeline.tasks");
  });

  it("emits heatmap matrix from encoding rows", () => {
    const jsx = ejectPanel(
      {
        type: "heatmap",
        encoding: {
          x: { field: "hour" },
          y: { field: "symbol" },
          value: { field: "corr" },
        },
      },
      "rows",
    );

    expect(jsx).toContain("<HeatmapChart");
    expect(jsx).toContain("xCategories");
    expect(jsx).toContain("showLabels");
  });

  it("emits CalendarHeatmapChart from encoding rows", () => {
    const jsx = ejectPanel(
      {
        type: "calendar",
        encoding: {
          date: { field: "date" },
          value: { field: "count" },
        },
      },
      "activity",
    );

    expect(jsx).toContain("<CalendarHeatmapChart");
    expect(jsx).toContain("points:");
    expect(jsx).toContain("row.date");
    expect(jsx).toContain("row.count");
  });

  it("emits RadarChart from encoding rows", () => {
    const jsx = ejectPanel(
      {
        type: "radar",
        encoding: {
          name: { field: "axis" },
          value: { field: "score" },
          series: { field: "team" },
        },
      },
      "scores",
    );

    expect(jsx).toContain("<RadarChart");
    expect(jsx).toContain("indicators=");
    expect(jsx).toContain("series=");
  });

  it("emits ParallelChart from encoding rows", () => {
    const jsx = ejectPanel(
      {
        type: "parallel",
        props: {
          dimensions: [
            { name: "CPU", field: "cpu" },
            { name: "Memory", field: "memory" },
          ],
        },
        encoding: {
          name: { field: "host" },
        },
      },
      "hosts",
    );

    expect(jsx).toContain("<ParallelChart");
    expect(jsx).toContain("dimensions=");
    expect(jsx).toContain("series=");
  });

  it("emits ThemeRiverChart from encoding rows", () => {
    const jsx = ejectPanel(
      {
        type: "theme-river",
        encoding: {
          x: { field: "date", type: "temporal" },
          value: { field: "value" },
          series: { field: "stream" },
        },
      },
      "streams",
    );

    expect(jsx).toContain("<ThemeRiverChart");
    expect(jsx).toContain("points=");
  });

  it("emits WordCloudChart from encoding rows", () => {
    const jsx = ejectPanel(
      {
        type: "word-cloud",
        encoding: {
          name: { field: "tag" },
          value: { field: "count" },
        },
      },
      "tags",
    );

    expect(jsx).toContain("<WordCloudChart");
    expect(jsx).toContain("words=");
  });

  it("emits ChartNavigator with preset and minRangePercent props", () => {
    const jsx = ejectPanel(
      {
        type: "navigator",
        props: {
          navigator: {
            presets: ["1D", "1W", "1M", "ALL"],
            initialPreset: "1W",
            minRangePercent: 5,
          },
        },
        encoding: { x: { field: "day" }, y: { field: "value" } },
      },
      "rows",
    );

    expect(jsx).toContain("<ChartNavigator");
    expect(jsx).toContain('initialPreset={"1W"}');
    expect(jsx).toContain("minRangePercent={5}");
    expect(jsx).toContain('presets={["1D","1W","1M","ALL"]}');
  });

  it("emits mode=presentation on ChartContainer", () => {
    const jsx = ejectPanel({
      type: "bar",
      mode: "presentation",
      theme: "presentation",
      encoding: {
        x: { field: "quarter" },
        y: { field: "revenue" },
      },
    });

    expect(jsx).toContain('mode="presentation"');
    expect(jsx).toContain("presentationTheme");
  });

  it("emits composable distribution marks", () => {
    const jsx = ejectPanel(
      {
        type: "distribution",
        encoding: {
          angle: { field: "share" },
          color: { field: "browser" },
        },
        marks: [
          { type: "arc", field: "share" },
          { type: "donut", innerRadius: 42 },
          { type: "label", show: true },
        ],
        theme: "clean",
        height: 280,
      },
      "rows",
      { style: "composable" },
    );

    expect(jsx).toContain('@axicharts/charts/distribution');
    expect(jsx).toContain("<Pie ");
    expect(jsx).toContain('dataKey="share"');
    expect(jsx).toContain('nameKey="browser"');
    expect(jsx).toContain("innerRadius={42}");
  });
});
