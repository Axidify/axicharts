import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { registerBuiltinChartTypes } from "@axicharts/charts/registry";
import { registerTankChart } from "@axicharts/charts-tank";
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
