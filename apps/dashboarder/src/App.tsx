import { useEffect, useMemo, useState, type ReactElement } from "react";
import type { TemplateId } from "@axicharts/charts-spec";
import {
  RuntimeDashboard,
  TemplatePicker,
  addDashboard,
  addWorkspace,
  getActiveDashboard,
  loadWorkspaceStore,
  parseDashboardSpec,
  parseRuntimeSpec,
  persistWorkspaceStore,
  renameDashboard,
  saveDashboardSpec,
  selectDashboard,
  selectWorkspace,
  serializeRuntimeSpec,
  type RuntimeDashboardSpec,
  type WorkspaceStore,
} from "@axicharts/charts-runtime";
import { PluginStrip } from "./PluginStrip";
import { WorkspaceSidebar } from "./WorkspaceSidebar";
import {
  buildRuntimeSpec,
  defaultSeedSpec,
  hydrateRuntimeSpec,
  type FeedMode,
  type LayoutMode,
} from "./runtime/buildRuntimeSpec";

const buttonStyle = {
  fontSize: 12,
  padding: "4px 10px",
  borderRadius: 6,
  border: "1px solid #475569",
  background: "#1e293b",
  color: "#e2e8f0",
  cursor: "pointer",
} as const;

function applyDashboardMeta(
  dashboard: ReturnType<typeof getActiveDashboard>,
  setLayout: (layout: LayoutMode) => void,
  setFeed: (feed: FeedMode) => void,
  setTemplate: (template: TemplateId) => void,
): void {
  if (!dashboard.meta) return;
  setLayout(dashboard.meta.layout);
  setFeed(dashboard.meta.feed);
  if (dashboard.meta.template) {
    setTemplate(dashboard.meta.template as TemplateId);
  }
}

export function App(): ReactElement {
  const [store, setStore] = useState<WorkspaceStore | null>(null);
  const [template, setTemplate] = useState<TemplateId>("ops-2x2");
  const [layout, setLayout] = useState<LayoutMode>("embed");
  const [feed, setFeed] = useState<FeedMode>("historian");
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    const loaded = loadWorkspaceStore(localStorage, undefined, defaultSeedSpec());
    setStore(loaded);
    applyDashboardMeta(getActiveDashboard(loaded), setLayout, setFeed, setTemplate);
  }, []);

  const builtSpec = useMemo(
    () => buildRuntimeSpec({ template, layout, feed }),
    [template, layout, feed],
  );

  const activeSpec = useMemo((): RuntimeDashboardSpec | null => {
    if (!store) return null;
    if (dirty) return builtSpec;
    const dashboard = getActiveDashboard(store);
    return hydrateRuntimeSpec(parseDashboardSpec(dashboard), feed);
  }, [store, dirty, builtSpec, feed]);

  const persist = (next: WorkspaceStore): void => {
    setStore(next);
    persistWorkspaceStore(localStorage, next);
  };

  const handleSave = (): void => {
    if (!store || !activeSpec) return;
    persist(
      saveDashboardSpec(store, store.activeWorkspaceId, store.activeDashboardId, activeSpec, {
        meta: { layout, feed, template },
      }),
    );
    setDirty(false);
  };

  const handleSelectDashboard = (workspaceId: string, dashboardId: string): void => {
    if (!store) return;
    const next = selectDashboard(store, workspaceId, dashboardId);
    persist(next);
    applyDashboardMeta(getActiveDashboard(next), setLayout, setFeed, setTemplate);
    setDirty(false);
  };

  const handleNewDashboard = (): void => {
    if (!store) return;
    const name = window.prompt("Dashboard name", "New dashboard");
    if (!name?.trim()) return;
    const spec = buildRuntimeSpec({ template, layout, feed });
    persist(addDashboard(store, store.activeWorkspaceId, name.trim(), spec));
    setDirty(false);
  };

  const handleNewWorkspace = (): void => {
    if (!store) return;
    const name = window.prompt("Workspace name", "New workspace");
    if (!name?.trim()) return;
    const next = addWorkspace(store, name.trim(), defaultSeedSpec());
    persist(next);
    setLayout("embed");
    setFeed("historian");
    setTemplate("ops-2x2");
    applyDashboardMeta(getActiveDashboard(next), setLayout, setFeed, setTemplate);
    setDirty(false);
  };

  const handleExport = (): void => {
    if (!activeSpec) return;
    const portable = serializeRuntimeSpec(activeSpec);
    const blob = new Blob([portable], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "dashboard.runtime.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (): void => {
    if (!store) return;
    const next = window.prompt("Paste runtime JSON");
    if (!next) return;
    const parsed = parseRuntimeSpec(next);
    persist(
      saveDashboardSpec(store, store.activeWorkspaceId, store.activeDashboardId, parsed),
    );
    setDirty(false);
  };

  if (!store || !activeSpec) {
    return <div style={{ padding: 24, color: "#e2e8f0" }}>Loading workspace…</div>;
  }

  const activeDashboard = getActiveDashboard(store);

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", color: "#e2e8f0" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 24px",
          borderBottom: "1px solid #334155",
        }}
      >
        <div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Dashboarder</div>
          <div style={{ fontSize: 12, color: "#94a3b8" }}>
            Workspaces · saved dashboards · {dirty ? "unsaved changes" : activeDashboard.name}
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <label style={{ fontSize: 12, display: "inline-flex", gap: 8, alignItems: "center" }}>
            Layout
            <select
              value={layout}
              onChange={(event) => {
                setLayout(event.target.value as LayoutMode);
                setDirty(true);
              }}
              style={{ fontSize: 12, padding: "4px 8px", borderRadius: 6 }}
            >
              <option value="embed">Single embed</option>
              <option value="mosaic">Mosaic wall</option>
            </select>
          </label>
          <label style={{ fontSize: 12, display: "inline-flex", gap: 8, alignItems: "center" }}>
            Feed
            <select
              value={feed}
              onChange={(event) => {
                setFeed(event.target.value as FeedMode);
                setDirty(true);
              }}
              style={{ fontSize: 12, padding: "4px 8px", borderRadius: 6 }}
            >
              <option value="historian">Historian (mock)</option>
              <option value="static">Static</option>
            </select>
          </label>
          {layout === "embed" ? (
            <TemplatePicker
              value={template}
              onChange={(value) => {
                setTemplate(value);
                setDirty(true);
              }}
              label="Template"
            />
          ) : null}
          <button type="button" onClick={handleSave} style={buttonStyle}>
            Save
          </button>
          <button type="button" onClick={handleExport} style={buttonStyle}>
            Export
          </button>
          <button type="button" onClick={handleImport} style={buttonStyle}>
            Import JSON
          </button>
        </div>
      </header>

      <div style={{ display: "flex" }}>
        <WorkspaceSidebar
          store={store}
          onSelectWorkspace={(workspaceId) => {
            const next = selectWorkspace(store, workspaceId);
            persist(next);
            applyDashboardMeta(getActiveDashboard(next), setLayout, setFeed, setTemplate);
            setDirty(false);
          }}
          onSelectDashboard={handleSelectDashboard}
          onNewWorkspace={handleNewWorkspace}
          onNewDashboard={handleNewDashboard}
          onRenameDashboard={(name) => {
            persist(
              renameDashboard(store, store.activeWorkspaceId, store.activeDashboardId, name),
            );
          }}
        />
        <main style={{ flex: 1, padding: 24, maxWidth: 900 }}>
          <RuntimeDashboard spec={activeSpec} />
          <PluginStrip />
        </main>
      </div>
    </div>
  );
}
