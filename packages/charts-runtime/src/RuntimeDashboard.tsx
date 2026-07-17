"use client";

import type { ReactElement } from "react";
import { DashboardEmbed } from "./DashboardEmbed";
import { MosaicWall } from "./MosaicWall";
import type { RuntimeDashboardSpec } from "./types";

export type RuntimeDashboardProps = {
  spec: RuntimeDashboardSpec;
};

export function RuntimeDashboard({ spec }: RuntimeDashboardProps): ReactElement {
  if (spec.layout === "mosaic") {
    return <MosaicWall wall={spec.wall} />;
  }

  return <DashboardEmbed dashboard={spec.dashboard} />;
}
