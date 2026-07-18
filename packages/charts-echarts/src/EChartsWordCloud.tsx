"use client";

import type { ReactElement } from "react";
import type { EChartsOption } from "echarts";
import type { ChartTheme } from "@axicharts/charts-theme";
import { hiddenTooltip, seriesPalette, toneColor } from "./themeBridge";
import { withPresentationAnimation } from "./presentationAnimation";
import { useEChart, type EChartItemHoverEvent } from "./useEChart";
import { useWordCloudExtension } from "./useWordCloudExtension";
import type { WordCloudWord } from "./wordCloudTypes";

export type EChartsWordCloudProps = {
  width: number;
  height: number;
  theme: ChartTheme;
  words: WordCloudWord[];
  shape?: "circle" | "cardioid" | "diamond" | "triangle" | "pentagon" | "star";
  rotationRange?: [number, number];
  gridSize?: number;
  onItemHover?: (event: EChartItemHoverEvent) => void;
  mergeOption?: boolean;
  animate?: boolean;
};

function resolveWordColor(
  word: WordCloudWord,
  index: number,
  palette: string[],
  theme: ChartTheme,
): string {
  if (word.color) {
    return word.color;
  }
  const fromTone = word.tone ? toneColor(word.tone, theme) : undefined;
  if (fromTone) {
    return fromTone;
  }
  return palette[index % palette.length] ?? palette[0] ?? "#3b82f6";
}

function EChartsWordCloudPlot({
  width,
  height,
  theme,
  words,
  shape = "circle",
  rotationRange = [-45, 45],
  gridSize = 8,
  onItemHover,
  mergeOption = false,
  animate = false,
}: EChartsWordCloudProps): ReactElement {
  const palette = seriesPalette(theme);
  const total = words.reduce((sum, word) => sum + word.value, 0);

  const option: EChartsOption = withPresentationAnimation(
    {
      tooltip: hiddenTooltip(),
      series: [
        {
          type: "wordCloud",
          shape,
          gridSize,
          rotationRange,
          sizeRange: [12, 56],
          width: "96%",
          height: "96%",
          drawOutOfBound: false,
          layoutAnimation: animate,
          textStyle: {
            fontFamily: theme.values.monospace
              ? "ui-monospace, SFMono-Regular, Menlo, monospace"
              : "inherit",
          },
          emphasis: {
            focus: "self",
          },
          data: words.map((word, index) => ({
            name: word.text,
            value: word.value,
            textStyle: {
              color: resolveWordColor(word, index, palette, theme),
            },
          })),
        },
      ],
    },
    animate,
  );

  const rootRef = useEChart({
    option,
    width,
    height,
    onItemHover,
    mergeOption,
    formatItemHover: (params) => {
      const mouse = params.event?.event;
      if (!mouse || params.name == null) return null;
      const value = typeof params.value === "number" ? params.value : 0;
      const share = total > 0 ? ((value / total) * 100).toFixed(1) : "0";
      return {
        title: params.name,
        rows: [
          { label: "Weight", value: String(value), color: params.color },
          { label: "Share", value: `${share}%`, color: params.color },
        ],
        left: mouse.offsetX,
        top: mouse.offsetY,
      };
    },
  });

  return (
    <div
      ref={rootRef}
      className="axicharts-echarts"
      style={{ width, height, background: "transparent" }}
    />
  );
}

export function EChartsWordCloud(props: EChartsWordCloudProps): ReactElement {
  const extensionReady = useWordCloudExtension();

  if (!extensionReady) {
    return (
      <div
        className="axicharts-echarts"
        style={{
          width: props.width,
          height: props.height,
          background: "transparent",
        }}
        aria-hidden="true"
      />
    );
  }

  return <EChartsWordCloudPlot {...props} />;
}
