# Release v0.4.17 — C168 Postgres + C169 auth

App-only release. Published `@axicharts/*` packages remain at **0.4.16** (no engine changes).

## Axiboard app (monorepo)

- **C168** — Optional Postgres workspace store (`AXIBOARD_DATABASE_URL`); docker compose `--profile postgres`
- **C169a** — Zod validation on orchestrator + workspace POST bodies
- **C169** — Token auth (`AXIBOARD_AUTH_*`); per-user workspace + encrypted BYOK; `AuthGate` UI

## Packages

| Package | Version |
|---------|---------|
| `@axicharts/charts` (+ platform siblings) | **0.4.16** (unchanged) |
| `@axicharts/charts-planner` | **0.2.2** (unchanged) |
| `@axicharts/charts-mcp` | **0.1.2** (unchanged) |
