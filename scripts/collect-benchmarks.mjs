#!/usr/bin/env node
import { execSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
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

  return `# Published benchmarks

Reproducible numbers for bundle gzip budgets and uPlot live-update latency.

**Collected:** ${summary.collectedAt}  
**Environment:** Node ${summary.node}, ${summary.platform}, happy-dom (canvas proxy)  
**Results:** \`benchmarks/results/${date}/summary.json\`

Re-run locally:

\`\`\`bash
pnpm bench
\`\`\`

Methodology (fixtures, budgets, browser profile for future Playwright benches) is documented in Dashboarder [PERFORMANCE.md](https://github.com/Axidify/Dashboarder/blob/main/docs/charts/PERFORMANCE.md).

## Bundle size (gzip)

| Package | Size | Budget | Pass |
|---------|------|--------|------|
${bundleRows}

## Update latency p95 (ms)

| Fixture | Scenario | p95 | Budget | Pass |
|---------|----------|-----|--------|------|
${perfRows}

## Fixtures

| File | Points | Series | Purpose |
|------|--------|--------|---------|
| \`small.json\` | 500 | 1 | SVG-scale update path |
| \`medium.json\` | 5,000 | 1 | Mid-size live panel |
| \`large.json\` | 10,000 | 1 | Canvas-scale path |
| \`multi-series.json\` | 10,000 | 4 | Multi-series canvas |
| \`dashboard-6up.json\` | 6 × 2,000 | 1 | Multi-panel frame budget |

> **Note:** These numbers measure uPlot \`setData\` in happy-dom with \`@napi-rs/canvas\`. They gate CI regressions; browser Playwright benches (4× CPU throttle) are planned for competitive comparisons vs Recharts/ECharts.
`;
}

fs.mkdirSync(resultsDir, { recursive: true });

console.log("→ build");
run("pnpm build");

console.log(`→ perf tests → ${resultsDir}`);
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
