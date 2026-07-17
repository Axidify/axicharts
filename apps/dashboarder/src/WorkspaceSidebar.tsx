import type { ReactElement } from "react";
import type { SavedDashboard, Workspace, WorkspaceStore } from "@axicharts/charts-runtime";

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
  canDeleteDashboard: boolean;
  onSelectWorkspace: (workspaceId: string) => void;
  onSelectDashboard: (workspaceId: string, dashboardId: string) => void;
  onNewWorkspace: () => void;
  onNewDashboard: () => void;
  onRenameDashboard: (name: string) => void;
  onRenameWorkspace: (name: string) => void;
  onDeleteDashboard: () => void;
  onShareWorkspace: () => void;
};

function activeWorkspace(store: WorkspaceStore): Workspace {
  return store.workspaces.find((item) => item.id === store.activeWorkspaceId)!;
}

export function WorkspaceSidebar({
  store,
  canDeleteDashboard,
  onSelectWorkspace,
  onSelectDashboard,
  onNewWorkspace,
  onNewDashboard,
  onRenameDashboard,
  onRenameWorkspace,
  onDeleteDashboard,
  onShareWorkspace,
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
        <button
          type="button"
          onClick={() => {
            const name = window.prompt("Workspace name", workspace.name);
            if (name?.trim()) onRenameWorkspace(name.trim());
          }}
          style={{ ...buttonStyle, marginTop: 8, width: "100%" }}
        >
          Rename workspace
        </button>
        <button
          type="button"
          onClick={onShareWorkspace}
          style={{ ...buttonStyle, marginTop: 8, width: "100%" }}
        >
          Share workspace
        </button>
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 6 }}>Dashboards</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {workspace.dashboards.map((dashboard: SavedDashboard) => {
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

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <button
          type="button"
          onClick={() => {
            const active = workspace.dashboards.find(
              (dashboard: SavedDashboard) => dashboard.id === store.activeDashboardId,
            );
            const name = window.prompt("Dashboard name", active?.name);
            if (name?.trim()) onRenameDashboard(name.trim());
          }}
          style={{ ...buttonStyle, width: "100%" }}
        >
          Rename dashboard
        </button>
        <button
          type="button"
          onClick={onDeleteDashboard}
          disabled={!canDeleteDashboard}
          style={{
            ...buttonStyle,
            width: "100%",
            opacity: canDeleteDashboard ? 1 : 0.45,
            cursor: canDeleteDashboard ? "pointer" : "not-allowed",
            borderColor: "#7f1d1d",
            color: "#fecaca",
          }}
        >
          Delete dashboard
        </button>
      </div>
    </aside>
  );
}
