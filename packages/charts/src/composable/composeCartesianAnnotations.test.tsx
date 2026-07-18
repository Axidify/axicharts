import { describe, expect, it } from "vitest";
import type { ReactElement } from "react";
import { composeCartesianAnnotations } from "./composeCartesianAnnotations";
import { AnnotationBand, AnnotationLabel, AnnotationMarker } from "./marks";

describe("composeCartesianAnnotations", () => {
  it("reads annotation composable marks from children", () => {
    const annotations = composeCartesianAnnotations([
      <AnnotationLabel key="l" text="Peak" x="Q3" y={120} tone="success" />,
      <AnnotationBand key="b" min={70} max={85} label="Warn" tone="warning" />,
      <AnnotationMarker key="m" x="Q2" y={90} draggable tone="critical" />,
    ]);

    expect(annotations).toEqual([
      {
        type: "label",
        text: "Peak",
        x: "Q3",
        y: 120,
        tone: "success",
        position: undefined,
        id: undefined,
      },
      {
        type: "band",
        min: 70,
        max: 85,
        label: "Warn",
        tone: "warning",
        id: undefined,
      },
      {
        type: "marker",
        x: "Q2",
        y: 90,
        label: undefined,
        tone: "critical",
        draggable: true,
        id: undefined,
      },
    ]);
  });
});
