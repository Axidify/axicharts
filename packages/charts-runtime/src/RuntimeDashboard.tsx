"use client";

import type { ReactElement } from "react";
import { DashboardEmbed } from "./DashboardEmbed";
import { MosaicWall } from "./MosaicWall";
import type { RuntimeDashboardSpec } from "./types";

export type RuntimeDashboardProps = {
  spec: RuntimeDashboardSpec;
  className?: string;
  presentation?: boolean;
  alarmScopeId?: string;
  alarmStorage?: Pick<Storage, "getItem" | "setItem">;
};

export function RuntimeDashboard({
  spec,
  className,
  presentation = false,
  alarmScopeId,
  alarmStorage,
}: RuntimeDashboardProps): ReactElement {
  if (spec.layout === "mosaic") {
    const wall = presentation
      ? {
          ...spec.wall,
          mode: "presentation" as const,
          theme: spec.wall.theme ?? "presentation",
        }
      : spec.wall;
    return (
      <div className={className} style={{ width: "100%", height: "100%" }}>
        <MosaicWall
          wall={wall}
          alarmScopeId={alarmScopeId}
          alarmStorage={alarmStorage}
        />
      </div>
    );
  }

  const dashboard = presentation
    ? {
        ...spec.dashboard,
        mode: "presentation" as const,
        theme: spec.dashboard.theme ?? "presentation",
      }
    : spec.dashboard;

  return (
    <div className={className} style={{ width: "100%", height: "100%" }}>
      <DashboardEmbed
        dashboard={dashboard}
        alarmScopeId={alarmScopeId}
        alarmStorage={alarmStorage}
      />
    </div>
  );
}
