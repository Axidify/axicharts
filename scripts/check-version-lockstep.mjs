#!/usr/bin/env node
/**
 * CI gate:
 * - Platform packages share the same version (charts, core, theme, spec, runtime, full)
 * - @axicharts/charts-planner peers @axicharts/charts-spec at the platform minor
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const PLATFORM_PACKAGES = [
  "packages/charts/package.json",
  "packages/charts-core/package.json",
  "packages/charts-theme/package.json",
  "packages/charts-spec/package.json",
  "packages/charts-runtime/package.json",
  "packages/charts-full/package.json",
];

function readPkg(rel) {
  return JSON.parse(readFileSync(path.join(root, rel), "utf8"));
}

function readVersion(rel) {
  return readPkg(rel).version;
}

function parseMinor(version) {
  const match = /^(\d+)\.(\d+)/.exec(version);
  if (!match) return null;
  return `${match[1]}.${match[2]}`;
}

const versions = PLATFORM_PACKAGES.map((rel) => ({ rel, version: readVersion(rel) }));
const unique = [...new Set(versions.map((v) => v.version))];

if (unique.length !== 1) {
  console.error("Version lockstep check failed — platform packages must match:");
  for (const { rel, version } of versions) {
    console.error(`  ${rel}: ${version}`);
  }
  process.exit(1);
}

const platformVersion = unique[0];
const platformMinor = parseMinor(platformVersion);
const plannerPkg = readPkg("packages/charts-planner/package.json");

const plannerPeer = plannerPkg.peerDependencies?.["@axicharts/charts-spec"];
if (!plannerPeer) {
  console.error(
    "Version lockstep check failed — @axicharts/charts-planner must declare peerDependency on @axicharts/charts-spec",
  );
  process.exit(1);
}

if (!plannerPeer.includes(platformMinor)) {
  console.error(
    `Version lockstep check failed — charts-planner peer (${plannerPeer}) must include platform minor ${platformMinor} (platform ${platformVersion})`,
  );
  process.exit(1);
}

console.log(
  `Version lockstep OK: platform ${platformVersion} (${PLATFORM_PACKAGES.length} packages); planner peer ${plannerPeer}`,
);
