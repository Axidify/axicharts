import type { ReactElement } from "react";
import type { Workspace, WorkspaceStore } from "@axicharts/charts-runtime";

const sidebarStyle = {
  width: 240,
  borderRight: "1px solid #334155",
  padding: 16,
  display: "flex",
  flexDirection: "column" as const,
  gap: 16,
  minHeight: "calc(100vh - 65px)",
};

const buttonStyle = {
  fontSize: 12,
  padding: "6px 10px",
  borderRadius: 6,
  border: "1px solid #475569",
  background: "#1e293b",
  color: "#e2e8f0",
  cursor: "pointer",
  textAlign: "left" as const,
};

export type WorkspaceSidebarProps = {
  store: WorkspaceStore;
  onSelectWorkspace: (workspaceId: string) => void;
  onSelectDashboard: (workspaceId: string, dashboardId: string) => void;
  onNewWorkspace: () => void;
  onNewDashboard: () => void;
  onRenameDashboard: (name: string) => void;
};

function activeWorkspace(store: WorkspaceStore): Workspace {
  return store.workspaces.find((item) => item.id === store.activeWorkspaceId)!;
}

export function WorkspaceSidebar({
  store,
  onSelectWorkspace,
  onSelectDashboard,
  onNewWorkspace,
  onNewDashboard,
  onRenameDashboard,
}: WorkspaceSidebarProps): ReactElement {
  const workspace = activeWorkspace(store);

  return (
    <aside style={sidebarStyle}>
      <div>
        <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 6 }}>Workspace</div>
        <select
          value={store.activeWorkspaceId}
          onChange={(event) => onSelectWorkspace(event.target.value)}
          style={{ width: "100%", fontSize: 12, padding: "6px 8px", borderRadius: 6 }}
        >
          {store.workspaces.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        <button type="button" onClick={onNewWorkspace} style={{ ...buttonStyle, marginTop: 8, width: "100%" }}>
          + New workspace
        </button>
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 6 }}>Dashboards</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {workspace.dashboards.map((dashboard) => {
            const active = dashboard.id === store.activeDashboardId;
            return (
              <button
                key={dashboard.id}
                type="button"
                onClick={() => onSelectDashboard(workspace.id, dashboard.id)}
                style={{
                  ...buttonStyle,
                  background: active ? "#334155" : buttonStyle.background,
                  borderColor: active ? "#64748b" : buttonStyle.border,
                }}
              >
                <div style={{ fontWeight: 600 }}>{dashboard.name}</div>
                <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>
                  {new Date(dashboard.updatedAt).toLocaleString()}
                </div>
              </button>
            );
          })}
        </div>
        <button type="button" onClick={onNewDashboard} style={{ ...buttonStyle, marginTop: 8, width: "100%" }}>
          + New dashboard
        </button>
      </div>

      <button
        type="button"
        onClick={() => {
          const name = window.prompt("Dashboard name", workspace.dashboards.find((d) => d.id === store.activeDashboardId)?.name);
          if (name?.trim()) onRenameDashboard(name.trim());
        }}
        style={{ ...buttonStyle, width: "100%" }}
      >
        Rename dashboard
      </button>
    </aside>
  );
}
