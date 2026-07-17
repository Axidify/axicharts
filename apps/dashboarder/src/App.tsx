import { useEffect, useMemo, useRef, useState, type ReactElement } from "react";
import type { TemplateId } from "@axicharts/charts-spec";
import {
  RuntimeDashboard,
  TemplatePicker,
  addDashboard,
  addWorkspace,
  deleteDashboard,
  getActiveDashboard,
  loadWorkspaceStore,
  parseDashboardExport,
  parseDashboardSpec,
  persistWorkspaceStore,
  renameDashboard,
  saveDashboardSpec,
  selectDashboard,
  selectWorkspace,
  serializeDashboardExport,
  buildReactEmbedSnippet,
  type RuntimeDashboardSpec,
  type WorkspaceStore,
} from "@axicharts/charts-runtime";
import {
  DEFAULT_OPS_PROFILE,
  planFromIntent,
  type DashboardPlan,
} from "@axicharts/charts-planner";
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

const PLANNER_URL = import.meta.env.VITE_PLANNER_URL as string | undefined;

function applyPlan(
  plan: DashboardPlan,
  setTemplate: (template: TemplateId) => void,
  setLayout: (layout: LayoutMode) => void,
  setFeed: (feed: FeedMode) => void,
  setPresentation: (presentation: boolean) => void,
): void {
  setTemplate(plan.template as TemplateId);
  setLayout(plan.layout);
  setFeed(plan.feed);
  setPresentation(plan.presentation);
}

function applyDashboardMeta(
  dashboard: ReturnType<typeof getActiveDashboard>,
  setLayout: (layout: LayoutMode) => void,
  setFeed: (feed: FeedMode) => void,
  setTemplate: (template: TemplateId) => void,
  setPresentation: (presentation: boolean) => void,
): void {
  if (!dashboard.meta) return;
  setLayout(dashboard.meta.layout);
  setFeed(dashboard.meta.feed);
  setPresentation(dashboard.meta.presentation ?? false);
  if (dashboard.meta.template) {
    setTemplate(dashboard.meta.template as TemplateId);
  }
}

