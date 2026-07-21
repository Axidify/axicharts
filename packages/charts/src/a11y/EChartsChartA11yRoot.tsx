"use client";

import type { CSSProperties, ReactElement, ReactNode } from "react";
import { ChartA11yShell } from "./ChartA11yShell";
import { chartA11ySummary } from "./echartsDescriptor";
import type { ChartA11yOptions } from "./a11yOptions";
import type { ChartA11yDescriptor } from "./types";

export type EChartsChartA11yRootProps = {
  descriptor: ChartA11yDescriptor;
  style?: CSSProperties;
  children: ReactNode;
  a11y?: ChartA11yOptions;
};

/**
 * Screen-reader root for canvas ECharts panels — always renders ChartA11yFallback.
 */
export function EChartsChartA11yRoot({
  descriptor,
  style,
  children,
  a11y,
}: EChartsChartA11yRootProps): ReactElement {
  const ariaLabel = descriptor.title ?? chartA11ySummary(descriptor);

  return (
    <ChartA11yShell descriptor={descriptor} ariaLabel={ariaLabel} style={style} a11y={a11y}>
      {children}
    </ChartA11yShell>
  );
}
