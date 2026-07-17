export const VALIDATE_RUNTIME_CODE = `# Semantic validation (templates, adapter refs, dataSourceId)
charts-runtime validate packages/charts-runtime/examples/ops-mosaic.runtime.json

# Share export envelope
charts-runtime validate --share packages/charts-runtime/examples/ops-dashboard.share.json

# CI gate (all examples)
pnpm validate:runtime`;

export const SCHEMA_IMPORT_CODE = `// npm package subpaths
import runtimeSchema from "@axicharts/charts-runtime/schema/runtime-spec.json";
import shareSchema from "@axicharts/charts-runtime/schema/share-export.json";

// Hosted on GitHub Pages (after docs deploy)
// https://axidify.github.io/axicharts/schema/runtime-spec.schema.json`;

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
      - run: charts-runtime validate path/to/dashboard.runtime.json`;
