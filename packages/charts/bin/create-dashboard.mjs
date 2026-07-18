#!/usr/bin/env node
import { pathToFileURL } from "node:url";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
await import(
  pathToFileURL(path.join(scriptDir, "../scripts/create-dashboard.mjs")).href
);
