"use client";

import type { ReactElement } from "react";
import { compilePanel } from "./compilePanel";
import { compileDashboard } from "./templates";
import type {
  ChartMode,
  DashboardSpec,
  PanelSpec,
  SpecData,
  ThemeName,
} from "./types";

export type ChartProps = {
  panel: PanelSpec;
  data: SpecData;
  theme?: ThemeName;
  mode?: ChartMode;
  height?: number;
  width?: number | string;
};

export function Chart({
  panel,
  data,
  theme,
  mode,
  height,
  width,
}: ChartProps): ReactElement {
  return compilePanel(panel, data, { theme, mode, height, width });
}

export type DashboardProps = DashboardSpec;

export function Dashboard(spec: DashboardProps): ReactElement {
  return compileDashboard(spec);
}
