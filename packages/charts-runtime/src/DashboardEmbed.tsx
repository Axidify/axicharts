"use client";

import type { ReactElement } from "react";
import { Dashboard } from "@axicharts/charts-spec";
import { aggregateSnapshots } from "./aggregateSnapshots";
import { readAlarms } from "./readAlarms";
import { RuntimeShell } from "./RuntimeShell";
import { isLiveDataSource } from "./isLiveDataSource";
import type { DashboardEmbedSpec } from "./types";
import { useDataSource } from "./useDataSource";
import { useDataSources } from "./useDataSources";

function resolveStaleAfterMs(dashboard: DashboardEmbedSpec): number | undefined {
  if (dashboard.staleAfterMs != null) return dashboard.staleAfterMs;
  const source = dashboard.dataSource;
  if (source && "staleAfterMs" in source) return source.staleAfterMs;
  return undefined;
}

export type DashboardEmbedProps = {
  dashboard: DashboardEmbedSpec;
  alarmScopeId?: string;
  alarmStorage?: Pick<Storage, "getItem" | "setItem">;
};

export function DashboardEmbed({
  dashboard,
  alarmScopeId,
  alarmStorage,
}: DashboardEmbedProps): ReactElement {
  const multiSources = dashboard.dataSources;
  const snapshots = useDataSources(multiSources);
  const singleSource =
    dashboard.dataSource ??
    (dashboard.data && !multiSources?.length
      ? { type: "static" as const, data: dashboard.data }
      : undefined);
  const singleSnapshot = useDataSource(multiSources?.length ? undefined : singleSource);
  const snapshot = multiSources?.length
    ? aggregateSnapshots(snapshots, dashboard.dataSourceId)
    : singleSnapshot;
  const staleAfterMs = resolveStaleAfterMs(dashboard);
  const liveSource = multiSources?.[0] ?? singleSource;
  const mode =
    dashboard.mode ??
    (isLiveDataSource(liveSource) ? "live" : "interactive");
  const data = {
    ...(dashboard.data ?? {}),
    ...snapshot.data,
  };

  return (
    <RuntimeShell
      connection={snapshot.connection}
      lastUpdatedAt={snapshot.lastUpdatedAt}
      staleAfterMs={staleAfterMs}
      error={snapshot.error}
      live={mode === "live"}
      alarms={readAlarms(data)}
      interactiveAlarms={
        dashboard.template === "ops-2x2" || dashboard.theme === "industrial"
      }
      alarmSurface={
        dashboard.theme === "industrial" || mode === "live" ? "dark" : "light"
      }
      alarmScopeId={alarmScopeId}
      alarmStorage={alarmStorage}
    >
      <Dashboard
        template={dashboard.template}
        title={dashboard.title}
        subtitle={dashboard.subtitle}
        theme={dashboard.theme}
        mode={mode}
        data={data}
      />
    </RuntimeShell>
  );
}
