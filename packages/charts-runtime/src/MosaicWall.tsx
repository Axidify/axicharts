"use client";

import type { ReactElement } from "react";
import { Dashboard } from "@axicharts/charts-spec";
import { aggregateSnapshots } from "./aggregateSnapshots";
import { mergeMosaicData, pluckMosaicData } from "./mosaicData";
import { readAlarms } from "./readAlarms";
import { AdapterHealthStrip } from "./AdapterHealthStrip";
import { RuntimeShell } from "./RuntimeShell";
import { isLiveDataSource } from "./isLiveDataSource";
import type { MosaicWallSpec, AdapterFixtureHrefResolver } from "./types";
import { useDataSource } from "./useDataSource";
import { useDataSources, resolveBoundSnapshot } from "./useDataSources";

function resolveStaleAfterMs(spec: MosaicWallSpec): number | undefined {
  if (spec.staleAfterMs != null) return spec.staleAfterMs;
  const source = spec.dataSource;
  if (source && "staleAfterMs" in source) return source.staleAfterMs;
  return undefined;
}

export type MosaicWallProps = {
  wall: MosaicWallSpec;
  alarmScopeId?: string;
  alarmStorage?: Pick<Storage, "getItem" | "setItem">;
  adapterFixtureHref?: AdapterFixtureHrefResolver;
};

export function MosaicWall({
  wall,
  alarmScopeId,
  alarmStorage,
  adapterFixtureHref,
}: MosaicWallProps): ReactElement {
  const multiSources = wall.dataSources;
  const snapshots = useDataSources(multiSources);
  const singleSource =
    wall.dataSource ??
    (wall.data && !multiSources?.length
      ? { type: "static" as const, data: wall.data }
      : undefined);
  const singleSnapshot = useDataSource(multiSources?.length ? undefined : singleSource);
  const defaultSnapshot = multiSources?.length
    ? aggregateSnapshots(snapshots, wall.dataSourceId)
    : singleSnapshot;
  const staleAfterMs = resolveStaleAfterMs(wall);
  const liveSource = multiSources?.[0] ?? singleSource;
  const mode =
    wall.mode ??
    (isLiveDataSource(liveSource) ? "live" : "interactive");
  const staticData = wall.data ?? {};
  const columns = wall.columns ?? 2;
  const alarms = readAlarms({ ...staticData, ...defaultSnapshot.data });
  const interactiveAlarms = wall.cells.some(
    (cell) => cell.template === "ops-2x2" || (cell.theme ?? wall.theme) === "industrial",
  );
  const alarmSurface =
    wall.theme === "industrial" || mode === "live" ? "dark" : "light";

  return (
    <RuntimeShell
      connection={defaultSnapshot.connection}
      lastUpdatedAt={defaultSnapshot.lastUpdatedAt}
      staleAfterMs={staleAfterMs}
      error={defaultSnapshot.error}
      live={mode === "live"}
      alarms={alarms}
      interactiveAlarms={interactiveAlarms}
      alarmSurface={alarmSurface}
      alarmScopeId={alarmScopeId}
      alarmStorage={alarmStorage}
    >
      <div className="axicharts-mosaic-wall" style={{ width: "100%" }}>
        {wall.title ? (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <strong>{wall.title}</strong>
            {wall.subtitle ? (
              <span style={{ color: "#64748b", fontSize: 12 }}>{wall.subtitle}</span>
            ) : null}
          </div>
        ) : null}
        {multiSources?.length ? (
          <AdapterHealthStrip
            items={multiSources.map((source) => {
              const cell = wall.cells.find((item) => item.dataSourceId === source.id);
              return {
                id: source.id,
                label: cell?.title ?? source.id,
                connection: snapshots[source.id]?.connection ?? "idle",
                fixtureHref: adapterFixtureHref?.(source.type),
                adapterType: source.type,
              };
            })}
          />
        ) : null}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            gap: wall.gap ?? 12,
            alignItems: "start",
          }}
        >
          {wall.cells.map((cell) => {
            const cellSnapshot = multiSources?.length
              ? resolveBoundSnapshot(snapshots, cell.dataSourceId ?? wall.dataSourceId)
              : defaultSnapshot;
            const merged = mergeMosaicData(staticData, cellSnapshot.data);
            const cellData = mergeMosaicData(
              merged,
              pluckMosaicData(merged, cell.dataPath),
              cell.data ?? {},
            );

            return (
              <div
                key={cell.id}
                style={{
                  gridColumn: cell.colSpan ? `span ${cell.colSpan}` : undefined,
                  gridRow: cell.rowSpan ? `span ${cell.rowSpan}` : undefined,
                  minWidth: 0,
                }}
              >
                <Dashboard
                  template={cell.template}
                  title={cell.title}
                  subtitle={cell.subtitle}
                  theme={cell.theme ?? wall.theme}
                  mode={cell.mode ?? mode}
                  data={cellData}
                />
              </div>
            );
          })}
        </div>
      </div>
    </RuntimeShell>
  );
}
