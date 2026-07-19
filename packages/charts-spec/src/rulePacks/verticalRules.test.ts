import { describe, expect, it } from "vitest";
import { planPanelFromMetric, planPanelsFromProfile } from "../plan";

describe("vertical rule packs (C90)", () => {
  it("finance: maps variance intent to waterfall panel", () => {
    const panel = planPanelFromMetric(
      { name: "revenue_variance", unit: "USD", tags: { vertical: "finance" } },
      { intent: "P&L variance waterfall bridge", profileFields: ["period", "value"] },
    );

    expect(panel.type).toBe("waterfall");
    expect(panel.theme).toBe("clean");
  });

  it("finance: maps revenue vs margin intent to dual-axis combo", () => {
    const panel = planPanelFromMetric(
      { name: "revenue", unit: "USD", tags: { vertical: "finance" } },
      {
        intent: "Revenue vs margin dual axis combo",
        profileFields: ["period", "revenue", "margin", "vsPlan"],
      },
    );

    expect(panel.type).toBe("cartesian");
    expect(panel.marks).toEqual([
      { type: "bar", field: "revenue", label: "Revenue" },
      { type: "line", field: "margin", label: "Margin", yAxisId: "right" },
    ]);
    expect(panel.props?.showValues).toBe(true);
  });

  it("finance: maps margin KPI to stat with success tone", () => {
    const panel = planPanelFromMetric(
      { name: "gross_margin", unit: "%", tags: { vertical: "finance" } },
      { intent: "Finance KPI headline stat panel" },
    );

    expect(panel.type).toBe("stat");
    expect(panel.props?.tone).toBe("success");
  });

  it("finance: infers vsPlan color encoding from vertical field priority", () => {
    const panel = planPanelFromMetric(
      { name: "revenue", tags: { vertical: "finance" } },
      {
        intent: "Revenue vs plan coloring",
        profileFields: ["period", "revenue", "vsPlan"],
      },
    );

    expect(panel.encoding?.color).toEqual({ field: "vsPlan", type: "semantic" });
  });

  it("trading: maps OHLC metric to candlestick with brush sync hints", () => {
    const panel = planPanelFromMetric(
      { name: "AAPL", kind: "ohlc", tags: { vertical: "trading" } },
      {
        intent: "Trading desk candlestick with volume",
        profileFields: ["time", "open", "high", "low", "close", "volume"],
      },
    );

    expect(panel.type).toBe("candlestick");
    expect(panel.props?.brush).toBe(true);
    expect(panel.props?.brushEnd).toBe(45);
    expect(panel.props?.syncId).toBe("ohlc");
    expect(panel.props?.volumeField).toBe("volume");
  });

  it("trading: maps RSI metric to follower line with warning tone", () => {
    const panel = planPanelFromMetric(
      { name: "rsi", tags: { vertical: "trading" } },
      { intent: "RSI momentum follower panel" },
    );

    expect(panel.type).toBe("cartesian");
    expect(panel.marks?.[0]).toMatchObject({ type: "area", tone: "warning" });
    expect(panel.props?.syncId).toBe("rsi");
    expect(panel.props?.syncFollower).toBe("ohlc");
  });

  it("trading: infers side color encoding from vertical intent phrases", () => {
    const panel = planPanelFromMetric(
      { name: "exposure", tags: { vertical: "trading" } },
      {
        intent: "Exposure color by side",
        profileFields: ["symbol", "exposure", "side"],
      },
    );

    expect(panel.encoding?.color?.field).toBe("side");
  });

  it("ops: maps alarm intent to alert panel", () => {
    const panel = planPanelFromMetric(
      { name: "alarms", tags: { vertical: "ops" } },
      { intent: "Ops alarm panel for active alarms" },
    );

    expect(panel.type).toBe("alert");
    expect(panel.props?.surface).toBe("dark");
  });

  it("ops: maps utilization metric to gauge with thresholds", () => {
    const panel = planPanelFromMetric(
      { name: "tank_utilization", unit: "%", tags: { vertical: "ops" } },
      { intent: "Plant telemetry utilization gauge" },
    );

    expect(panel.type).toBe("gauge");
    expect(panel.props?.warningAt).toBe(75);
    expect(panel.props?.criticalAt).toBe(90);
  });

  it("ops: adds threshold bands on latency with SLO intent", () => {
    const panel = planPanelFromMetric(
      { name: "p95_latency", unit: "ms", tags: { vertical: "ops", refresh: "live" } },
      { intent: "Latency vs SLO threshold band" },
    );

    expect(panel.type).toBe("cartesian");
    expect(panel.marks?.[0]).toMatchObject({
      type: "line",
      field: "p95_latency",
      label: "p95_latency",
    });
    expect(panel.marks).toEqual(
      expect.arrayContaining([
        { type: "band", min: 0, max: 500, label: "SLO band", tone: "warning" },
        { type: "rule", value: 500, label: "SLO limit", tone: "critical" },
      ]),
    );
  });

  it("ops: maps errors metric to live bar chart", () => {
    const panel = planPanelFromMetric(
      { name: "errors", unit: "/min", tags: { vertical: "ops" } },
      { intent: "Line 3 error rate bar" },
    );

    expect(panel.type).toBe("cartesian");
    expect(panel.marks).toEqual([{ type: "bar", field: "errors", label: "errors" }]);
    expect(panel.mode).toBe("live");
  });

  it("plans finance/trading/ops panels across profile", () => {
    const panels = planPanelsFromProfile(
      {
        metrics: [
          { name: "gross_margin", tags: { vertical: "finance" } },
          { name: "AAPL", kind: "ohlc", tags: { vertical: "trading" } },
          { name: "p95_latency", tags: { vertical: "ops" } },
        ],
        fields: ["period", "revenue", "margin", "volume", "open", "high", "low", "close"],
      },
      { intent: "Finance trading ops mixed board" },
    );

    expect(panels[0]?.type).toBe("stat");
    expect(panels[1]?.type).toBe("candlestick");
    expect(panels[2]?.type).toBe("cartesian");
    expect(panels[2]?.marks?.[0]?.type).toBe("line");
  });
});
