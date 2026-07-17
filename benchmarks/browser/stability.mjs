#!/usr/bin/env node
import { execSync, spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import {
  BENCH_BASE_URL,
  buildHarnessUrl,
  resolveRoot,
  sleep,
  waitForServer,
  writeJson,
} from "./lib.mjs";

const root = resolveRoot(import.meta.url);
const SOAK_DURATION_MS = Number(process.env.BENCH_SOAK_DURATION_MS ?? 60_000);
const LEAK_CYCLES = Number(process.env.BENCH_LEAK_CYCLES ?? 100);
const HEAP_BUDGET_MB = Number(process.env.BENCH_LEAK_HEAP_MB ?? 30);

const SOAK_SCENARIOS = [
  {
    id: "soak-large-1hz",
    fixture: "large",
    hz: 1,
    budgetMs: 16,
    points: 10_000,
  },
  {
    id: "soak-large-5hz",
    fixture: "large",
    hz: 5,
    budgetMs: 16,
    points: 10_000,
  },
];

function run(command, options = {}) {
  execSync(command, { cwd: root, stdio: "inherit", ...options });
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

  child.stdout?.on("data", (chunk) => process.stdout.write(chunk));
  child.stderr?.on("data", (chunk) => process.stderr.write(chunk));
  return child;
}

async function withHarness(runner) {
  run("pnpm exec playwright install chromium");
  run("pnpm build");
  run("pnpm --filter @axicharts/bench-harness build");

  const preview = startPreview();
  try {
    await waitForServer(BENCH_BASE_URL);
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    const cdp = await context.newCDPSession(page);
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });

    const results = await runner(page);

    await browser.close();
    return results;
  } finally {
    preview.kill("SIGTERM");
    await sleep(300);
  }
}

async function measureSoak(page, scenario) {
  await page.goto(
    buildHarnessUrl({
      mode: "soak",
      fixture: scenario.fixture,
      hz: String(scenario.hz),
      durationMs: String(SOAK_DURATION_MS),
      points: String(scenario.points),
    }),
    { waitUntil: "networkidle" },
  );
  await page.waitForFunction(() => window.__benchReady === true, undefined, {
    timeout: 15_000,
  });

  const result = await page.evaluate(
    async ({ durationMs, hz }) => {
      if (!window.__runSoakBench) {
        throw new Error("Soak hook missing");
      }
      return window.__runSoakBench({ durationMs, hz });
    },
    { durationMs: SOAK_DURATION_MS, hz: scenario.hz },
  );

  return {
    id: scenario.id,
    metric: "soak_p95",
    lib: "axicharts",
    fixture: scenario.fixture,
    points: scenario.points,
    hz: scenario.hz,
    durationMs: SOAK_DURATION_MS,
    updates: result.updates,
    p95Ms: result.p95Ms,
    budgetMs: scenario.budgetMs,
    passed: result.p95Ms < scenario.budgetMs,
    environment: "chromium-4x",
  };
}

async function measureLeak(page) {
  await page.goto(buildHarnessUrl({ mode: "leak" }), {
    waitUntil: "networkidle",
  });
  await page.waitForFunction(() => window.__benchReady === true, undefined, {
    timeout: 15_000,
  });

  const result = await page.evaluate((cycles) => {
    if (!window.__runLeakCheck) {
      throw new Error("Leak hook missing");
    }
    return window.__runLeakCheck(cycles);
  }, LEAK_CYCLES);

  const heapOk = result.heapDeltaMb <= HEAP_BUDGET_MB;

  return {
    id: "leak-mount-100",
    metric: "leak_check",
    lib: "axicharts",
    cycles: result.cycles,
    leftoverUplot: result.leftoverUplot,
    heapDeltaMb: result.heapDeltaMb,
    heapBudgetMb: HEAP_BUDGET_MB,
    passed: result.passed && heapOk,
    environment: "chromium-4x",
  };
}

export async function runStabilityBench(resultsDir) {
  return withHarness(async (page) => {
    const soak = [];
    for (const scenario of SOAK_SCENARIOS) {
      console.log(`→ soak ${scenario.id} (${SOAK_DURATION_MS / 1000}s @ ${scenario.hz} Hz)`);
      soak.push(await measureSoak(page, scenario));
    }

    console.log(`→ leak check (${LEAK_CYCLES} cycles)`);
    const leak = await measureLeak(page);

    const stability = { soak, leak };
    writeJson(path.join(resultsDir, "browser-stability.json"), stability);
    console.log(`✓ wrote ${path.join(resultsDir, "browser-stability.json")}`);

    if (!soak.every((row) => row.passed) || !leak.passed) {
      return { ...stability, failed: true };
    }

    return stability;
  });
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isMain) {
  const date = new Date().toISOString().slice(0, 10);
  const resultsDir =
    process.env.BENCHMARK_RESULTS_DIR ??
    path.join(root, "benchmarks", "results", date);

  runStabilityBench(resultsDir).then((stability) => {
    if (stability.failed) {
      console.error("Browser stability bench failed");
      process.exit(1);
    }
  }).catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
