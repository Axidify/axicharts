# Changelog

All notable changes to published `@axicharts/*` packages are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Older release detail may also appear in [GitHub Releases](https://github.com/Axidify/axicharts/releases) and one-off `RELEASE-v*.md` notes in this repo.

## [Unreleased]

_Nothing yet._

## [0.4.37] - 2026-07-22

### Added

- **charts-planner** — `@axicharts/charts-planner/tabular` CJS bundle (`tabular.cjs`) for Nest/CJS static `require()` / import
- **charts-spec** — Tabular planner pie/donut intent on generic L4b path (`0.4.36` feature, documented in 0.4.37 matrix)
- **docs** — RFC-005 agent chat envelope freeze; Project Desk integration reply template

### Changed

- **charts-echarts** — peers `@axicharts/charts-spec` at platform minor (`^0.4.37`)
- **charts-planner** — `0.2.5`; README documents CJS `./tabular` entry

## [0.4.36] - 2026-07-22

### Added

- **charts-spec** — `toUserFacingHint()` / `toUserFacingHints()` for chat UI validation fallbacks (exported from main and `/planning`)
- **docs** — Agent chat integration guide (Nest + Next): tool result → adapter → envelope → lazy block; Jest/CJS testing section
- **docs** — Version matrix tested combo table (`spec@0.4.36` + `echarts@0.4.15` + `planner@0.2.4`)

### Changed

- **charts-planner** — README documents server entry points (`./tabular`, `./server`), Nest/CJS dynamic import pattern
- **charts-echarts** — peers `@axicharts/charts-spec` at platform minor

## [0.4.35] - 2026-07-21

### Added

- **charts-spec** — Agent 100% exit: `point` cartesian mark; `registerChartFamily` / `familyRegistry`; `composePanel`, `executeTransform`, `applyTransformPlans` (C178 BYOK); `getAgentSimulationSummaries` for docs
- **charts-spec** — `planShell` tabular path (no legacy `charts-spec` barrel — fixes Node ESM uPlot CSS)
- **charts-mcp** — `compose_panel`, `execute_transform`, `list_transform_ops`; OpenAPI bundle (`openapi/tools.bundle.json`); 14-tool pasteable schemas
- **charts-planner** — `validatePanelSpec` delegates to `validatePanel`; agent guard on `POST /plan`
- **axiboard** — C181 follow-up recipes, M1 golden script (`m1DemoScript.test.ts`); C178 BYOK `transformPlans[]` merge path
- **docs** — Agent cartesian tutorial, error gallery, MCP schemas page, simulation table, eject walkthrough, blocks playground `?preset=`

### Changed

- **charts-spec** — `DUPLICATE_OVERLAY_CHANNEL` errors in strict mode; waterfall ledger recipe → cartesian bridge; legacy profile planner removed from `/planning` entry
- **charts-canvas** — `showPoints` for `point` marks in uPlot combo
- **charts-runtime** — `PanelsDashboard` strict `agentValidated` gate

### Fixed

- **charts-planner** — Tabular planning no longer imports uPlot CSS via main `charts-spec` barrel (dev server + `dist-server` work again)

## [0.4.34] - 2026-07-21

### Added

- **charts-echarts** — full pie `62%` outer radius @ compact legend mode; sunburst/swarm/ridgeline catalog compact layouts
- **storybook** — pie + cartesian blocks parity rows; `Audit/Studio` wall; Lane C swarm/ridgeline/sunburst + plugins harness
- **docs** — Recharts reference index (**D-303**); visual CI pie/blocks/studio tiles

### Changed

- **docs** — pie **D-201**, cartesian blocks **D-105** → **Parity**; studio lane **D-310** → **Close**

## [0.4.33] - 2026-07-21

### Added

- **charts-echarts** — `nicheCompactLayout` for Lane C @ 280×140 analytics / 180×120 industrial (**D-401–D-408**)
- **charts-echarts** — boxplot/violin hide Y labels @ catalog; treemap hides cell labels; candlestick hides categories; liquid compact radius/label
- **charts** — gauge compact arc + value sizing @ industrial tiles (**D-405**)
- **storybook** — Lane C `Audit/Niche industrial` harness + visual CI snapshot
- **docs** — `/compare/design` Lane C wall

### Changed

- **charts** — `Stat` compact padding @ 72px strip (**D-106** → Parity)
- **charts** — `DataTable` infers warning tone from status labels (**D-107** → Parity)
- **docs** — Lane B **D-220–D-223** promoted to Parity; scatter/radar/histogram visual CI tiles (**D-301**)

## [0.4.32] - 2026-07-21

### Fixed

- **charts-canvas** — horizontal bar gutter: axis `size` only (no duplicate `padding.left`); 15-step value ticks @ compact tiles (**D-101** → Parity)

### Added

- **storybook** — Lane B `Audit/Dashboard adjacent` visual CI snapshot (**D-301**)

## [0.4.31] - 2026-07-21

### Added

- **charts-echarts** — compact layout helpers for funnel, waterfall, heatmap, and calendar @ 360×280 dashboard tiles
- **charts-echarts** — funnel percent labels; waterfall dense category rotation; heatmap hides cell labels @ compact; calendar short weekday letters
- **docs** — `/compare/design` Lane B harness rows **D-220–D-223** with CSS reference mocks

## [0.4.30] - 2026-07-21

### Added

- **charts-echarts** — scatter compact bottom legend; bubble `visualMap` shows formatted min/max
- **charts-echarts** — radar `startAngle: 90` + indicator order mirror for Recharts spoke parity; hide radial ticks @ compact
- **charts-echarts** — histogram `-25°` bin labels when bins ≥6 on compact tiles

### Changed

- **CI** — removed `size-limit` / `.size-limit.json` bundle budget gate

## [0.4.29] - 2026-07-21

### Added

- **charts** — `Stat` `unit` + `delta` chip (`StatDeltaChip`); narrow KPI layout @ 72px strip width
- **charts** — `DataTable` zebra rows, sticky header, `maxHeight` scroll, tabular-nums on numeric columns
- **charts-spec** — bar-only cartesian panels compile through `BarChart` (uPlot) for `encoding.color` fills
- **charts-canvas** — theme bar radius on all vertical/stacked bars; top-cap radius on stacks; compact gap sizing
- **charts-echarts** — radar bottom legend + lifted center; histogram compact bin label density
- **docs** — `/compare/design` Lane B harness (KPI strip, table) + scatter/radar/histogram parity rows

### Fixed

- **charts** — `BarChart` always uses canvas path so dashboard bars get radius, fills, and value labels
- **charts-spec** — boolean semantic `encoding.color` maps to success/warning (not critical) for throughput tiles

## [0.4.28] - 2026-07-21

### Fixed

- **charts-spec** — `createCartesianPanel` binds intent-named fields before revenue/target vocabulary; unresolved `of <field>` → `needsReview: "unresolved_field"`
- **charts-spec** — `"target line at N"` is a rule overlay, not the plotted series
- **charts-echarts** — Donut hole KPI centered via CSS overlay at pie center (D-201 alignment)

## [0.4.27] - 2026-07-21

### Added

- **charts-echarts** — Donut center hole KPI (`centerMetric`: `largest`, explicit value/label, or named `slice`)
- **charts-spec** — `props.centerMetric` on donut/distribution panels; `readPanelCenterMetric` resolver
- **charts** — `PieChart` `centerMetric` prop

### Fixed

- **storybook** — Recharts + Shadcn parity walls share `DONUT_PARITY_SPEC` @ 360×280 (matched colors, no duplicate in-tile title)

## [0.4.26] - 2026-07-21

### Added

- **charts-spec** — Matrix simulation suite (`runMatrixSimulations`, M01–M08) with `silent_bad === 0` CI gate
- **charts-spec** — `compilePanel` tests for legacy cartesian routing (encoding validation vs props-only panels)

### Fixed

- **charts-spec** — `line` / `area` / `bar` / `combo` panels with row encoding route through `normalizeToCartesian` + cartesian validation before compile; props-only legacy panels unchanged
- **charts-spec** — `validatePanel` fix-patch regression tests for distribution and matrix `UNKNOWN_FIELD`

## [0.4.25] - 2026-07-21

### Added

- **charts-spec** — Matrix family (RFC-004 C186–C188): `cell`, `colorScale`, `axis` marks; validate, normalize, compile, `createMatrixPanel`
- **charts-spec** — Legacy `heatmap` → `type: "matrix"` + `marks[]`; tabular heatmap intent → validated matrix panels
- **charts-mcp** — `create_panel` / `validate_panel` / `list_marks` dispatch `family: "matrix"`
- **docs** — `/guides/agent-families` — 5-minute MCP tutorial for cartesian, distribution, and matrix
- **charts-mcp** — `agent-skills/families/SKILL.md` unified agent workflow

### Fixed

- **charts-spec** — `Chart` validates matrix family before compile
- **charts-spec** — Local `HeatmapMatrix` type in `heatmapEncoding` (DTS build without `charts-echarts` import)

## [0.4.24] - 2026-07-21

### Added

- **charts-spec** — RFC-004 C180 orchestrator: `resolvePanelFamily`, `validatePanel`, `createPanel`, `listMarks`
- **charts-spec** — Distribution family (C181–C185): `arc`, `funnel`, `donut`, `cell`, `label` marks; validate, normalize, compile, eject, simulation
- **charts-spec** — Tabular stage funnel → `type: "distribution"` + `funnel` mark; `classifyTabularPanelAgentStatus` with `TIER2_PANEL` for waterfall/legacy charts
- **charts-mcp** — Tier-0 tools `create_panel`, `validate_panel`, `list_marks` (cartesian aliases retained)
- **charts-runtime** — `PanelsDashboard` `agentValidated` enabled on Axiboard tabular + panels layout paths
- **axiboard** — Profile planner gated behind `VITE_ENABLE_PROFILE_PLANNER` (M1 uses tabular orchestrator only)

### Fixed

- **charts-spec** — `ValidationIssue.fix` patch on cartesian `UNKNOWN_FIELD` for agent self-correction
- **charts-spec** — `Chart` validates cartesian and distribution families before compile

## [0.4.23] - 2026-07-20

### Added

- **docs** — `/compare/design` Recharts vs AxiCharts parity wall @ 360×280 with per-chart feedback
- **docs** — `chart-design-language.md` and `chart-design-audit.md` (parity matrix, D-xxx backlog)
- **storybook** — `Compare/Design parity`, horizontal bar, and design audit stories
- **charts-spec** — `panelOrientation` helper; stacked-bar and donut compilePanel regression tests
- **benchmarks** — Visual CI snapshots for design parity and horizontal bar tiles

### Fixed

- **charts-echarts** — Donut/pie @ dashboard tiles: bottom legend with `Name 48%`, no hover scale jitter, flush segment edges (no rounded “putty” caps)
- **charts** — Stacked bars render on canvas (true stacking); flow legend below plot; centered legend alignment
- **charts-canvas** — Horizontal bar renderer (rounded caps, value grid, semantic `encoding.color`, stack totals)
- **charts-spec** — `resolvePanelHeight` reserves 23px for `spec.title`; nominal color encoding on compile path
- **charts** — Cartesian plot layout subtracts legend height so labels don’t overlap series names

See [RELEASE-v0.4.23.md](./RELEASE-v0.4.23.md).

## [0.4.22] - 2026-07-20

### Added

- **charts-theme** — Chrome contrast utilities (`resolveCanvasRgb`, `looksLikeRgbInHsl`, `sanitizeChromeToken`)
- **charts-spec** — `nominalColorMap` for priority/status/stage label → semantic bar fills
- **storybook** — `Compare/Composition priority` repro (AxiCharts spec path vs Recharts)

### Fixed

- **charts-theme** — Malformed host `hsl()` chrome tokens no longer paint yellow grids or pink axes; explicit `theme.tokens` grid/axis override document `--chart-*` vars
- **charts-canvas** — `chromeGridStroke()` sanitizes host grid colors and applies theme opacity
- **charts** — `ChartContainer` `inheritThemeTokens` prop; softer `cleanTheme` grid opacity
- **charts-spec** — Planner/compile path emits `encoding.color` for priority/status dimensions; gates horizontal bar geometry until uPlot horizontal renderer ships

See [RELEASE-v0.4.22.md](./RELEASE-v0.4.22.md).

## [0.4.21] - 2026-07-20

### Added

- **docs** — Dashboard card grid guidance (`minHeight` = plot budget, legend below plot, `emptyMessage`)

### Fixed

- **charts** — Multi-series legend renders below the plot; `minHeight` is the plot area budget so grid cards stay aligned
- **charts** — All-zero cartesian series show built-in empty state (respects `emptyMessage` on `ChartContainer`)
- **charts** — `ChartContainer` `config` keys matching category labels apply per-bar fills for single-series bar charts

See [RELEASE-v0.4.21.md](./RELEASE-v0.4.21.md).

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
