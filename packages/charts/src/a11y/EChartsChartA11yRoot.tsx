"use client";

import type { CSSProperties, ReactElement, ReactNode } from "react";
import { ChartA11yFallback } from "./ChartA11yFallback";
import { chartA11ySummary } from "./echartsDescriptor";
import { CHART_A11Y_ATTR, serializeA11yDescriptor } from "./serialize";
import type { ChartA11yDescriptor } from "./types";

export type EChartsChartA11yRootProps = {
  descriptor: ChartA11yDescriptor;
  style?: CSSProperties;
  children: ReactNode;
};

/**
 * Screen-reader root for canvas ECharts panels — always renders ChartA11yFallback.
 */
export function EChartsChartA11yRoot({
  descriptor,
  style,
  children,
}: EChartsChartA11yRootProps): ReactElement {
  const ariaLabel = descriptor.title ?? chartA11ySummary(descriptor);

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      {...{ [CHART_A11Y_ATTR]: serializeA11yDescriptor(descriptor) }}
      style={style}
    >
      {children}
      <ChartA11yFallback descriptor={descriptor} />
    </div>
  );
}
