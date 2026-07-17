#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  formatValidationErrors,
  validateRuntimeSpecJson,
  type RuntimeValidationIssue,
} from "./runtimeValidation";
import {
  formatSchemaValidationErrors,
  validateRuntimeSpecSchemaJson,
  validateShareExportSchemaJson,
} from "./schemaValidation";
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

type ValidateLayer = "semantic" | "schema" | "all";

function hasFlag(args: string[], flag: string): boolean {
  return args.includes(flag);
}

function removeFlag(args: string[], flag: string): void {
  const index = args.indexOf(flag);
  if (index >= 0) {
    args.splice(index, 1);
  }
}

function usage(): string {
  return `charts-runtime — AxiCharts C4 runtime tooling

Usage:
  charts-runtime validate <file.runtime.json>
  charts-runtime validate --share <file.workspace.json>
  charts-runtime validate --schema <file.runtime.json>
  charts-runtime validate --all <file.runtime.json>
  charts-runtime schema [runtime-spec|share-export]

Flags:
  --share    Validate a dashboard or workspace share export envelope
  --schema   JSON Schema (draft-07) shape gate only
  --all      Run JSON Schema and semantic validation

Examples:
  charts-runtime validate packages/charts-runtime/examples/ops-mosaic.runtime.json
  charts-runtime validate --schema packages/charts-runtime/examples/ops-mosaic.runtime.json
  charts-runtime validate --all packages/charts-runtime/examples/ops-mosaic.runtime.json
  charts-runtime validate --share packages/charts-runtime/examples/ops-dashboard.share.json
  charts-runtime schema runtime-spec
`;
}

function mergeIssues(
  ...groups: RuntimeValidationIssue[][]
): RuntimeValidationIssue[] {
  const seen = new Set<string>();
  const merged: RuntimeValidationIssue[] = [];
  for (const group of groups) {
    for (const item of group) {
      const key = `${item.path}:${item.message}`;
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(item);
    }
  }
  return merged;
}

function validateInput(
  input: string,
  share: boolean,
  layer: ValidateLayer,
): { ok: true } | { ok: false; errors: RuntimeValidationIssue[] } {
  const schemaValidate = share ? validateShareExportSchemaJson : validateRuntimeSpecSchemaJson;
  const semanticValidate = share ? validateShareExportJson : validateRuntimeSpecJson;

  if (layer === "schema") {
    const result = schemaValidate(input);
    return result.ok ? { ok: true } : { ok: false, errors: result.errors };
  }

  if (layer === "semantic") {
    const result = semanticValidate(input);
    return result.ok ? { ok: true } : { ok: false, errors: result.errors };
  }

  const schemaResult = schemaValidate(input);
  const semanticResult = semanticValidate(input);
  const errors = mergeIssues(
    schemaResult.ok ? [] : schemaResult.errors,
    semanticResult.ok ? [] : semanticResult.errors,
  );
  return errors.length === 0 ? { ok: true } : { ok: false, errors };
}

export function runCli(argv: string[]): number {
  const args = [...argv];
  const share = hasFlag(args, "--share");
  const schemaOnly = hasFlag(args, "--schema");
  const allLayers = hasFlag(args, "--all");

  removeFlag(args, "--share");
  removeFlag(args, "--schema");
  removeFlag(args, "--all");

  if (schemaOnly && allLayers) {
    process.stderr.write("Use either --schema or --all, not both.\n\n");
    process.stderr.write(usage());
    return 1;
  }

  const layer: ValidateLayer = schemaOnly ? "schema" : allLayers ? "all" : "semantic";
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
  const result = validateInput(input, share, layer);

  if (!result.ok) {
    const formatter =
      layer === "schema" ? formatSchemaValidationErrors : formatValidationErrors;
    process.stderr.write(`${formatter(result.errors)}\n`);
    return 1;
  }

  process.stdout.write(layer === "all" ? "ok (schema + semantic)\n" : "ok\n");
  return 0;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  process.exitCode = runCli(process.argv.slice(2));
}
