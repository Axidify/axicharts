"use client";

import type { ReactElement } from "react";
import { ChartA11yTableView, type ChartA11yTableViewProps } from "./ChartA11yTableView";

export type ChartA11yFallbackProps = Omit<ChartA11yTableViewProps, "visible">;

/**
 * Screen-reader data table fallback for canvas-based charts.
 */
export function ChartA11yFallback({
  descriptor,
}: ChartA11yFallbackProps): ReactElement {
  return <ChartA11yTableView descriptor={descriptor} visible={false} />;
}