function slugifyName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function App(): ReactElement {
  const [store, setStore] = useState<WorkspaceStore | null>(null);
  const [template, setTemplate] = useState<TemplateId>("ops-2x2");
  const [layout, setLayout] = useState<LayoutMode>("embed");
  const [feed, setFeed] = useState<FeedMode>("historian");
  const [presentation, setPresentation] = useState(false);
  const [presenting, setPresenting] = useState(false);
  const [dirty, setDirty] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loaded = loadWorkspaceStore(localStorage, undefined, defaultSeedSpec());
    setStore(loaded);
    applyDashboardMeta(
      getActiveDashboard(loaded),
      setLayout,
      setFeed,
      setTemplate,
      setPresentation,
    );
  }, []);

  const builtSpec = useMemo(
    () => buildRuntimeSpec({ template, layout, feed, presentation }),
    [template, layout, feed, presentation],
  );

  const activeSpec = useMemo((): RuntimeDashboardSpec | null => {
    if (!store) return null;
    if (dirty) return builtSpec;
    const dashboard = getActiveDashboard(store);
    return hydrateRuntimeSpec(parseDashboardSpec(dashboard), feed, presentation);
  }, [store, dirty, builtSpec, feed, presentation]);

  const persist = (next: WorkspaceStore): void => {
    setStore(next);
    persistWorkspaceStore(localStorage, next);
  };

  const builderMeta = useMemo(
    () => ({ layout, feed, template, presentation }),
    [layout, feed, template, presentation],
  );

  const handleSave = (): void => {
    if (!store || !activeSpec) return;
    persist(
      saveDashboardSpec(store, store.activeWorkspaceId, store.activeDashboardId, activeSpec, {
        meta: builderMeta,
      }),
    );
    setDirty(false);
  };

  const handleSelectDashboard = (workspaceId: string, dashboardId: string): void => {
    if (!store) return;
    const next = selectDashboard(store, workspaceId, dashboardId);
    persist(next);
    applyDashboardMeta(
      getActiveDashboard(next),
      setLayout,
      setFeed,
      setTemplate,
      setPresentation,
    );
    setDirty(false);
  };

  const handleNewDashboard = (): void => {
    if (!store) return;
    const name = window.prompt("Dashboard name", "New dashboard");
    if (!name?.trim()) return;
    const spec = buildRuntimeSpec({ template, layout, feed, presentation });
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
    setPresentation(false);
    applyDashboardMeta(
      getActiveDashboard(next),
      setLayout,
      setFeed,
      setTemplate,
      setPresentation,
    );
    setDirty(false);
  };

  const handleDeleteDashboard = (): void => {
    if (!store) return;
    const dashboard = getActiveDashboard(store);
    const workspace = store.workspaces.find((item) => item.id === store.activeWorkspaceId);
    if (!workspace || workspace.dashboards.length <= 1) return;
    if (!window.confirm(`Delete "${dashboard.name}"?`)) return;

    const next = deleteDashboard(store, store.activeWorkspaceId, store.activeDashboardId);
    if (next === store) return;
    persist(next);
    applyDashboardMeta(
      getActiveDashboard(next),
      setLayout,
      setFeed,
      setTemplate,
      setPresentation,
    );
    setDirty(false);
  };

  const handleExport = (): void => {
    if (!store || !activeSpec) return;
    const dashboard = getActiveDashboard(store);
    const portable = serializeDashboardExport(dashboard.name, activeSpec, builderMeta);
    const blob = new Blob([portable], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${slugifyName(dashboard.name) || "dashboard"}.runtime.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePlan = async (): Promise<void> => {
    const intent = window.prompt(
      "Describe the dashboard",
      "Line 3 night shift overview",
    );
    if (!intent?.trim()) return;

    let plan: DashboardPlan;
    if (PLANNER_URL) {
      const response = await fetch(`${PLANNER_URL.replace(/\/$/, "")}/plan`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ profile: DEFAULT_OPS_PROFILE, intent: intent.trim() }),
      });
      if (!response.ok) {
        window.alert("Planner server failed — using local rules planner.");
        plan = planFromIntent(DEFAULT_OPS_PROFILE, intent.trim());
      } else {
        plan = (await response.json()) as DashboardPlan;
      }
    } else {
      plan = planFromIntent(DEFAULT_OPS_PROFILE, intent.trim());
    }

    applyPlan(plan, setTemplate, setLayout, setFeed, setPresentation);
    setDirty(true);
    if (plan.warnings?.length) {
      window.alert(plan.warnings.join("\n"));
    }
  };

  const handleImportFile = async (file: File): Promise<void> => {
    if (!store) return;
    const text = await file.text();
    const imported = parseDashboardExport(text);
    const next = saveDashboardSpec(
      store,
      store.activeWorkspaceId,
      store.activeDashboardId,
      imported.spec,
      {
        name: imported.name,
        meta: imported.meta,
      },
    );
    persist(next);
    if (imported.meta) {
      applyDashboardMeta(
        getActiveDashboard(next),
        setLayout,
        setFeed,
        setTemplate,
        setPresentation,
      );
    }
    setDirty(false);
  };

  const handleCopyEmbed = async (): Promise<void> => {
    if (!activeSpec) return;
    await navigator.clipboard.writeText(buildReactEmbedSnippet(activeSpec));
    window.alert("React embed snippet copied to clipboard.");
  };

  if (!store || !activeSpec) {
    return <div style={{ padding: 24, color: "#e2e8f0" }}>Loading workspace…</div>;
  }

  const activeDashboard = getActiveDashboard(store);
  const activeWorkspace = store.workspaces.find((item) => item.id === store.activeWorkspaceId);
  const canDeleteDashboard = (activeWorkspace?.dashboards.length ?? 0) > 1;

  if (presenting) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 50,
          background: "#0f172a",
          color: "#e2e8f0",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 20px",
            borderBottom: "1px solid #334155",
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 600 }}>{activeDashboard.name}</div>
          <button type="button" onClick={() => setPresenting(false)} style={buttonStyle}>
            Exit presentation
          </button>
        </div>
        <main style={{ flex: 1, padding: 24, overflow: "auto" }}>
          <RuntimeDashboard
            spec={activeSpec}
            presentation
            alarmScopeId={activeDashboard.id}
            alarmStorage={localStorage}
          />
        </main>
      </div>
    );
  }

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
          <label style={{ fontSize: 12, display: "inline-flex", gap: 8, alignItems: "center" }}>
            <input
              type="checkbox"
              checked={presentation}
              onChange={(event) => {
                setPresentation(event.target.checked);
                setDirty(true);
              }}
            />
            Presentation
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
          <button type="button" onClick={() => void handlePlan()} style={buttonStyle}>
            Plan
          </button>
          <button type="button" onClick={() => setPresenting(true)} style={buttonStyle}>
            Present
          </button>
          <button type="button" onClick={() => void handleCopyEmbed()} style={buttonStyle}>
            Copy embed
          </button>
          <button type="button" onClick={handleSave} style={buttonStyle}>
            Save
          </button>
          <button type="button" onClick={handleExport} style={buttonStyle}>
            Export
          </button>
          <button type="button" onClick={() => importInputRef.current?.click()} style={buttonStyle}>
            Import
          </button>
          <input
            ref={importInputRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) void handleImportFile(file);
            }}
          />
        </div>
      </header>

      <div style={{ display: "flex" }}>
        <WorkspaceSidebar
          store={store}
          canDeleteDashboard={canDeleteDashboard}
          onSelectWorkspace={(workspaceId) => {
            const next = selectWorkspace(store, workspaceId);
            persist(next);
            applyDashboardMeta(
              getActiveDashboard(next),
              setLayout,
              setFeed,
              setTemplate,
              setPresentation,
            );
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
          onDeleteDashboard={handleDeleteDashboard}
        />
        <main style={{ flex: 1, padding: 24, maxWidth: presentation ? 1100 : 900 }}>
          <RuntimeDashboard
            spec={activeSpec}
            presentation={presentation}
            alarmScopeId={activeDashboard.id}
            alarmStorage={localStorage}
          />
          <PluginStrip />
        </main>
      </div>
    </div>
  );
}
