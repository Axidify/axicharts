"use client";

import type { ReactElement } from "react";
import { LineChart, type LineChartProps } from "../line/LineChart";

export type AreaChartProps = Omit<LineChartProps, "fill">;

export function AreaChart(props: AreaChartProps): ReactElement | null {
  return <LineChart {...props} fill />;
}
