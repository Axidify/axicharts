"use client";

import type { ReactElement } from "react";
import { Dashboard } from "@axicharts/charts-spec";
import { RuntimeShell } from "./RuntimeShell";
import type { DashboardEmbedSpec } from "./types";
import { useDataSource } from "./useDataSource";

function resolveStaleAfterMs(dashboard: DashboardEmbedSpec): number | undefined {
  if (dashboard.staleAfterMs != null) return dashboard.staleAfterMs;
  const source = dashboard.dataSource;
  if (source && "staleAfterMs" in source) return source.staleAfterMs;
  return undefined;
}

export type DashboardEmbedProps = {
  dashboard: DashboardEmbedSpec;
};

export function DashboardEmbed({ dashboard }: DashboardEmbedProps): ReactElement {
  const source =
    dashboard.dataSource ??
    (dashboard.data ? { type: "static" as const, data: dashboard.data } : undefined);
  const snapshot = useDataSource(source);
  const staleAfterMs = resolveStaleAfterMs(dashboard);
  const mode = dashboard.mode ?? (source?.type === "mock-live" ? "live" : "interactive");
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
