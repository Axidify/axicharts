export type SavedDashboard = {
  id: string;
  name: string;
  updatedAt: string;
  specJson: string;
  meta?: {
    layout: "embed" | "mosaic";
    feed: "static" | "historian" | "websocket" | "mqtt" | "rest" | "mock-live";
    template?: string;
    mosaicPreset?: string;
    presentation?: boolean;
    chartConfig?: import("@axicharts/charts-spec").ChartConfigSpec;
  };
};

export type Workspace = {
  id: string;
  name: string;
  dashboards: SavedDashboard[];
};

export type WorkspaceStore = {
  version: 1;
  activeWorkspaceId: string;
  activeDashboardId: string;
  workspaces: Workspace[];
};

export const WORKSPACE_STORE_VERSION = 1 as const;

export const DEFAULT_WORKSPACE_STORE_KEY = "dashboarder.workspaces.v1";

export const LEGACY_RUNTIME_SPEC_KEY = "dashboarder.runtime.spec";
