# Axiboard app

Reference implementation for the tabular agent dashboard — React UI + orchestrator API.

## Development

```bash
pnpm --filter @axicharts/axiboard dev
# → http://localhost:3000
# API: /api/orchestrator/* (Vite dev middleware)
```

## Production (C162)

Build the SPA and server bundle, then start Node:

```bash
pnpm --filter @axicharts/axiboard build
pnpm --filter @axicharts/axiboard start
# → http://0.0.0.0:3000
```

| Variable | Default | Purpose |
|----------|---------|---------|
| `PORT` | `3000` | HTTP listen port |
| `HOST` | `0.0.0.0` | Bind address |
| `AXIBOARD_STATIC_DIR` | `dist/` next to server bundle | Vite build output |
| `AXIBOARD_DATA_DIR` | `./data` (cwd) | Workspace JSON file persistence (default) |
| `AXIBOARD_DATABASE_URL` | — | Optional Postgres URL; overrides file store when set |
| `DATABASE_URL` | — | Fallback Postgres URL (e.g. Railway/Heroku) |
| `OPENAI_API_KEY` | — | Optional server default LLM key |
| `OPENAI_MODEL` | — | Optional model override |
| `OPENAI_BASE_URL` | — | Optional OpenAI-compatible base URL |
| `AXIBOARD_AUTH_SECRET` | — | HMAC secret (≥16 chars); enables signed cookie sessions when set |
| `AXIBOARD_AUTH_ENABLED` | auto | Set `true` to require auth (defaults on when secret is set) |
| `AXIBOARD_AUTH_TOKENS` | — | Comma-separated `userId:token` pairs for login |

When auth is enabled, workspaces and BYOK keys are scoped per `userId`. Without auth, all requests use the `default` user.

Users can still BYOK via `POST /api/orchestrator/byok` and `x-axiboard-session`.

### API routes

| Method | Path |
|--------|------|
| `GET` | `/api/orchestrator/health` |
| `POST` | `/api/orchestrator/byok` |
| `POST` | `/api/orchestrator/plan` |
| `POST` | `/api/orchestrator/chat` |
| `GET` | `/api/workspaces` |
| `POST` | `/api/workspaces` |
| `GET` | `/api/auth/me` |
| `POST` | `/api/auth/login` |
| `POST` | `/api/auth/logout` |

## Docker

From monorepo root:

```bash
docker build -f apps/axiboard/Dockerfile -t axiboard:local .
docker run -p 3000:3000 -e OPENAI_API_KEY=sk-... axiboard:local
```

Or with compose (file persistence):

```bash
docker compose -f apps/axiboard/docker-compose.yml up --build
```

Postgres persistence (compose profile):

```bash
docker compose -f apps/axiboard/docker-compose.yml --profile postgres up --build
```
