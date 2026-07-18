import { describe, expect, it } from "vitest";
import { isValidElement, type ReactElement } from "react";
import { render, waitFor } from "@testing-library/react";
import { registerBuiltinChartTypes } from "@axicharts/charts/registry";
import { registerTankChart } from "@axicharts/charts-tank";
import { DEFAULT_PLUGINS_WALL_PANELS } from "./pluginsWallData";
import { compilePanel } from "./compilePanel";

describe("compilePanel registered types", () => {
  it("compiles community plugin panels via registerChartType", () => {
    registerBuiltinChartTypes();
    registerTankChart();

    const panel = compilePanel(
      {
        type: "tank",
        title: "Storage",
        props: { level: 72, label: "Tank 7", warningAt: 75 },
        theme: "industrial",
        height: 200,
        width: 140,
      },
      {},
    );

    const { container } = render(panel);
    expect(container.textContent).toContain("Storage");
    expect(container.textContent).toContain("Tank 7");
    expect(container.textContent).toContain("72%");
  });
});

describe("compilePanel community breadth", () => {
  it("compiles sankey panels without manual register import", async () => {
    const geoPanel = DEFAULT_PLUGINS_WALL_PANELS.find((panel) => panel.type === "geo")!;
    const sankeyPanel = DEFAULT_PLUGINS_WALL_PANELS.find((panel) => panel.type === "sankey")!;

    const geo = compilePanel(geoPanel, {});
    const sankey = compilePanel(sankeyPanel, {});

    const geoView = render(geo);
    await waitFor(() => {
      expect(geoView.container.textContent).toContain("West");
    });

    const sankeyView = render(sankey);
    await waitFor(() => {
      expect(
        sankeyView.container.querySelector('[aria-label="Sankey flow diagram"]'),
      ).toBeTruthy();
    });
  });

  it("compiles gantt panels from spec props", async () => {
    const panel = compilePanel(
      {
        type: "gantt",
        title: "Sprint timeline",
        height: 220,
        width: 480,
        props: {
          tasks: [
            { name: "Discovery", start: 0, end: 4, progress: 1, tone: "success" },
            { name: "Build", start: 7, end: 16, progress: 0.55, tone: "info" },
          ],
          milestones: [{ label: "Beta", at: 12, tone: "warning" }],
          today: 11,
        },
      },
      {},
    );

    const { container } = render(panel);
    expect(container.textContent).toContain("Sprint timeline");
    await waitFor(() => {
      expect(container.textContent).toContain("Build");
      expect(container.textContent).toContain("Beta");
    });
  });
});

describe("compilePanel donut", () => {
  it("compiles donut panels with default inner radius", () => {
    const panel = compilePanel(
      {
        type: "donut",
        props: {
          slices: [
            { name: "Done", value: 48 },
            { name: "Backlog", value: 34 },
          ],
        },
        height: 200,
      },
      {},
    );

    const { container } = render(panel);
    expect(container.innerHTML.length).toBeGreaterThan(0);
  });
});

describe("compilePanel alarm tones", () => {
  it("applies tag tones from runtime data to line series", () => {
    const panel = compilePanel(
      {
        type: "line",
        props: {
          categories: ["a", "b"],
          series: [{ name: "cpu", data: [1, 2] }],
        },
        height: 160,
      },
      {
        alarms: [{ id: "1", message: "High CPU", severity: "warning", tag: "cpu" }],
      },
    );

    const { container } = render(panel);
    expect(container.innerHTML.length).toBeGreaterThan(0);
  });
});

describe("compilePanel alert", () => {
  it("renders alarms from spec data", () => {
    const panel = compilePanel(
      {
        type: "alert",
        title: "Line alarms",
      },
      {
        alarms: [
          { id: "cpu", message: "CPU high", severity: "warning" },
        ],
      },
    );

    const { container } = render(panel);
    expect(container.textContent).toContain("CPU high");
    expect(container.textContent).toContain("Line alarms");
  });
});

describe("compilePanel color encoding", () => {
  it("applies encoding.color fills to line panels", () => {
    const panel = compilePanel(
      {
        type: "line",
        encoding: {
          x: { field: "week" },
          y: { field: "throughput" },
          color: { field: "aboveTarget" },
        },
        height: 180,
      },
      [
        { week: "W1", throughput: 120, aboveTarget: true },
        { week: "W2", throughput: 90, aboveTarget: false },
      ],
    );

    const { container } = render(panel);
    expect(container.innerHTML.length).toBeGreaterThan(0);
  });

  it("applies encoding.color fills to area panels", () => {
    const panel = compilePanel(
      {
        type: "area",
        encoding: {
          x: { field: "week" },
          y: { field: "throughput" },
          color: { field: "aboveTarget" },
        },
        height: 180,
      },
      [
        { week: "W1", throughput: 120, aboveTarget: true },
        { week: "W2", throughput: 90, aboveTarget: false },
      ],
    );

    const { container } = render(panel);
    expect(container.innerHTML.length).toBeGreaterThan(0);
  });
});

