import { useCallback, useEffect, useMemo, useState, type ReactElement } from "react";
import type { Persona, TemplateId } from "@axicharts/charts-spec";
import {
  RuntimeDashboard,
  inferPresentationDeck,
  TemplatePicker,
  addDashboard,
  addWorkspace,
  deleteDashboard,
  getActiveDashboard,
  importSharedWorkspace,
  loadWorkspaceStore,
  parseDashboardSpec,
  tryParseDashboardSpec,
  persistWorkspaceStore,
  renameDashboard,
  renameWorkspace,
  saveDashboardSpec,
  selectDashboard,
  selectWorkspace,
  type RuntimeDashboardSpec,
  type ShareExport,
  type WorkspaceStore,
} from "@axicharts/charts-runtime";
import { PresentationDeckRuntime } from "@axicharts/charts-runtime/presentation-deck";
import type { DashboardPlan } from "@axicharts/charts-planner";
import { EmbedDialog } from "./EmbedDialog";
import { ImportDialog } from "./ImportDialog";
import { findImportPreset, adapterFixtureGalleryDeepLink, feedAdapterGalleryDeepLink, parseImportPresetQuery } from "@axicharts/charts-runtime/validation";
import type { DataSourceAdapterType } from "@axicharts/charts-runtime";
import { PlannerPanel } from "./PlannerPanel";
import { PlannerPanelsWorkspace } from "./PlannerPanelsWorkspace";
import { ShareDialog } from "./ShareDialog";
import { PluginStrip } from "./PluginStrip";
import { FeedIntentGlossary } from "./FeedIntentGlossary";
import { WorkspaceSidebar } from "./WorkspaceSidebar";
import {
  fetchWorkspaceStore,
  saveWorkspaceStoreToServer,
} from "./api/workspaceClient";
import { TabularUploadView } from "./tabular/TabularUploadView";
import { TabularDashboardView } from "./TabularDashboardView";
import { AuthStatus } from "./AuthStatus";
import type { OrchestratorChatResult } from "./api/orchestratorClient";
import { buildTabularRuntimeSpec, isPanelsRuntimeSpec } from "./runtime/tabularRuntimeSpec";
import {
  buildRuntimeSpec,
  defaultSeedSpec,
  hydrateRuntimeSpec,
  listMosaicPresets,
  type FeedMode,
  type LayoutMode,
  type MosaicPresetId,
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

function resolveAdapterFixtureHref(type: DataSourceAdapterType): string | undefined {
  switch (type) {
    case "static":
    case "rest":
    case "historian":
    case "websocket":
    case "mqtt":
    case "mock-live":
      return adapterFixtureGalleryDeepLink(type);
    default:
      return undefined;
  }
}

function applyPlan(
  plan: DashboardPlan,
  setTemplate: (template: TemplateId) => void,
  setLayout: (layout: LayoutMode) => void,
  setFeed: (feed: FeedMode) => void,
  setPresentation: (presentation: boolean) => void,
  setMosaicPreset: (preset: MosaicPresetId) => void,
): void {
  setTemplate(plan.template as TemplateId);
  setLayout(plan.layout);
  setFeed(plan.feed);
  setPresentation(plan.presentation);
  if (plan.layout === "mosaic") {
    setMosaicPreset(plan.mosaicPreset ?? "ops-overview");
  }
}

function applyDashboardMeta(
  dashboard: ReturnType<typeof getActiveDashboard>,
  setLayout: (layout: LayoutMode) => void,
  setFeed: (feed: FeedMode) => void,
  setTemplate: (template: TemplateId) => void,
  setPresentation: (presentation: boolean) => void,
  setMosaicPreset: (preset: MosaicPresetId) => void,
): void {
  if (!dashboard.meta) return;
  setLayout(dashboard.meta.layout);
  setFeed(dashboard.meta.feed);
  setPresentation(dashboard.meta.presentation ?? false);
  if (dashboard.meta.template) {
    setTemplate(dashboard.meta.template as TemplateId);
  }
  if (dashboard.meta.mosaicPreset) {
    setMosaicPreset(dashboard.meta.mosaicPreset as MosaicPresetId);
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
  const [mosaicPreset, setMosaicPreset] = useState<MosaicPresetId>("ops-finance");
  const [feed, setFeed] = useState<FeedMode>("historian");
  const [presentation, setPresentation] = useState(false);
  const [presenting, setPresenting] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [plannerOpen, setPlannerOpen] = useState(false);
  const [embedOpen, setEmbedOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareTab, setShareTab] = useState<"dashboard" | "workspace">("dashboard");
  const [importOpen, setImportOpen] = useState(false);
  const [importJson, setImportJson] = useState("");
  const [importFilename, setImportFilename] = useState<string | undefined>();
  const [importPresetId, setImportPresetId] = useState<string | undefined>();
  const [tabularUploadOpen, setTabularUploadOpen] = useState(false);
  const [tabularEditCsv, setTabularEditCsv] = useState<string | undefined>();
  const [appliedPlan, setAppliedPlan] = useState<DashboardPlan | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      let loaded: WorkspaceStore | null = null;
      try {
        loaded = await fetchWorkspaceStore();
      } catch {
        loaded = null;
      }

      if (cancelled) return;

      if (!loaded) {
        loaded = loadWorkspaceStore(localStorage, undefined, defaultSeedSpec());
        void saveWorkspaceStoreToServer(loaded).catch(() => {
          // Server persistence is best-effort; localStorage remains fallback.
        });
      }

      setStore(loaded);
      applyDashboardMeta(
        getActiveDashboard(loaded),
        setLayout,
        setFeed,
        setTemplate,
        setPresentation,
        setMosaicPreset,
      );
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!store) return;
    const presetId = parseImportPresetQuery(window.location.search);
    if (!presetId || !findImportPreset(presetId)) return;
    setImportPresetId(presetId);
    setImportOpen(true);
    window.history.replaceState({}, "", window.location.pathname);
  }, [store]);

  useEffect(() => {
    if (feed !== "static" || layout !== "embed") {
      setAppliedPlan(null);
    }
  }, [feed, layout]);

  const builtSpec = useMemo(() => {
    if (store && layout === "panels") {
      const saved = tryParseDashboardSpec(getActiveDashboard(store));
      if (saved?.layout === "panels") return saved;
    }

    const next = buildRuntimeSpec({ template, layout, feed, presentation, mosaicPreset });
    if (!store || layout !== "embed") return next;

    if (next.layout === "mosaic") return next;

    const saved = parseDashboardSpec(getActiveDashboard(store));
    if (saved.layout === "mosaic" || !saved.dashboard.chartConfig) return next;

    return {
      ...next,
      dashboard: {
        ...next.dashboard,
        chartConfig: saved.dashboard.chartConfig,
      },
    };
  }, [store, template, layout, feed, presentation, mosaicPreset]);

  const activeSpec = useMemo((): RuntimeDashboardSpec | null => {
    if (!store) return null;
    const dashboard = getActiveDashboard(store);
    const saved = tryParseDashboardSpec(getActiveDashboard(store));
    if (!saved) return builtSpec;

    if (saved.layout === "panels" || saved.layout === "hybrid") {
      return saved;
    }

    if (dirty) return builtSpec;
    return hydrateRuntimeSpec(saved, feed, presentation);
  }, [store, dirty, builtSpec, feed, presentation]);

  const persist = (next: WorkspaceStore): void => {
    setStore(next);
    persistWorkspaceStore(localStorage, next);
    void saveWorkspaceStoreToServer(next).catch(() => {
      // Server persistence is best-effort; localStorage remains fallback.
    });
  };

  const builderMeta = useMemo(() => {
    const dashboard = store ? getActiveDashboard(store) : null;
    if (activeSpec?.layout === "panels") {
      return {
        layout: "panels" as const,
        feed: "static" as const,
        source: "tabular" as const,
        persona: dashboard?.meta?.persona,
        followUpIntents: dashboard?.meta?.followUpIntents,
        vertical: dashboard?.meta?.vertical,
        dashboardIntent: dashboard?.meta?.dashboardIntent,
        presentation,
      };
    }

    const chartConfig =
      activeSpec?.layout === "embed" ? activeSpec.dashboard.chartConfig : undefined;
    const presentationDeck =
      activeSpec && presentation ? inferPresentationDeck(activeSpec) : undefined;
    return { layout, feed, template, presentation, mosaicPreset, chartConfig, presentationDeck };
  }, [store, layout, feed, template, presentation, mosaicPreset, activeSpec]);

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
      setMosaicPreset,
    );
    setDirty(false);
  };

  const handleNewDashboard = (): void => {
    if (!store) return;
    const name = window.prompt("Dashboard name", "New dashboard");
    if (!name?.trim()) return;
    const spec = buildRuntimeSpec({ template, layout, feed, presentation, mosaicPreset });
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
      setMosaicPreset,
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
      setMosaicPreset,
    );
    setDirty(false);
  };

  const handleExport = (): void => {
    setShareTab("dashboard");
    setShareOpen(true);
  };

  const handleShareWorkspace = (): void => {
    setShareTab("workspace");
    setShareOpen(true);
  };

  const handleApplyTabularPlan = useCallback(
    (
      plan: OrchestratorChatResult,
      rawText: string,
      persona: Persona,
      followUpIntents: string[],
    ): void => {
      if (!store) return;
      const spec = buildTabularRuntimeSpec(plan, rawText);
      const meta = {
        layout: "panels" as const,
        feed: "static" as const,
        source: "tabular" as const,
        persona,
        followUpIntents,
        vertical: plan.vertical,
        dashboardIntent: plan.dashboardIntent,
        presentation: false,
      };
      persist(
        saveDashboardSpec(store, store.activeWorkspaceId, store.activeDashboardId, spec, { meta }),
      );
      setLayout("panels");
      setFeed("static");
      setDirty(false);
      setTabularUploadOpen(false);
      setTabularEditCsv(undefined);
    },
    [store],
  );

  const handleTabularPlanUpdate = useCallback(
    (spec: ReturnType<typeof buildTabularRuntimeSpec>, meta: NonNullable<typeof builderMeta>) => {
      if (!store) return;
      const next = saveDashboardSpec(
        store,
        store.activeWorkspaceId,
        store.activeDashboardId,
        spec,
        { meta },
      );
      persist(next);
      setLayout("panels");
      setFeed("static");
      setDirty(false);
    },
    [store],
  );

  const handleApplyPlan = (plan: DashboardPlan): void => {
    applyPlan(plan, setTemplate, setLayout, setFeed, setPresentation, setMosaicPreset);
    setAppliedPlan(plan.panels.length > 0 ? plan : null);
    setDirty(true);
  };

  const applyImport = (imported: ShareExport): void => {
    if (!store) return;

    if (imported.kind === "workspace") {
      const next = importSharedWorkspace(store, imported);
      persist(next);
      applyDashboardMeta(
        getActiveDashboard(next),
        setLayout,
        setFeed,
        setTemplate,
        setPresentation,
        setMosaicPreset,
      );
      setDirty(false);
      return;
    }

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
        setMosaicPreset,
      );
    }
    setDirty(false);
  };

  const openImportDialog = (): void => {
    setImportJson("");
    setImportFilename(undefined);
    setImportPresetId(undefined);
    setImportOpen(true);
  };

  if (!store || !activeSpec) {
    return <div style={{ padding: 24, color: "#e2e8f0" }}>Loading workspace…</div>;
  }

  const activeDashboard = getActiveDashboard(store);
  const activeWorkspace = store.workspaces.find((item) => item.id === store.activeWorkspaceId);
  const canDeleteDashboard = (activeWorkspace?.dashboards.length ?? 0) > 1;
  const isTabularDashboard = activeSpec?.layout === "panels";
  const showPlannerPanels =
    !tabularUploadOpen &&
    !isTabularDashboard &&
    feed === "static" &&
    layout === "embed" &&
    (appliedPlan?.panels.length ?? 0) > 0;

  if (presenting && activeSpec) {
    return (
      <PresentationDeckRuntime
        spec={activeSpec}
        deck={builderMeta.presentationDeck}
        title={activeDashboard.name}
        onExit={() => setPresenting(false)}
        alarmScopeId={activeDashboard.id}
        alarmStorage={localStorage}
        adapterFixtureHref={resolveAdapterFixtureHref}
      />
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
          <div style={{ fontSize: 18, fontWeight: 700 }}>Axiboard</div>
          <div style={{ fontSize: 12, color: "#94a3b8" }}>
            Workspaces · saved dashboards · {dirty ? "unsaved changes" : activeDashboard.name}
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <AuthStatus />
          <label style={{ fontSize: 12, display: "inline-flex", gap: 8, alignItems: "center" }}>
            Layout
            <select
              value={isTabularDashboard ? "panels" : layout}
              onChange={(event) => {
                const next = event.target.value as LayoutMode;
                if (next === "panels") return;
                setLayout(next);
                setDirty(true);
              }}
              style={{ fontSize: 12, padding: "4px 8px", borderRadius: 6 }}
            >
              <option value="embed">Single embed</option>
              <option value="mosaic">Mosaic wall</option>
              {isTabularDashboard ? <option value="panels">Tabular panels</option> : null}
            </select>
          </label>
          {!isTabularDashboard ? (
            <label
              style={{
                fontSize: 12,
                display: "inline-flex",
                gap: 8,
                alignItems: "center",
                position: "relative",
              }}
            >
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
                <option value="rest">REST (mock)</option>
                <option value="mock-live">Mock-live (mock)</option>
                <option value="websocket">WebSocket (mock)</option>
                <option value="mqtt">MQTT (mock)</option>
                <option value="static">Static</option>
              </select>
              <a
                href={feedAdapterGalleryDeepLink(feed, layout)}
                target="_blank"
                rel="noreferrer"
                style={{ color: "#93c5fd", textDecoration: "none" }}
                title="Open adapter fixture in docs gallery"
              >
                Fixture
              </a>
              <FeedIntentGlossary
                feed={feed}
                layout={layout}
                onSelectFeed={(next) => {
                  setFeed(next);
                  setDirty(true);
                }}
              />
            </label>
          ) : null}
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
          {layout === "embed" && !isTabularDashboard ? (
            <TemplatePicker
              value={template}
              onChange={(value) => {
                setTemplate(value);
                setDirty(true);
              }}
              label="Template"
            />
          ) : layout === "mosaic" && !isTabularDashboard ? (
            <label style={{ fontSize: 12, display: "inline-flex", gap: 8, alignItems: "center" }}>
              Preset
              <select
                value={mosaicPreset}
                onChange={(event) => {
                  setMosaicPreset(event.target.value as MosaicPresetId);
                  setDirty(true);
                }}
                style={{ fontSize: 12, padding: "4px 8px", borderRadius: 6 }}
              >
                {listMosaicPresets().map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.label}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <button
            type="button"
            onClick={() => {
              setTabularEditCsv(undefined);
              setTabularUploadOpen(true);
            }}
            style={buttonStyle}
          >
            Upload CSV
          </button>
          {!isTabularDashboard ? (
            <button type="button" onClick={() => setPlannerOpen(true)} style={buttonStyle}>
              Plan
            </button>
          ) : null}
          {!isTabularDashboard ? (
            <button type="button" onClick={() => setPresenting(true)} style={buttonStyle}>
              Present
            </button>
          ) : null}
          <button type="button" onClick={() => setEmbedOpen(true)} style={buttonStyle}>
            Embed
          </button>
          <button type="button" onClick={handleSave} style={buttonStyle}>
            Save
          </button>
          <button type="button" onClick={handleExport} style={buttonStyle}>
            Export
          </button>
          <button type="button" onClick={openImportDialog} style={buttonStyle}>
            Import
          </button>
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
              setMosaicPreset,
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
          onRenameWorkspace={(name) => {
            persist(renameWorkspace(store, store.activeWorkspaceId, name));
          }}
          onShareWorkspace={handleShareWorkspace}
          onDeleteDashboard={handleDeleteDashboard}
        />
        <main style={{ flex: 1, padding: 24, maxWidth: tabularUploadOpen || isTabularDashboard ? 1200 : presentation ? 1100 : 900 }}>
          {tabularUploadOpen ? (
            <TabularUploadView
              onCancel={() => {
                setTabularUploadOpen(false);
                setTabularEditCsv(undefined);
              }}
              onApply={handleApplyTabularPlan}
              initialCsv={tabularEditCsv}
              initialPersona={activeDashboard.meta?.persona}
              initialFollowUpIntents={activeDashboard.meta?.followUpIntents}
            />
          ) : isTabularDashboard && isPanelsRuntimeSpec(activeSpec) ? (
            <TabularDashboardView
              panels={activeSpec.panels}
              meta={activeDashboard.meta}
              onPlanUpdate={handleTabularPlanUpdate}
              onEditSource={() => {
                setTabularEditCsv(activeSpec.panels.sourceCsv);
                setTabularUploadOpen(true);
              }}
            />
          ) : showPlannerPanels && appliedPlan ? (
            <PlannerPanelsWorkspace plan={appliedPlan} />
          ) : (
            <>
              <RuntimeDashboard
                spec={activeSpec}
                presentation={presentation}
                alarmScopeId={activeDashboard.id}
                alarmStorage={localStorage}
                adapterFixtureHref={resolveAdapterFixtureHref}
              />
              <PluginStrip />
            </>
          )}
        </main>
      </div>
      <PlannerPanel
        open={plannerOpen}
        serverUrl={PLANNER_URL}
        onClose={() => setPlannerOpen(false)}
        onApply={handleApplyPlan}
      />
      <EmbedDialog
        open={embedOpen}
        spec={activeSpec}
        presentation={presentation}
        alarmScopeId={activeDashboard.id}
        feed={feed}
        layout={layout}
        onClose={() => setEmbedOpen(false)}
      />
      <ShareDialog
        open={shareOpen}
        initialTab={shareTab}
        store={store}
        dashboard={activeDashboard}
        spec={activeSpec}
        meta={builderMeta}
        onClose={() => setShareOpen(false)}
      />
      <ImportDialog
        open={importOpen}
        initialJson={importJson}
        initialFilename={importFilename}
        initialPresetId={importPresetId}
        onClose={() => {
          setImportOpen(false);
          setImportPresetId(undefined);
        }}
        onApply={applyImport}
      />
    </div>
  );
}
