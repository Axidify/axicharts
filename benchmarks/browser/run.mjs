#!/usr/bin/env node
import { execSync, spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const UPDATE_COUNT = 30;
const PORT = 5175;
const BASE_URL = `http://localhost:${PORT}`;

const LIBS = ["axicharts", "recharts", "echarts"];
const SCENARIOS = [
  { id: "small", fixture: "small", panels: 1, budgetMs: 8 },
  { id: "medium", fixture: "medium", panels: 1, budgetMs: 16 },
  { id: "large", fixture: "large", panels: 1, budgetMs: 16 },
  {
    id: "dashboard-6up",
    fixture: "dashboard-6up",
    panels: 6,
    points: 2000,
    budgetMs: 16,
  },
];

function run(command, options = {}) {
  execSync(command, { cwd: root, stdio: "inherit", ...options });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(url, timeoutMs = 30_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // retry
    }
    await sleep(250);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

function startPreview() {
  const child = spawn(
    "pnpm",
    ["--filter", "@axicharts/bench-harness", "preview"],
    {
      cwd: root,
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, BROWSER: "none" },
    },
  );

  child.stdout?.on("data", (chunk) => {
    process.stdout.write(chunk);
  });
  child.stderr?.on("data", (chunk) => {
    process.stderr.write(chunk);
  });

  return child;
}

function buildUrl(lib, scenario) {
  const params = new URLSearchParams({
    lib,
    fixture: scenario.fixture,
    panels: String(scenario.panels),
  });
  if (scenario.points) {
    params.set("points", String(scenario.points));
  }
  return `${BASE_URL}/?${params.toString()}`;
}

async function measureScenario(page, lib, scenario) {
  await page.goto(buildUrl(lib, scenario), { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.__benchReady === true, undefined, {
    timeout: 15_000,
  });
  await page.waitForTimeout(100);

  const result = await page.evaluate((updates) => {
    if (!window.__runUpdateBench) {
      throw new Error("Bench hook missing");
    }
    return window.__runUpdateBench(updates);
  }, UPDATE_COUNT);

  const points =
    scenario.points ??
    ({ small: 500, medium: 5000, large: 10000 }[scenario.fixture] ?? 500);

  return {
    id: scenario.id,
    lib,
    fixture: scenario.fixture,
    points,
    panels: scenario.panels,
    updates: UPDATE_COUNT,
    p95Ms: result.p95Ms,
    budgetMs: scenario.budgetMs,
    passed: result.p95Ms < scenario.budgetMs,
    environment: "chromium-4x",
    metric: scenario.panels > 1 ? "frame_p95" : "update_p95",
  };
}

export async function runBrowserBench(resultsDir) {
  fs.mkdirSync(resultsDir, { recursive: true });

  console.log("→ install chromium (playwright)");
  run("pnpm exec playwright install chromium");

  console.log("→ build packages + bench harness");
  run("pnpm build");
  run("pnpm --filter @axicharts/bench-harness build");

  const preview = startPreview();
  const results = [];

  try {
    await waitForServer(BASE_URL);

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    const cdp = await context.newCDPSession(page);
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });

    for (const scenario of SCENARIOS) {
      for (const lib of LIBS) {
        console.log(`→ browser bench ${lib} / ${scenario.id}`);
        results.push(await measureScenario(page, lib, scenario));
      }
    }

    await browser.close();
  } finally {
    preview.kill("SIGTERM");
  }

  const outPath = path.join(resultsDir, "browser-competitive.json");
  fs.writeFileSync(outPath, `${JSON.stringify(results, null, 2)}\n`);
  console.log(`✓ wrote ${outPath}`);
  return results;
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isMain) {
  const date = new Date().toISOString().slice(0, 10);
  const resultsDir =
    process.env.BENCHMARK_RESULTS_DIR ??
    path.join(root, "benchmarks", "results", date);

  runBrowserBench(resultsDir).catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
