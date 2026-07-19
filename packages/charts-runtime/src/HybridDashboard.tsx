"use client";

import type { ReactElement } from "react";
import { MosaicWall } from "./MosaicWall";
import { PanelsDashboard } from "./PanelsDashboard";
import type { AdapterFixtureHrefResolver, HybridDashboardSpec } from "./types";

export type HybridDashboardProps = {
  hybrid: HybridDashboardSpec;
  className?: string;
  alarmScopeId?: string;
  alarmStorage?: Pick<Storage, "getItem" | "setItem">;
  adapterFixtureHref?: AdapterFixtureHrefResolver;
};

/**
 * C172 — static tabular panels above a live mosaic wall (e.g. MQTT ops tiles).
 */
export function HybridDashboard({
  hybrid,
  className,
  alarmScopeId,
  alarmStorage,
  adapterFixtureHref,
}: HybridDashboardProps): ReactElement {
  const title = hybrid.title ?? hybrid.panels.title;
  const subtitle = hybrid.subtitle ?? hybrid.panels.subtitle;

  return (
    <div className={className} style={{ width: "100%", display: "flex", flexDirection: "column", gap: 24 }}>
      {(title || subtitle) && !hybrid.panels.title ? (
        <div>
          {title ? <div style={{ fontSize: 16, fontWeight: 700 }}>{title}</div> : null}
          {subtitle ? (
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>{subtitle}</div>
          ) : null}
        </div>
      ) : null}
      <PanelsDashboard panels={hybrid.panels} />
      <MosaicWall
        wall={hybrid.wall}
        alarmScopeId={alarmScopeId}
        alarmStorage={alarmStorage}
        adapterFixtureHref={adapterFixtureHref}
      />
    </div>
  );
}
