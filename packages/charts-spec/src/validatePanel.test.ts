import { describe, expect, it } from "vitest";
import { createPanel, UnsupportedPanelFamilyError } from "./createPanel";
import { listMarks } from "./listMarks";
import { validatePanel } from "./validatePanel";

const ROWS = [
  { week: "W1", revenue: 42, target: 40 },
  { week: "W2", revenue: 48, target: 44 },
];

const VALID = {
  type: "cartesian" as const,
  encoding: { x: { field: "week" } },
  marks: [
    { type: "bar" as const, field: "revenue" },
    { type: "line" as const, field: "target" },
  ],
};

describe("validatePanel (RFC-004 C180)", () => {
  it("validates cartesian panels and returns normalized spec", () => {
    const result = validatePanel(
      {
        type: "bar",
        encoding: { x: { field: "week" }, y: { field: "revenue" } },
      },
      { rows: ROWS },
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.family).toBe("cartesian");
      expect(result.spec.type).toBe("cartesian");
      expect(result.spec.marks?.[0]?.field).toBe("revenue");
    }
  });

  it("includes fix patch on UNKNOWN_FIELD", () => {
    const result = validatePanel(
      {
        ...VALID,
        marks: [{ type: "bar", field: "revnue" }],
      },
      { rows: ROWS },
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      const err = result.errors.find((e) => e.code === "UNKNOWN_FIELD");
      expect(err?.suggestion).toBe("revenue");
      expect(err?.fix).toEqual({ "marks[0].field": "revenue" });
      expect(err?.family).toBe("cartesian");
    }
  });

  it("normalizes legacy funnel panels to distribution", () => {
    const result = validatePanel(
      {
        type: "funnel",
        encoding: {
          name: { field: "stage" },
          value: { field: "value" },
        },
      },
      {
        rows: [
          { stage: "Proposal", value: 85 },
          { stage: "Negotiation", value: 240 },
        ],
        strict: true,
      },
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.family).toBe("distribution");
      expect(result.spec.type).toBe("distribution");
      expect(result.spec.marks?.some((mark) => mark.type === "funnel")).toBe(true);
    }
  });

  it("validates distribution panels with marks", () => {
    const result = validatePanel(
      {
        type: "distribution",
        encoding: {
          angle: { field: "revenue" },
          color: { field: "week" },
        },
        marks: [{ type: "arc", field: "revenue" }, { type: "donut", innerRadius: 42 }],
      },
      { rows: ROWS },
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.family).toBe("distribution");
      expect(result.spec.type).toBe("distribution");
    }
  });

  it("strict mode rejects legacy stat panels", () => {
    const result = validatePanel({ type: "stat" }, { rows: ROWS, strict: true });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.family).toBe("legacy");
      expect(result.errors[0]?.code).toBe("LEGACY_PANEL_NOT_AGENT_SAFE");
    }
  });

  it("non-strict mode passes legacy with warning", () => {
    const result = validatePanel({ type: "stat" }, { rows: ROWS, strict: false });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.warnings.some((w) => w.code === "LEGACY_PANEL")).toBe(true);
    }
  });
});

describe("createPanel", () => {
  it("creates cartesian panels", () => {
    const result = createPanel({
      family: "cartesian",
      intent: "bar chart of revenue by week",
      fields: ["week", "revenue"],
    });
    expect(result.family).toBe("cartesian");
    expect(result.panel.type).toBe("cartesian");
    expect(result.schema).toContain("cartesian-panel.schema.json");
  });

  it("creates matrix panels", () => {
    const result = createPanel({
      family: "matrix",
      intent: "latency heatmap by hour and day",
      fields: ["hour", "day", "latency"],
    });
    expect(result.family).toBe("matrix");
    expect(result.panel.type).toBe("matrix");
    expect(result.schema).toContain("matrix-panel.schema.json");
  });

  it("creates distribution panels", () => {
    const result = createPanel({
      family: "distribution",
      intent: "browser share donut breakdown",
      fields: ["browser", "share"],
    });
    expect(result.family).toBe("distribution");
    expect(result.panel.type).toBe("distribution");
    expect(result.panel.marks?.some((mark) => mark.type === "donut")).toBe(true);
  });
});

describe("listMarks", () => {
  it("lists cartesian catalog", () => {
    const result = listMarks("cartesian");
    expect(result.family).toBe("cartesian");
    expect(result.closedSet).toEqual(["bar", "line", "area", "point", "rule", "band"]);
  });

  it("lists distribution catalog", () => {
    const result = listMarks("distribution");
    expect(result.closedSet).toEqual(["arc", "funnel", "donut", "cell", "label"]);
  });

  it("lists matrix catalog", () => {
    const result = listMarks("matrix");
    expect(result.closedSet).toEqual(["cell", "colorScale", "axis"]);
  });
});

describe("validatePanel fix patches", () => {
  const browserRows = [
    { browser: "Chrome", share: 48 },
    { browser: "Safari", share: 32 },
  ];

  it("distribution UNKNOWN_FIELD includes fix", () => {
    const result = validatePanel(
      {
        type: "distribution",
        encoding: {
          angle: { field: "shre" },
          color: { field: "browser" },
        },
        marks: [{ type: "arc", field: "shre" }],
      },
      { rows: browserRows, strict: true },
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      const err = result.errors.find((issue) => issue.code === "UNKNOWN_FIELD");
      expect(err?.fix).toEqual({ "encoding.angle.field": "share" });
    }
  });

  it("matrix UNKNOWN_FIELD includes fix", () => {
    const rows = [
      { hour: "09:00", day: "Mon", latency: 42 },
      { hour: "10:00", day: "Mon", latency: 55 },
    ];
    const result = validatePanel(
      {
        type: "matrix",
        encoding: {
          x: { field: "hour" },
          y: { field: "day" },
          value: { field: "latncy" },
        },
        marks: [{ type: "cell", field: "latncy" }],
      },
      { rows, strict: true },
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      const err = result.errors.find((issue) => issue.code === "UNKNOWN_FIELD");
      expect(err?.fix).toEqual({ "marks[0].field": "latency" });
    }
  });

  it("strict mode blocks DUPLICATE_OVERLAY_CHANNEL on cartesian panels", () => {
    const result = validatePanel(
      {
        type: "cartesian",
        encoding: { x: { field: "week" } },
        marks: [
          { type: "bar", field: "revenue" },
          { type: "rule", value: 50 },
        ],
        props: {
          referenceLines: [{ value: 60, label: "props" }],
        },
      },
      { rows: ROWS, strict: true },
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(
        result.errors.some((issue) => issue.code === "DUPLICATE_OVERLAY_CHANNEL"),
      ).toBe(true);
    }
  });
});
