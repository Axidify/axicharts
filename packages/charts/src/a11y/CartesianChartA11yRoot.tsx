"use client";

import type { CSSProperties, ReactElement, ReactNode } from "react";
import { useMemo } from "react";
import type { PlotSeries } from "@axicharts/charts-canvas";
import type { ComboSeries } from "@axicharts/charts-canvas";
import { ChartA11yShell } from "./ChartA11yShell";
import { buildCartesianA11yDescriptor } from "./cartesianDescriptor";
import type { ChartA11yOptions } from "./a11yOptions";

export type CartesianChartA11yRootProps = {
  chartType: "line" | "bar" | "area" | "combo";
  categories: string[];
  series: PlotSeries[] | ComboSeries[];
  engine: "canvas" | "svg";
  title?: string;
  description?: string;
  categoryLabel?: string;
  style?: CSSProperties;
  children: ReactNode;
  a11y?: ChartA11yOptions;
  orientation?: "vertical" | "horizontal";
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
  a11y,
  orientation = "vertical",
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
    <ChartA11yShell
      descriptor={descriptor}
      ariaLabel={ariaLabel}
      style={style}
      a11y={a11y}
      screenReaderTable={engine === "canvas"}
      orientation={orientation}
      categoryCount={categories.length}
    >
      {children}
    </ChartA11yShell>
  );
}
