#!/usr/bin/env node
/**
 * Guard against Vite alias regressions: apps must use axichartsMonorepoAliases()
 * so subpath exports resolve to entry/*.ts, not colliding src/ directories.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const appsDir = path.join(root, "apps");

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) {
      if (name === "node_modules" || name === "dist") continue;
      walk(full, out);
      continue;
    }
    if (/vite(\..*)?\.ts$/.test(name) || name === "main.ts") {
      out.push(full);
    }
  }
  return out;
}

const offenders = [];
for (const file of walk(appsDir)) {
  const text = readFileSync(file, "utf8");
  if (!text.includes("@axicharts/charts-spec")) continue;
  if (!text.includes("axichartsMonorepoAliases")) {
    offenders.push(path.relative(root, file));
  }
}

if (offenders.length > 0) {
  console.error(
    "Vite alias check failed — use axichartsMonorepoAliases() from scripts/vite-monorepo-aliases.ts:\n",
    offenders.map((f) => `  - ${f}`).join("\n"),
  );
  process.exit(1);
}

console.log("Vite alias check passed.");
