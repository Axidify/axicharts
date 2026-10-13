import { describe, expect, it } from "vitest";
import { blockMarksToChartProps } from "./blockMarks";
import { normalizeBlockMark } from "./cartesianMarks";
import {
  detectLegacyOverlayProps,
  detectPreNormalizeWarnings,
  validateCartesianSpec,
} from "./cartesianValidation";
import { ejectBlocksComposableBody, ejectBlocksImperativeBody } from "./ejectBlocks";
import { validatePanel } from "./validatePanel";
import type { PanelSpec } from "./types";

const rows = [
  { week: "W1", revenue: 10 },
  { week: "W2", revenue: 20 },
];

describe("text / marker overlay marks", () => {
  it("normalizes text and marker marks from mark or type keys", () => {
    expect(normalizeBlockMark({ mark: "text", text: "Peak", y: 5, x: "W2", position: "top" })).toEqual({
      type: "text",
      text: "Peak",
      y: 5,
      x: "W2",
      position: "top",
    });
    expect(normalizeBlockMark({ type: "marker", y: 3, draggable: true, id: "m1" })).toEqual({
      type: "marker",
      y: 3,
      draggable: true,
      id: "m1",
    });
    expect(normalizeBlockMark({ type: "text", y: 3 })).toBeNull();
  });

  it("routes vertical rules, text and markers to chart annotations", () => {
    const props = blockMarksToChartProps(rows, [
      { type: "line", field: "revenue" },
      { type: "rule", value: 15, label: "Target" },
      { type: "rule", value: 0, x: "W2", label: "Launch" },
      { type: "text", text: "Peak", y: 20, x: "W2" },
      { type: "marker", y: 10, x: "W1", tone: "critical" },
    ]);
    expect(props.referenceLines).toEqual([{ value: 15, label: "Target", tone: undefined }]);
    expect(props.annotations).toEqual([
      { type: "line", value: 0, orientation: "vertical", x: "W2", label: "Launch" },
      { type: "label", text: "Peak", y: 20, x: "W2" },
      { type: "marker", y: 10, x: "W1", tone: "critical" },
    ]);
  });

  it("validates text and marker as known overlay marks", () => {
    const result = validateCartesianSpec(
      {
        type: "cartesian",
        encoding: { x: { field: "week" } },
        marks: [
          { type: "bar", field: "revenue" },
          { type: "text", text: "Peak", y: 20 },
          { type: "marker", y: 10 },
        ],
      },
      { rows },
    );
    expect(result.ok).toBe(true);
  });

  it("ejects annotation overlays as an annotations prop", () => {
    const spec: PanelSpec = {
      type: "cartesian",
      encoding: { x: { field: "week" } },
      marks: [
        { type: "line", field: "revenue" },
        { type: "rule", value: 15 },
        { type: "marker", y: 10, x: "W1" },
      ],
    };
    const composable = ejectBlocksComposableBody(spec, "rows");
    expect(composable).toContain("<Rule value={15} />");
    expect(composable).toContain('annotations={[{"type":"marker","y":10,"x":"W1"}]}');
    expect(ejectBlocksImperativeBody(spec, "rows")).toContain(
      'annotations={[{"type":"marker","y":10,"x":"W1"}]}',
    );
  });
});

describe("LEGACY_OVERLAY_PROPS deprecation (E-102)", () => {
  const legacy: PanelSpec = {
    type: "line",
    encoding: { x: { field: "week" }, y: { field: "revenue" } },
    props: { referenceLines: [{ value: 15 }] },
    annotations: [{ type: "label", text: "Peak", y: 20 }],
  };

  it("names every legacy channel in use", () => {
    expect(detectLegacyOverlayProps(legacy)).toMatchObject({
      code: "LEGACY_OVERLAY_PROPS",
      path: "props.referenceLines",
      severity: "warning",
      message: expect.stringContaining("props.referenceLines, annotations are deprecated"),
    });
  });

  it("ignores specs that only use marks[] and non-cartesian panels", () => {
    expect(
      detectLegacyOverlayProps({
        type: "cartesian",
        encoding: { x: { field: "week" } },
        marks: [{ type: "line", field: "revenue" }, { type: "rule", value: 1 }],
      }),
    ).toBeNull();
    expect(
      detectLegacyOverlayProps({ type: "gauge", props: { annotations: [{ type: "line", value: 1 }] } } as PanelSpec),
    ).toBeNull();
  });

  it("surfaces as a non-blocking warning in validatePanel, even when strict", () => {
    for (const strict of [false, true]) {
      const result = validatePanel(legacy, { strict, rows });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.warnings.map((w) => w.code)).toContain("LEGACY_OVERLAY_PROPS");
      }
    }
  });

  it("is reported by detectPreNormalizeWarnings", () => {
    expect(detectPreNormalizeWarnings(legacy).map((w) => w.code)).toContain(
      "LEGACY_OVERLAY_PROPS",
    );
  });
});
