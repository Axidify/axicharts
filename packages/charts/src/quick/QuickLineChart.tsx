"use client";

import type { CSSProperties, ReactElement } from "react";
import { cleanTheme, type ChartTheme } from "@axicharts/charts-theme";
import { ChartContainer } from "../container/ChartContainer";
import { LineChart } from "../line/LineChart";

export type QuickLineChartProps = {
  data: number[];
  labels?: string[];
  title?: string;
  height?: number;
  theme?: ChartTheme;
  mode?: "static" | "interactive" | "live" | "presentation";
  name?: string;
  fill?: boolean;
  style?: CSSProperties;
  className?: string;
};

export function QuickLineChart({
  data,
  labels,
  title,
  height = 220,
  theme = cleanTheme,
  mode = "static",
  name = "value",
  fill = true,
  style,
  className,
}: QuickLineChartProps): ReactElement {
  const categories = labels ?? data.map((_, index) => String(index + 1));

  return (
    <div className={className} style={{ width: "100%", ...style }}>
      {title ? (
        <h2
          style={{
            margin: 0,
            marginBottom: 8,
            fontSize: 14,
            fontWeight: 600,
            lineHeight: 1.4,
          }}
        >
          {title}
        </h2>
      ) : null}
      <ChartContainer theme={theme} mode={mode} height={height} width="100%">
        <LineChart
          categories={categories}
          series={[{ name, data }]}
          fill={fill}
        />
      </ChartContainer>
    </div>
  );
}
