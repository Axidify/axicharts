"use client";

import type { CSSProperties, ReactElement, ReactNode } from "react";
import { useMemo } from "react";
import type { PlotSeries } from "@axicharts/charts-canvas";
import type { ComboSeries } from "@axicharts/charts-canvas";
import { ChartA11yFallback } from "./ChartA11yFallback";
import { buildCartesianA11yDescriptor } from "./cartesianDescriptor";
import { CHART_A11Y_ATTR, serializeA11yDescriptor } from "./serialize";
import type { CartesianA11yDescriptor } from "./types";

export type CartesianChartA11yRootProps = {
  chartType: CartesianA11yDescriptor["chartType"];
  categories: string[];
  series: PlotSeries[] | ComboSeries[];
  engine: "canvas" | "svg";
  title?: string;
  description?: string;
  categoryLabel?: string;
  style?: CSSProperties;
  children: ReactNode;
};

export function CartesianChartA11yRoot({
  chartType,
  categories,
  series,
  engine,
  title,
  description,
  categoryLabel,
  style,
  children,
}: CartesianChartA11yRootProps): ReactElement {
  const descriptor = useMemo(
    () =>
      buildCartesianA11yDescriptor({
        chartType,
        categories,
        series,
        title,
        description,
        categoryLabel,
      }),
    [chartType, categories, series, title, description, categoryLabel],
  );
  const ariaLabel = descriptor.title ?? series.map((item) => item.name).join(", ");

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      {...{ [CHART_A11Y_ATTR]: serializeA11yDescriptor(descriptor) }}
      style={style}
    >
      {children}
      {engine === "canvas" ? <ChartA11yFallback descriptor={descriptor} /> : null}
    </div>
  );
}
