"use client";

import type { ReactElement, ReactNode } from "react";
import { Crosshair, Tooltip } from "../chrome";
import { ChartInteractionProvider } from "../interaction/ChartInteractionContext";
import { getInteractionChrome } from "../interaction/mode";
import { useChartLayout } from "../container/ChartLayoutContext";

export type EChartsInteractionShellProps = {
  plot: ReactNode;
  showCrosshair?: boolean;
};

export function EChartsInteractionShell({
  plot,
  showCrosshair = false,
}: EChartsInteractionShellProps): ReactElement {
  const { mode } = useChartLayout();
  const chrome = getInteractionChrome(mode);

  return (
    <ChartInteractionProvider>
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {plot}
        {showCrosshair && chrome.showCrosshair ? <Crosshair /> : null}
        {chrome.showTooltip ? <Tooltip /> : null}
      </div>
    </ChartInteractionProvider>
  );
}
