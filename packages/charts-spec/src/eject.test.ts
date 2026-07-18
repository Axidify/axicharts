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
});