describe("compilePanel panel style", () => {
  it("compiles bar panels with props.style theme overrides", () => {
    const panel = compilePanel(
      {
        type: "bar",
        encoding: {
          x: { field: "week" },
          y: { field: "throughput" },
        },
        props: {
          style: {
            bar: { radius: 10, gap: 0.4 },
            grid: { opacity: 0.35 },
          },
        },
        height: 180,
      },
      [
        { week: "W1", throughput: 120 },
        { week: "W2", throughput: 90 },
      ],
    );

    const { container } = render(panel);
    expect(container.innerHTML.length).toBeGreaterThan(0);
    expect(container.innerHTML).not.toContain('"style"');
  });
});

describe("compilePanel chrome variants", () => {
  it("passes legend and tooltip variants to ChartContainer", () => {
    const panel = compilePanel(
      {
        type: "line",
        encoding: {
          x: { field: "week" },
          y: { field: "revenue" },
        },
        props: {
          legendVariant: "inline",
          tooltipVariant: "minimal",
        },
        height: 180,
      },
      [
        { week: "W1", revenue: 120 },
        { week: "W2", revenue: 90 },
      ],
    );

    const { container } = render(panel);
    expect(container.innerHTML.length).toBeGreaterThan(0);
    expect(container.innerHTML).not.toContain("legendVariant");
  });
});

describe("compilePanel combo", () => {
  it("compiles combo panels from encoding.y with kinds", () => {
    const panel = compilePanel(
      {
        type: "combo",
        encoding: {
          x: { field: "week" },
          y: [
            { field: "volume", label: "Volume", kind: "bar" },
            { field: "avg", label: "Daily avg", kind: "line" },
          ],
        },
        props: { dualAxis: "auto" },
        height: 200,
      },
      [
        { week: "W1", volume: 120, avg: 17 },
        { week: "W2", volume: 90, avg: 13 },
      ],
    );

    const { container } = render(panel);
    expect(container.innerHTML.length).toBeGreaterThan(0);
    expect(container.innerHTML).not.toContain("dualAxis");
  });
});

describe("compilePanel chartConfig", () => {
  it("passes chartConfig to ChartContainer", () => {
    const panel = compilePanel(
      {
        type: "line",
        encoding: {
          x: { field: "week" },
          y: { field: "revenue", label: "revenue" },
        },
        props: {
          chartConfig: {
            revenue: { label: "Net revenue", color: "#22c55e" },
          },
        },
        height: 180,
      },
      [
        { week: "W1", revenue: 120 },
        { week: "W2", revenue: 90 },
      ],
    );

    const { container } = render(panel);
    expect(container.innerHTML.length).toBeGreaterThan(0);
    expect(container.innerHTML).not.toContain("chartConfig");
  });
});

describe("compilePanel table", () => {
  it("renders tabular rows from spec data", () => {
    const panel = compilePanel(
      {
        type: "table",
        props: {
          columns: [
            { key: "symbol", label: "Symbol" },
            { key: "qty", label: "Qty", align: "right" },
          ],
        },
      },
      [{ symbol: "AAPL", qty: 100 }],
    );

    const { container } = render(panel);
    expect(container.textContent).toContain("Symbol");
    expect(container.textContent).toContain("AAPL");
    expect(container.textContent).toContain("100");
  });
});

describe("compilePanel markdown", () => {
  it("renders markdown content from props", () => {
    const panel = compilePanel(
      {
        type: "markdown",
        title: "Shift notes",
        props: {
          content: "# Handoff\n\nLine 3 is **stable**.",
        },
      },
      {},
    );

    const { container } = render(panel);
    expect(container.textContent).toContain("Shift notes");
    expect(container.textContent).toContain("Handoff");
    expect(container.textContent).toContain("stable");
  });

  it("accepts type text alias and runtime data content", () => {
    const panel = compilePanel(
      {
        type: "text",
        props: {},
      },
      { content: "Escalation path: [runbook](https://example.com/runbook)" },
    );

    const { container } = render(panel);
    expect(container.textContent).toContain("Escalation path");
    expect(container.querySelector("a")?.getAttribute("href")).toBe(
      "https://example.com/runbook",
    );
  });
});

describe("compilePanel brush sync", () => {
  it("passes syncId and syncFollower to ChartContainer", () => {
    const panel = compilePanel(
      {
        type: "line",
        props: { syncId: "rsi", syncFollower: "ohlc" },
        encoding: { x: { field: "week" }, y: { field: "value" } },
        height: 180,
      },
      [
        { week: "W1", value: 1 },
        { week: "W2", value: 2 },
      ],
    );

    expect(isValidElement(panel)).toBe(true);
    const container = panel as ReactElement<{ syncId?: string; syncFollower?: string }>;
    expect(container.props.syncId).toBe("rsi");
    expect(container.props.syncFollower).toBe("ohlc");
  });
});
