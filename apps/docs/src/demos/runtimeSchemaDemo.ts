export const VALIDATE_RUNTIME_CODE = `# Semantic validation (templates, adapter refs, dataSourceId)
charts-runtime validate packages/charts-runtime/examples/ops-mosaic.runtime.json

# JSON Schema shape gate (draft-07)
charts-runtime validate --schema packages/charts-runtime/examples/ops-mosaic.runtime.json

# Dual gate — schema + semantic (CI default)
charts-runtime validate --all packages/charts-runtime/examples/ops-mosaic.runtime.json

# Share export envelope
charts-runtime validate --share packages/charts-runtime/examples/ops-dashboard.share.json
charts-runtime validate --share --all packages/charts-runtime/examples/ops-dashboard.share.json

# Shipped import presets (auto-detects runtime vs share)
charts-runtime validate --preset ops-embed
charts-runtime validate --preset ops-embed --all
charts-runtime validate --preset ops-dashboard --all

# CI gate (all shipped presets via --preset)
pnpm validate:runtime`;

export const SCHEMA_IMPORT_CODE = `// npm package subpaths
import runtimeSchema from "@axicharts/charts-runtime/schema/runtime-spec.json";
import shareSchema from "@axicharts/charts-runtime/schema/share-export.json";

// Hosted on GitHub Pages (after docs deploy)
// https://axidify.github.io/axicharts/schema/runtime-spec.schema.json`;

export const EDITOR_VSCODE_SETTINGS = `{
  "json.schemas": [
    {
      "fileMatch": ["*.runtime.json"],
      "url": "https://axidify.github.io/axicharts/schema/runtime-spec.schema.json"
    },
    {
      "fileMatch": ["*.share.json", "*.workspace.json"],
      "url": "https://axidify.github.io/axicharts/schema/share-export.schema.json"
    }
  ]
}`;

export const EDITOR_RUNTIME_HEADER = `{
  "$schema": "https://axidify.github.io/axicharts/schema/runtime-spec.schema.json",
  "layout": "embed",
  "dashboard": {
    "template": "ops-2x2",
    "title": "Line 3"
  }
}`;

export const EDITOR_SHARE_HEADER = `{
  "$schema": "https://axidify.github.io/axicharts/schema/share-export.schema.json",
  "version": 1,
  "kind": "dashboard",
  "exportedAt": "2026-01-01T00:00:00.000Z",
  "name": "Line 3",
  "spec": {
    "layout": "embed",
    "dashboard": { "template": "ops-2x2", "title": "Line 3" }
  }
}`;

export const EDITOR_SHARE_WITH_META_HEADER = `{
  "$schema": "https://axidify.github.io/axicharts/schema/share-export.schema.json",
  "version": 1,
  "kind": "dashboard",
  "exportedAt": "2026-01-01T00:00:00.000Z",
  "name": "Line 3",
  "meta": {
    "layout": "embed",
    "feed": "rest",
    "template": "ops-2x2",
    "presentation": false
  },
  "spec": {
    "layout": "embed",
    "dashboard": {
      "template": "ops-2x2",
      "title": "Line 3",
      "mode": "live",
      "dataSource": { "type": "rest", "url": "/api/metrics", "intervalMs": 2000 }
    }
  }
}`;

export const SHARE_META_FIELD_ROWS = [
  { field: "layout", type: "embed | mosaic", description: "Builder layout mode restored on import" },
  {
    field: "feed",
    type: "static | historian | rest | websocket | mqtt | mock-live",
    description: "Planner feed intent — maps to gallery adapter fixtures",
  },
  { field: "template", type: "string", description: "charts-spec template id (e.g. ops-2x2)" },
  {
    field: "mosaicPreset",
    type: "string",
    description: "Named mosaic wall preset when layout is mosaic",
  },
  { field: "presentation", type: "boolean", description: "Presentation mode flag for embed chrome" },
] as const;

/** Share/import hardening track (C44–C46) — docs + Dashboarder cross-links. */
export const SHARE_IMPORT_TRACK_RELEASE_NOTES = [
  {
    slice: "C44",
    summary: "Deep-link share-import round-trip table, EmbedDialog share-export hint",
  },
  {
    slice: "C45",
    summary: "Schema share-meta block, ShareDialog/ImportDialog ShareImportDocsLinks",
  },
  {
    slice: "C46",
    summary: "RuntimeHubNav schema share-meta anchor, share-import track wrap-up notes",
  },
  {
    slice: "C47",
    summary: "Import gallery share-import track section, share meta import tests",
  },
  {
    slice: "C48",
    summary: "Start page share-import cross-link, RuntimeHubNav import gallery anchor",
  },
] as const;

export const GITOPS_CODE = `name: Validate dashboards
on: [pull_request]
jobs:
  runtime-spec:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - run: pnpm validate:runtime
      - run: charts-runtime validate --preset ops-embed --all
      - run: charts-runtime validate --preset ops-dashboard --all
      - run: charts-runtime validate --all path/to/dashboard.runtime.json`;
