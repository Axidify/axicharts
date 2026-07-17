#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  formatValidationErrors,
  validateRuntimeSpecJson,
} from "./runtimeValidation";
import { validateShareExportJson } from "./workspace/share";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

export const RUNTIME_SPEC_SCHEMA_PATH = join(
  packageRoot,
  "schema/runtime-spec.schema.json",
);
export const SHARE_EXPORT_SCHEMA_PATH = join(
  packageRoot,
  "schema/share-export.schema.json",
);

function hasFlag(args: string[], flag: string): boolean {
  return args.includes(flag);
}

function usage(): string {
  return `charts-runtime — AxiCharts C4 runtime tooling

Usage:
  charts-runtime validate <file.runtime.json>
  charts-runtime validate --share <file.workspace.json>
  charts-runtime schema [runtime-spec|share-export]

Examples:
  charts-runtime validate packages/charts-runtime/examples/ops-mosaic.runtime.json
  charts-runtime validate --share packages/charts-runtime/examples/ops-dashboard.share.json
  charts-runtime schema runtime-spec
`;
}

export function runCli(argv: string[]): number {
  const args = [...argv];
  const share = hasFlag(args, "--share");
  if (share) {
    args.splice(args.indexOf("--share"), 1);
  }

  const [command, file] = args;

  if (!command || command === "--help" || command === "-h") {
    process.stdout.write(usage());
    return 0;
  }

  if (command === "schema") {
    const which = file ?? "runtime-spec";
    const path =
      which === "share-export" ? SHARE_EXPORT_SCHEMA_PATH : RUNTIME_SPEC_SCHEMA_PATH;
    process.stdout.write(`${readFileSync(path, "utf8")}\n`);
    return 0;
  }

  if (!file) {
    process.stderr.write(`Missing file argument for "${command}".\n\n${usage()}`);
    return 1;
  }

  if (command !== "validate") {
    process.stderr.write(`Unknown command "${command}".\n\n${usage()}`);
    return 1;
  }

  const input = readFileSync(file, "utf8");
  const result = share ? validateShareExportJson(input) : validateRuntimeSpecJson(input);

  if (!result.ok) {
    process.stderr.write(`${formatValidationErrors(result.errors)}\n`);
    return 1;
  }

  process.stdout.write("ok\n");
  return 0;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  process.exitCode = runCli(process.argv.slice(2));
}
