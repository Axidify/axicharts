#!/usr/bin/env node
import { pathToFileURL } from "node:url";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const { runCreateDashboardCli } = await import(
  pathToFileURL(path.join(scriptDir, "../scripts/create-dashboard.mjs")).href
);

runCreateDashboardCli().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
