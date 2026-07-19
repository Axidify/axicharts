#!/usr/bin/env bash
# Copy to ~/.cursor/run-charts-mcp.sh and chmod +x.
# Launches @axicharts/charts-mcp from a local axicharts clone for Cursor.
set -euo pipefail

AXICHARTS_ROOT="${AXICHARTS_ROOT:-$HOME/Projects/axicharts}"

if [[ ! -d "$AXICHARTS_ROOT/packages/charts-mcp" ]]; then
  echo "charts-mcp: AXICHARTS_ROOT not found at $AXICHARTS_ROOT" >&2
  exit 1
fi

cd "$AXICHARTS_ROOT"

if [[ ! -f packages/charts-mcp/dist/cli.js ]]; then
  pnpm --filter @axicharts/charts-mcp build >&2
fi

exec node packages/charts-mcp/dist/cli.js
