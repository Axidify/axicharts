"use client";

import type { CSSProperties, ReactElement } from "react";
import { studioTheme, type ChartTheme } from "@axicharts/charts-theme";
import { ChartContainer } from "../container/ChartContainer";
import { BarChart } from "../bar/BarChart";

export type StudioBarChartProps = {
  data: number[];
  labels?: string[];
  title?: string;
  height?: number;
  theme?: ChartTheme;
  mode?: "static" | "interactive" | "live" | "presentation";
  name?: string;
  style?: CSSProperties;
  className?: string;
};

export function StudioBarChart({
  data,
  labels,
  title,
  height = 240,
  theme = studioTheme,
  mode = "static",
  name = "value",
  style,
  className,
}: StudioBarChartProps): ReactElement {
  const categories = labels ?? data.map((_, index) => String(index + 1));

  return (
    <div className={className} style={{ width: "100%", ...style }}>
      {title ? (
        <h2
          style={{
            margin: 0,
            marginBottom: 10,
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: "-0.01em",
            lineHeight: 1.4,
            color: "var(--foreground, #0f172a)",
          }}
        >
          {title}
        </h2>
      ) : null}
      <ChartContainer theme={theme} mode={mode} height={height} width="100%">
        <BarChart
          categories={categories}
          series={[{ name, data }]}
        />
      </ChartContainer>
    </div>
  );
}
