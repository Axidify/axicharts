#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { parseDataProfileFile } from "@axicharts/charts-spec";
import { planFromIntent, planFromProfile } from "./plan";
import { createPlannerServer } from "./server-entry";

function readArgFlag(args: string[], flag: string): string | undefined {
  const index = args.indexOf(flag);
  if (index === -1) return undefined;
  return args[index + 1];
}

function usage(): string {
  return `charts-planner — AxiCharts Phase 3 server-side planner

Usage:
  charts-planner plan <profile.json> [--intent "Line 3 night shift"] [--out plan.json]
  charts-planner serve [--port 3921] [--host 127.0.0.1]

Examples:
  charts-planner plan examples/ops.profile.json --intent "Line 3 night shift overview"
  charts-planner serve --port 3921
`;
}

export function runCli(argv: string[]): number {
  const [command, file, ...rest] = argv;

  if (!command || command === "--help" || command === "-h") {
    process.stdout.write(usage());
    return 0;
  }

  if (command === "serve") {
    const port = Number(readArgFlag(rest, "--port") ?? "3921");
    const host = readArgFlag(rest, "--host") ?? "127.0.0.1";
    const app = createPlannerServer({ port, host });
    void app.listen().then(() => {
      process.stdout.write(`charts-planner listening on ${app.url}\n`);
    });
    return 0;
  }

  if (command !== "plan" || !file) {
    process.stderr.write(`Unknown command.\n\n${usage()}`);
    return 1;
  }

  const intent = readArgFlag(rest, "--intent");
  const outPath = readArgFlag(rest, "--out");
  const profile = parseDataProfileFile(readFileSync(file, "utf8"));
  const plan = intent ? planFromIntent(profile, intent) : planFromProfile(profile);
  const json = `${JSON.stringify(plan, null, 2)}\n`;

  if (outPath) {
    writeFileSync(outPath, json, "utf8");
  } else {
    process.stdout.write(json);
  }

  return 0;
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  process.exit(runCli(process.argv.slice(2)));
}
