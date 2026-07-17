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

# CI gate (all examples)
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
      - run: charts-runtime validate --all path/to/dashboard.runtime.json`;
