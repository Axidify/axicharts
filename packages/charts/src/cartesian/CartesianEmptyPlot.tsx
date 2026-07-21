"use client";

import type { ReactElement } from "react";
import { ChartStateOverlay } from "../state";

export type CartesianEmptyPlotProps = {
  width: number;
  height: number;
  message?: string;
  dark?: boolean;
};

/** Optional empty UI when a cartesian chart has no categories or series (manual use). */
export function CartesianEmptyPlot({
  width,
  height,
  message,
  dark = false,
}: CartesianEmptyPlotProps): ReactElement {
  return (
    <div
      style={{
        width,
        height,
        position: "relative",
      }}
    >
      <ChartStateOverlay state="empty" message={message} dark={dark} />
    </div>
  );
}
