#!/usr/bin/env node
/**
 * CI gate: @axicharts/charts, charts-core, and charts-theme must share the same version.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const LOCKSTEP = [
  "packages/charts/package.json",
  "packages/charts-core/package.json",
  "packages/charts-theme/package.json",
];

function readVersion(rel) {
  const pkg = JSON.parse(readFileSync(path.join(root, rel), "utf8"));
  return pkg.version;
}

const versions = LOCKSTEP.map((rel) => ({ rel, version: readVersion(rel) }));
const unique = [...new Set(versions.map((v) => v.version))];

if (unique.length !== 1) {
  console.error("Version lockstep check failed — charts + charts-core + charts-theme must match:");
  for (const { rel, version } of versions) {
    console.error(`  ${rel}: ${version}`);
  }
  process.exit(1);
}

console.log(`Version lockstep OK: ${unique[0]} (${LOCKSTEP.length} packages)`);
