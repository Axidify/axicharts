#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { parseDataProfileFile } from "@axicharts/charts-spec";
import { planFromIntent, planFromProfile } from "./plan";
import { planWithProvider } from "./provider";
import { resolvePlannerProvider, type PlannerProviderMode } from "./resolveProvider";
import { createPlannerServer } from "./server-entry";

function readArgFlag(args: string[], flag: string): string | undefined {
  const index = args.indexOf(flag);
  if (index === -1) return undefined;
  return args[index + 1];
}

function hasFlag(args: string[], flag: string): boolean {
  return args.includes(flag);
}

function parseProviderMode(value: string | undefined): PlannerProviderMode {
  if (value === "rules" || value === "openai" || value === "auto") {
    return value;
  }
  return "auto";
}

function usage(): string {
  return `charts-planner — AxiCharts Phase 3 server-side planner

Usage:
  charts-planner plan <profile.json> [--intent "Line 3 night shift"] [--llm] [--out plan.json]
  charts-planner serve [--port 3921] [--host 127.0.0.1] [--provider auto|rules|openai]

Environment (OpenAI-compatible):
  OPENAI_API_KEY or AXICHARTS_PLANNER_API_KEY
  OPENAI_MODEL or AXICHARTS_PLANNER_MODEL (default: gpt-4o-mini)
  OPENAI_BASE_URL or AXICHARTS_PLANNER_BASE_URL (default: https://api.openai.com/v1)

Examples:
  charts-planner plan examples/ops.profile.json --intent "Line 3 night shift overview"
  OPENAI_API_KEY=sk-... charts-planner serve --provider openai
  charts-planner serve --port 3921
`;
}

export async function runCli(argv: string[]): Promise<number> {
  const [command, file, ...rest] = argv;

  if (!command || command === "--help" || command === "-h") {
    process.stdout.write(usage());
    return 0;
  }

  if (command === "serve") {
    const port = Number(readArgFlag(rest, "--port") ?? "3921");
    const host = readArgFlag(rest, "--host") ?? "127.0.0.1";
    const providerMode = parseProviderMode(readArgFlag(rest, "--provider"));
    let provider;
    try {
      provider = resolvePlannerProvider(providerMode);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      process.stderr.write(`${message}\n`);
      return 1;
    }

    const app = createPlannerServer({ port, host, provider });
    await app.listen();
    const providerLabel = provider?.id ?? "rules";
    process.stdout.write(`charts-planner listening on ${app.url} (provider: ${providerLabel})\n`);
    return 0;
  }

  if (command !== "plan" || !file) {
    process.stderr.write(`Unknown command.\n\n${usage()}`);
    return 1;
  }

  const intent = readArgFlag(rest, "--intent");
  const outPath = readArgFlag(rest, "--out");
  const profile = parseDataProfileFile(readFileSync(file, "utf8"));

  let plan;
  if (intent?.trim() && hasFlag(rest, "--llm")) {
    const provider = resolvePlannerProvider("openai");
    if (!provider) {
      process.stderr.write("OPENAI_API_KEY is required for --llm\n");
      return 1;
    }
    plan = await planWithProvider(profile, intent.trim(), provider);
  } else if (intent?.trim()) {
    plan = planFromIntent(profile, intent.trim());
  } else {
    plan = planFromProfile(profile);
  }

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
  void runCli(process.argv.slice(2)).then((code) => {
    process.exit(code);
  });
}
