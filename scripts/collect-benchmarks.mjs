#!/usr/bin/env node
import { execSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const withBrowser = process.argv.includes("--browser");
const date = new Date().toISOString().slice(0, 10);
const resultsDir = path.join(root, "benchmarks", "results", date);
const latestDir = path.join(root, "benchmarks", "results", "latest");

function run(command, options = {}) {
  execSync(command, { cwd: root, stdio: "inherit", ...options });
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function formatKb(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function formatMs(value) {
  return value == null ? "—" : `${value.toFixed(2)} ms`;
}

function scenarioLabel(row) {
  if (row.metric === "frame_p95") {
    return `${row.panels} panels × ${row.points} pts`;
  }
  return `${row.points} pts`;
}

function renderBrowserSection(browser) {
  if (!browser?.length) return "";

  const scenarioIds = [...new Set(browser.map((row) => row.id))];
  const rows = scenarioIds
    .map((id) => {
      const entries = browser.filter((row) => row.id === id);
      const sample = entries[0];
      const axi = entries.find((row) => row.lib === "axicharts");
      const re = entries.find((row) => row.lib === "recharts");
      const ec = entries.find((row) => row.lib === "echarts");
      return `| ${id} | ${scenarioLabel(sample)} | ${formatMs(axi?.p95Ms)} | ${formatMs(re?.p95Ms)} | ${formatMs(ec?.p95Ms)} |`;
    })
    .join("\n");

  return `
## Browser competitive update p95 (Chromium 4× CPU)

| Fixture | Scenario | AxiCharts | Recharts | ECharts |
|---------|----------|-----------|----------|---------|
${rows}

Profile: Chromium headless, viewport 1280×720, \`flushSync\` state updates, ${browser[0]?.updates ?? 30} frames per scenario. Harness: \`apps/bench-harness\`.
`;
}

function renderBenchmarksMd(summary) {
  const bundleRows = summary.bundle
    .map((entry) => {
      const size = entry.size ?? 0;
      const limit = entry.sizeLimit ?? entry.limit ?? 0;
      const pass = entry.passed ?? size <= limit;
      return `| ${entry.name} | ${formatKb(size)} | ${formatKb(limit)} | ${pass ? "✅" : "❌"} |`;
    })
    .join("\n");

  const perfRows = summary.perf
    .map((row) => {
      const label =
        row.metric === "frame_p95"
          ? `${row.panels} panels × ${row.points} pts`
          : `${row.points} pts × ${row.series} series`;
      return `| ${row.id} | ${label} | ${row.valueMs.toFixed(2)} | ${row.budgetMs} | ${row.passed ? "✅" : "❌"} |`;
    })
    .join("\n");

  const envParts = [
    `Node ${summary.node}`,
    summary.platform,
    "happy-dom (node proxy)",
  ];
  if (summary.browser?.length) {
    envParts.push("Chromium 4× (browser competitive)");
  }

  return `# Published benchmarks

Reproducible numbers for bundle gzip budgets and live-update latency.

**Collected:** ${summary.collectedAt}  
**Environment:** ${envParts.join(", ")}  
**Results:** \`benchmarks/results/${date}/summary.json\`

Re-run locally:

\`\`\`bash
pnpm bench              # node proxy gates + bundle
pnpm bench:browser      # Chromium competitive table
pnpm bench:all          # both
\`\`\`

Methodology: Dashboarder [PERFORMANCE.md](https://github.com/Axidify/Dashboarder/blob/main/docs/charts/PERFORMANCE.md).

## Bundle size (gzip)

| Package | Size | Budget | Pass |
|---------|------|--------|------|
${bundleRows}

## Node update latency p95 (ms)

| Fixture | Scenario | p95 | Budget | Pass |
|---------|----------|-----|--------|------|
${perfRows}
${renderBrowserSection(summary.browser)}
## Fixtures

| File | Points | Series | Purpose |
|------|--------|--------|---------|
| \`small.json\` | 500 | 1 | SVG-scale update path |
| \`medium.json\` | 5,000 | 1 | Mid-size live panel |
| \`large.json\` | 10,000 | 1 | Canvas-scale path |
| \`multi-series.json\` | 10,000 | 4 | Multi-series canvas |
| \`dashboard-6up.json\` | 6 × 2,000 | 1 | Multi-panel frame budget |
`;
}

fs.mkdirSync(resultsDir, { recursive: true });

console.log("→ build");
run("pnpm build");

console.log(`→ perf tests → ${resultsDir}`);
fs.rmSync(path.join(resultsDir, "perf.json"), { force: true });
run("pnpm --filter @axicharts/charts-canvas test:perf", {
  env: {
    ...process.env,
    BENCHMARK_COLLECT: "1",
    BENCHMARK_RESULTS_DIR: resultsDir,
  },
});

console.log("→ bundle size");
const bundleStdout = execSync("npx size-limit --json", {
  cwd: root,
  encoding: "utf8",
});
fs.writeFileSync(path.join(resultsDir, "bundle.json"), bundleStdout);

let browser = [];
if (withBrowser) {
  console.log("→ browser competitive bench");
  const { runBrowserBench } = await import("../benchmarks/browser/run.mjs");
  browser = await runBrowserBench(resultsDir);
} else {
  const browserPath = path.join(resultsDir, "browser-competitive.json");
  if (fs.existsSync(browserPath)) {
    browser = readJson(browserPath);
  }
}

const perfPath = path.join(resultsDir, "perf.json");
const perf = fs.existsSync(perfPath) ? readJson(perfPath) : [];
const bundle = JSON.parse(bundleStdout.trim());

const summary = {
  collectedAt: new Date().toISOString(),
  node: process.version,
  platform: `${os.platform()} ${os.arch()}`,
  hostname: os.hostname(),
  perf,
  bundle,
  browser,
};

fs.writeFileSync(
  path.join(resultsDir, "summary.json"),
  `${JSON.stringify(summary, null, 2)}\n`,
);

fs.rmSync(latestDir, { recursive: true, force: true });
fs.cpSync(resultsDir, latestDir, { recursive: true });

const benchmarksMd = renderBenchmarksMd(summary);
fs.writeFileSync(path.join(root, "benchmarks", "BENCHMARKS.md"), benchmarksMd);

console.log(`✓ wrote benchmarks/BENCHMARKS.md and benchmarks/results/${date}/`);
