# Changelog

All notable changes to published `@axicharts/*` packages are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Older release detail may also appear in [GitHub Releases](https://github.com/Axidify/axicharts/releases) and one-off `RELEASE-v*.md` notes in this repo.

## [Unreleased]

_Nothing yet._

## [0.4.20] - 2026-07-20

### Added

- **render-sandbox** — Stacked bar totals, pie @ 360px, tank + andon plugin scenarios
- **Storybook** — `Audit/Render` stories for compact dashboard visual CI
- **docs** — `render-audit.md` tracker for dashboard embed quality (R-001–R-204)

### Fixed

- **charts-canvas** — Stacked bar stack totals when `showValues` is enabled; wider ordinal bars for 9–12 categories; `overflow: visible` on uPlot chart roots
- **charts** — Legend height parity in compact mode; dual-axis overlay right inset; Stat responsive scaling at 72px; DataTable ellipsis; `ComboPlot` `compact` prop regression
- **charts-echarts** — Compact tile grid margins via `isCompactTile` (360px axiboard tiles)
- **charts-spec** — `resolvePanelHeight` plot minimums; `digital` / `status-lamp` compile paths; auto-register `tank` / `andon` in `registerPluginChartTypes`

See [RELEASE-v0.4.20.md](./RELEASE-v0.4.20.md).

## [0.4.19] - 2026-07-19

### Added

- **C173–C175** — `suggestAnalyticsFromProfile` generic tabular compose path in `planDashboardFromRows`
- **C176** — Agent compose dashboards: project tasks, support cases, device telemetry, incidents (`compose*Dashboard`)
- **C177** — `composeLayout` — KPI strip + chart grid + table pinning for tabular plans
- **C180** — `extractTabularFromMessage` — parse markdown tables from chat messages
- **charts-runtime** — `KpiFlipCard` — flip KPI cards to show agent rationale
- **render-sandbox** — `pnpm render-sandbox` visual harness for compact dashboard layouts (http://localhost:3010)

### Fixed

- **charts-canvas** — Categorical bar charts in compact tiles: padded ordinal x-scale, wider bars for few categories, label ellipsis instead of hard clip (`categoricalScale`, `axisCategoryLabel`, `UPlotBar`/`UPlotCombo`/`UPlotLine`)
- **charts-spec** — `applyKpiToRecipe` only overwrites KPIs in `KPI_FIELD_MAP` (fixes generic `Rows` KPI showing 0)
- **charts-spec** — `suggestAnalyticsFromProfile` skips ID dimensions where cardinality equals row count

### Axiboard app (monorepo, not npm)

- **C179** — Chat-first workspace shell (thread, paste, split pane, welcome samples)
- **C181** — Orchestrator refinement intent fixes; golden tests for tabular compose paths
- Sample starters: inventory, ledger, project tasks, support cases, IoT sensors

See [RELEASE-v0.4.19.md](./RELEASE-v0.4.19.md).

## [0.4.18] - 2026-07-19

### Added

- **C170** — `PANEL_BUDGET` caps in `planDashboardFromRows`; ledger category/payment-method ordering in recipes
- **C171** — `columns` / `gap` on `PanelsDashboardSpec`; CSS grid chart layout in `PanelsDashboard`
- **C172** — `layout: "hybrid"` — tabular panels + live mosaic wall (`HybridDashboard`); example `ops-tabular-hybrid.runtime.json`

### Axiboard app (monorepo, not npm)

- **C170** — `AuthStatus` sign-out in app header when auth enabled

## [0.4.17] - 2026-07-19

### Axiboard app (monorepo, not npm)

- **C168** — Optional Postgres workspace persistence (`AXIBOARD_DATABASE_URL`); compose `--profile postgres`
- **C169a** — Zod schemas for `/api/orchestrator/*` and workspace POST
- **C169** — Token auth with signed cookies; per-user workspace + BYOK; `AuthGate` login UI

See [RELEASE-v0.4.17.md](./RELEASE-v0.4.17.md).

## [0.4.16] - 2026-07-19

### Added

- **C167** — Panels spec persists `decisions` and round-trips through workspace JSON validation

### Changed

- **charts-spec** — Agent integration tests use `planDashboardFromRows` (removed app-local `agentPlan*` imports)

### Fixed

- **charts-spec** — `tsconfig.json` `noEmit: true` — fixes IDE TS5055 when `dist/` exists alongside `src/`

### Axiboard app (monorepo, not npm)

- **C167** — `TabularUploadView` replaces R&D flow; orchestrator-only (no `/api/rnd`)
- **C167** — `DecisionLog` on upload + saved dashboard; legacy `src/rnd/*` removed
- **C167** — Workspace is the only tabular persistence layer

See [RELEASE-v0.4.16.md](./RELEASE-v0.4.16.md).

## [0.4.15] - 2026-07-19

### Added

- **C166** — `layout: "panels"` on `RuntimeDashboardSpec` — `PanelsDashboardSpec` with KPI/chart blocks and per-panel rows
- **C166** — `PanelsDashboard` component; runtime validation for tabular panels layout
- **C166** — Presentation deck inference for panels layout

### Fixed

- **CI** — Centralized Vite monorepo aliases (`scripts/vite-monorepo-aliases.ts`) + `check:vite-aliases` gate; renamed internal `planning/` → `tabularPlanning/` to avoid subpath collision

### Axiboard app (monorepo, not npm)

- **C166** — Apply tabular orchestrator plan to main workspace; `TabularDashboardView` with chat follow-ups
- **C166** — Persist `sourceCsv`, persona, and follow-up intents in dashboard meta

See [RELEASE-v0.4.15.md](./RELEASE-v0.4.15.md).

## [0.4.14] - 2026-07-19

### Added

- **C165** — `profileTabular` — `grain`, `cardinalities`, `timeSpan` on `DataProfile`; wired into `planDashboardFromRows`, `rankQuestions`, and `inferChartGeometry`
- **C165** — MCP `describe_data_profile` returns L1 profile fields
- **C164** — `classifyTabularDomain` decision step with confidence in planner log
- **C162** — `@axicharts/charts-spec/planning` and `@axicharts/charts-planner/tabular` exports (server-safe, no uPlot CSS)
- **C161** — Golden contract tests (`apps/axiboard/server/golden/`) — MCP `plan_dashboard` ≡ orchestrator plan

### Axiboard app (monorepo, not npm)

- **C162** — Production server + Docker (`pnpm start`, `dist-server/`)
- **C163** — Workspace + R&D session persistence API
- **C164** — Unified tabular upload UX (`TabularRndView`)

See [RELEASE-v0.4.14.md](./RELEASE-v0.4.14.md).

## [0.1.2] - 2026-07-19

### Added

- **C165** — `describe_data_profile` returns `grain`, `timeSpan`, `cardinalities` when rows provided

## [0.2.2] - 2026-07-19

### Added

- **C162** — `./tabular` export — `planDashboardFromRows` without main index / uPlot CSS chain

## [0.1.1] - 2026-07-19

### Added

- **C159** — `plan_dashboard` uses `planDashboardFromRows` (C157) — compiled KPIs, charts, full decision log
- **C159** — MCP `persona` + `followUpIntents` on `plan_dashboard` (server schema wired)
- `planDashboardMcp` helper — structured MCP payload with `summary.needsReview`

## [0.4.13] - 2026-07-19

### Added

- **C157** — `planDashboardFromRows(rows, options)` unified tabular planner (L2–L5 pipeline)
- **C157** — `enrichTabular` / `enrichSales` / `enrichLedger` / `enrichAttendance` in charts-spec
- **C157** — `applyRecipeData` binds enriched datasets to panel recipes per question id
- **charts-planner** — `planDashboardFromRows` wrapper adds `planFromIntent` dashboard shell
- R&D `agentPlan*` scripts thinned to wrappers over unified planner

## [0.4.12] - 2026-07-19

### Added

- **C158** — `PanelRecipe`, `inferChartGeometry`, `questionToRecipe`, `compileRecipe`
- Chart geometry: time → line, stage → funnel, nominal → bar, KPI → stat, audit → table
- Sales R&D dashboard uses `compileRecipe` (pipeline by stage renders as funnel)

## [0.4.11] - 2026-07-19

### Added

- **C156** — `Persona`, question catalogs (sales / ledger / attendance), `rankQuestions`, `findQuestionsForIntent`
- **C156** — `inferPersonaFromIntent` / `resolvePersona`
- R&D views — Audience (`Persona`) selector; agent decision log shows ranked questions
- MCP `plan_dashboard` — optional `persona`; returns `domain` + `questions`

## [0.4.10] - 2026-07-19

### Added

- **C155** — `classifyTabularDomain`, `enrichProfileWithDomain` — data-driven vertical from field names + roles
- `resolveVerticalId` falls back to domain classifier when intent/tags absent
- MCP `describe_data_profile` returns `domain` block
- `profileFromCsv` returns domain semantics; `planFromCsv` auto-tags metrics

## [0.4.9] - 2026-07-19

### Added

- **C154** — `salesRulePack` for CRM / pipeline dashboards
- R&D sales pipeline spike in `apps/axiboard` (`SalesRndView`, enrich + interpreter + agent plan)

### Fixed

- **C154** — `inferFieldRoles` treats `Opportunity ID` as identifier, `Expected Close` as time, `Probability` as measure
- **C154** — `parseTabular` coerces percent strings (`70%` → `70`)

## [0.4.8] - 2026-07-19

### Added

- **C153** — `attendanceRulePack` for HR / timesheet dashboards
- R&D attendance spike in `apps/axiboard` (`AttendanceRndView`, enrich + interpreter + agent plan)

### Fixed

- **C153** — `inferFieldRoles` treats `Hours` as measure (not time); `Employee ID` as identifier

## [0.4.7] - 2026-07-19

### Added

- **C149** — stacked multi-series bars via `yFields` + debit/credit intent in `createCartesianPanel`
- **C150** — `createTablePanel` for transaction / row-preview panels
- **C152** — `parseTabular`, `aggregateRows.where`, `planFromCsv` (charts-planner)
- **charts-mcp** — `create_table_panel`, `plan_dashboard`; `describe_data_profile` uses `inferFieldRoles`
- **axiboard** — C151 `PlannerPanelsWorkspace` renders planner `plan.panels` on static feed

## [0.4.6] - 2026-07-19

### Fixed

- **C147e** — `DashboardEmbed` / `useDataSource` stable with static `dashboard.data` (no reconnect loop on inline spec objects); `dataSourceSpecKey` for serializable adapter identity

## [0.4.5] - 2026-07-19

### Added

- **C147d** — Version matrix guide at `/guides/versions` (planner ↔ spec ↔ charts-full ↔ runtime combos)

### Changed

- `pnpm check:versions` — lockstep includes charts-spec, charts-runtime, charts-full
- `create-dashboard` — scaffold `package.json` pins `^<platform>` instead of `latest`

## [0.4.4] - 2026-07-19

### Fixed

- `create-dashboard` CLI — bin calls `runCreateDashboardCli` explicitly (fixes npx silent no-op); `.` resolves to cwd; success prints file list
- Planner/spec version split — `@axicharts/charts-planner@0.2.1` peers `@axicharts/charts-spec@^0.4.3` (no nested spec `0.3.52`)

### Changed

- `pnpm check:versions` — planner peer must include platform minor; charts-spec version must match platform
- Troubleshooting docs — planner + spec version matrix

## [0.4.3] - 2026-07-19

### Fixed

- **C147a** — Empty-safe first paint for cartesian panels: loading shell via `ChartContainer` `dataState="loading"` instead of `EMPTY_DATA` throw; static `useDataSource` seeds on first render; `mergeDashboardData` preserves seed rows
- **C147b** — Planner infers `encoding.x.field` from data profile (`week`/`date`/…) via `inferCategoryFieldFromProfile`, not hardcoded `"time"`

## [0.4.2] - 2026-07-19

### Added

- Generic `ChartPointerEvent<TMeta>` and `ChartCategoryInput<TMeta>` for typed category `meta` (no cast in handlers)
- Start here docs: chart-as-filter snippet with typed imports; troubleshooting note on zero/flat-week click policy (app-owned)

## [0.4.1] - 2026-07-19

### Fixed

- Export `ChartPointerEvent` (and `ChartCategoryInput`, `ChartSeriesInput`, `buildChartPointerEvent`, `normalizeChartCategories`) from the main `@axicharts/charts` barrel — previously only via `/cartesian`

## [0.4.0] - 2026-07-19

Adoption track C141–C146 — see [RELEASE-v0.4.0.md](./RELEASE-v0.4.0.md) for full notes.

### Added

- **C144** — `ChartPointerEvent`, `onCategoryClick` / `onSeriesClick` on `LineChart` and `BarChart`; `categories` with `meta`; keyboard parity
- **C143** — Docs theme playground with token glossary and `createTheme` export snippet
- **C145** — Agent cartesian guide (`/guides/agent-cartesian`)
- **C146** — `pnpm check:versions` lockstep CI; Built with AxiCharts badge page; flat-zero series caption
- **C141–C142** — Docs front door (start here, benchmarks, troubleshooting, import cheat sheet)

### Changed

- Core chart packages **0.3.52 → 0.4.0**
- `@axicharts/charts-echarts` size budget **20 KB → 20.1 KB** (measured +85 B)

### Fixed

- `CategoryClickOverlay` DTS build (`nativeEvent` typed as DOM `Event`)
- Docs `typecheck` clean (PluginsPage `TankChart` import, demo duplicate props, `StatTone`)
- JSON Schema export: `cartesian-panel.schema.json` and `data-profile.schema.json` via `pnpm export:schemas`
- Storybook HMR: idempotent builtin dashboard template registration

## [0.3.52] - 2026-07-19

RFC-002 cartesian agent loop — see [RELEASE-v0.3.52.md](./RELEASE-v0.3.52.md) for full notes.

### Added

- `type: "cartesian"` panel spec with composable `marks[]` (C136–C137)
- `validateCartesianSpec` with structured error codes and field suggestions
- `CartesianChart` composable shell and composable eject path
- Blocks Playground in Storybook — live spec ↔ chart ↔ JSX eject (C138)
- Planner rule packs emit `cartesian` + `marks[]`; `createCartesianPanel`, `reviseCartesianPanel` (C139)
- `@axicharts/charts-mcp@0.1.0` — MCP tools for cartesian panel compose, validate, revise, compile (C140)
- UPlotCombo stacked bar rendering when marks share a `stack` id

### Changed

- `@axicharts/charts-planner` **0.2.0** — cartesian-only planner emits
- Core chart packages **0.3.50 → 0.3.52**

### Fixed

- Gauge presentation overlap on light surfaces
- Pie chart palette cycling and gap-free segment rendering
- Pictorial bar crash on invalid `SeriesTone`
- `showValues` typing on cartesian panel spec (`PanelSpec`)
