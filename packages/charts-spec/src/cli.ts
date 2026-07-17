#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { ejectPanel } from "./eject";
import {
  parseDashboardSpecFile,
  parseDataProfileFile,
  parsePanelSpecFile,
} from "./parseSpec";
import { planPanelsFromProfile, suggestTemplate } from "./plan";

function readArgFlag(args: string[], flag: string): string | undefined {
  const index = args.indexOf(flag);
  if (index === -1) return undefined;
  return args[index + 1];
}

function usage(): string {
  return `charts-spec — AxiCharts Layer 2 tooling

Usage:
  charts-spec eject <panel.json> [--data-var rows] [--out Panel.tsx]
  charts-spec plan <profile.json> [--out panels.json]
  charts-spec templates

Examples:
  charts-spec eject examples/revenue-line.panel.json
  charts-spec plan examples/finance.profile.json
`;
}

export function runCli(argv: string[]): number {
  const [command, file, ...rest] = argv;

  if (!command || command === "--help" || command === "-h") {
    process.stdout.write(usage());
    return 0;
  }

  if (command === "templates") {
    process.stdout.write(
      ["finance-pnl", "trading-blotter", "capacity-grid", "ops-2x2", "line-overview"].join(
        "\n",
      ) + "\n",
    );
    return 0;
  }

  if (!file) {
    process.stderr.write(`Missing file argument for "${command}".\n\n${usage()}`);
    return 1;
  }

  const input = readFileSync(file, "utf8");
  const outPath = readArgFlag(rest, "--out");

  try {
    if (command === "eject") {
      const spec = parsePanelSpecFile(input);
      const dataVar = readArgFlag(rest, "--data-var") ?? "data";
      const jsx = ejectPanel(spec, dataVar);
      if (outPath) {
        writeFileSync(outPath, jsx, "utf8");
      } else {
        process.stdout.write(`${jsx}\n`);
      }
      return 0;
    }

    if (command === "plan") {
      const profile = parseDataProfileFile(input);
      const payload = {
        suggestedTemplate: suggestTemplate(profile),
        panels: planPanelsFromProfile(profile),
      };
      const json = `${JSON.stringify(payload, null, 2)}\n`;
      if (outPath) {
        writeFileSync(outPath, json, "utf8");
      } else {
        process.stdout.write(json);
      }
      return 0;
    }

    if (command === "validate") {
      if (file.endsWith(".profile.json") || input.includes('"metrics"')) {
        parseDataProfileFile(input);
      } else if (input.includes('"template"')) {
        parseDashboardSpecFile(input);
      } else {
        parsePanelSpecFile(input);
      }
      process.stdout.write("ok\n");
      return 0;
    }

    process.stderr.write(`Unknown command "${command}".\n\n${usage()}`);
    return 1;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`Error: ${message}\n`);
    return 1;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  process.exitCode = runCli(process.argv.slice(2));
}
