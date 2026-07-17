"use client";

import type { ReactElement } from "react";
import { Dashboard } from "@axicharts/charts-spec";
import { mergeMosaicData, pluckMosaicData } from "./mosaicData";
import { RuntimeShell } from "./RuntimeShell";
import type { MosaicWallSpec } from "./types";
import { useDataSource } from "./useDataSource";

function resolveStaleAfterMs(spec: MosaicWallSpec): number | undefined {
  if (spec.staleAfterMs != null) return spec.staleAfterMs;
  const source = spec.dataSource;
  if (source && "staleAfterMs" in source) return source.staleAfterMs;
  return undefined;
}

export type MosaicWallProps = {
  wall: MosaicWallSpec;
};

export function MosaicWall({ wall }: MosaicWallProps): ReactElement {
  const source =
    wall.dataSource ??
    (wall.data ? { type: "static" as const, data: wall.data } : undefined);
  const snapshot = useDataSource(source);
  const staleAfterMs = resolveStaleAfterMs(wall);
  const mode = wall.mode ?? (source?.type === "mock-live" ? "live" : "interactive");
  const merged = mergeMosaicData(wall.data ?? {}, snapshot.data);
  const columns = wall.columns ?? 2;

  return (
    <RuntimeShell
      connection={snapshot.connection}
      lastUpdatedAt={snapshot.lastUpdatedAt}
      staleAfterMs={staleAfterMs}
      error={snapshot.error}
      live={mode === "live"}
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
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            gap: wall.gap ?? 12,
            alignItems: "start",
          }}
        >
          {wall.cells.map((cell) => {
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
