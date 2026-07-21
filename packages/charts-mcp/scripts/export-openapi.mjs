#!/usr/bin/env node
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "openapi");
mkdirSync(outDir, { recursive: true });

const { OPENAPI_TOOL_BUNDLE } = await import("../dist/openapi.js");
const outPath = join(outDir, "tools.bundle.json");
writeFileSync(outPath, `${JSON.stringify(OPENAPI_TOOL_BUNDLE, null, 2)}\n`);
process.stdout.write(`Wrote ${outPath} (${OPENAPI_TOOL_BUNDLE.length} tools)\n`);
