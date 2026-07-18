"use client";

import type { CSSProperties, ReactElement, ReactNode } from "react";
import { ChartA11yFallback } from "./ChartA11yFallback";
import { singleValueA11ySummary } from "./singleValueDescriptor";
import { CHART_A11Y_ATTR, serializeA11yDescriptor } from "./serialize";
import type { SingleValueA11yDescriptor } from "./types";

export type SingleValueChartA11yRootProps = {
  descriptor: SingleValueA11yDescriptor;
  style?: CSSProperties;
  children: ReactNode;
};

/**
 * Screen-reader root for single-value HMI panels — always renders ChartA11yFallback.
 */
export function SingleValueChartA11yRoot({
  descriptor,
  style,
  children,
}: SingleValueChartA11yRootProps): ReactElement {
  const ariaLabel = singleValueA11ySummary(descriptor);

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
