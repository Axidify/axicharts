"use client";

import type { ReactElement } from "react";
import { useMemo } from "react";
import {
  EChartsWordCloud,
  type WordCloudWord,
} from "@axicharts/charts-echarts";
import { useChartLayout } from "../container/ChartLayoutContext";
import { EChartsInteractionShell } from "../chrome/EChartsInteractionShell";
import { useEChartsInteraction } from "../sync/useEChartsInteraction";
import { buildWordCloudA11yDescriptor } from "../a11y/echartsDescriptor";
import { EChartsChartA11yRoot } from "../a11y/EChartsChartA11yRoot";

export type WordCloudChartProps = {
  words: WordCloudWord[];
  shape?: "circle" | "cardioid" | "diamond" | "triangle" | "pentagon" | "star";
  rotationRange?: [number, number];
  gridSize?: number;
  sizeRange?: [number, number];
};

function WordCloudPlot({
  words,
  shape,
  rotationRange,
  gridSize,
  sizeRange,
}: WordCloudChartProps): ReactElement {
  const { size, theme, mode } = useChartLayout();
  const interaction = useEChartsInteraction();

  return (
    <EChartsWordCloud
      width={Math.floor(size.width)}
      height={Math.floor(size.height)}
      theme={theme}
      words={words}
      shape={shape}
      rotationRange={rotationRange}
      gridSize={gridSize}
      sizeRange={sizeRange}
      onItemHover={interaction.onItemHover}
      mergeOption={mode === "live"}
      animate={mode === "presentation"}
    />
  );
}

export function WordCloudChart({
  words,
  shape,
  rotationRange,
  gridSize,
  sizeRange,
}: WordCloudChartProps): ReactElement | null {
  const { size, ready } = useChartLayout();

  if (!ready || size.width < 1 || size.height < 1) {
    return null;
  }

  const a11yDescriptor = useMemo(
    () => buildWordCloudA11yDescriptor({ words }),
    [words],
  );

  return (
    <EChartsChartA11yRoot
      descriptor={a11yDescriptor}
      style={{ width: size.width, height: size.height, position: "relative" }}
    >
      <EChartsInteractionShell
        plot={
          <WordCloudPlot
            words={words}
            shape={shape}
            rotationRange={rotationRange}
            gridSize={gridSize}
            sizeRange={sizeRange}
          />
        }
      />
    </EChartsChartA11yRoot>
  );
}

export type { WordCloudWord } from "@axicharts/charts-echarts";
