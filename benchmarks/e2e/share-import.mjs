#!/usr/bin/env node
import { execSync, spawn } from "node:child_process";
import { chromium } from "playwright";
import { resolveRoot, sleep, waitForServer } from "../browser/lib.mjs";

const root = resolveRoot(import.meta.url);
const STORYBOOK_PORT = Number(process.env.E2E_STORYBOOK_PORT ?? 6017);
const STORYBOOK_BASE_URL = `http://127.0.0.1:${STORYBOOK_PORT}`;

const SHARE_IMPORT_STORIES = {
  importDashboard: "axiboard-share-↔-import--import-dashboard-meta-restore",
  shareDashboard: "axiboard-share-↔-import--share-dashboard-with-meta",
};

function run(command, options = {}) {
  execSync(command, { cwd: root, stdio: "inherit", ...options });
}

function startStorybookDev() {
  const child = spawn(
    "pnpm",
    [
      "--filter",
      "@axicharts/storybook",
      "exec",
      "storybook",
      "dev",
      "-p",
      String(STORYBOOK_PORT),
      "--ci",
      "--quiet",
    ],
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

function storyCanvasUrl(storyId) {
  const params = new URLSearchParams({
    path: `/story/${storyId}`,
  });
  return `${STORYBOOK_BASE_URL}/?${params.toString()}`;
}

async function openStory(page, storyId) {
  await page.goto(storyCanvasUrl(storyId), { waitUntil: "domcontentloaded" });
  return page.frameLocator("#storybook-preview-iframe");
}

async function assertImportMetaRestore(frame) {
  const dialog = frame.getByRole("dialog");
  await dialog.getByText("Import JSON").waitFor({ timeout: 60_000 });
  await dialog.getByText("Planner meta restore").scrollIntoViewIfNeeded({ timeout: 60_000 });
  await dialog.getByText("Apply import restores builder").waitFor({ timeout: 60_000 });
  await dialog.getByText("ops-2x2").first().waitFor({ timeout: 60_000 });
  await dialog.getByRole("link", { name: "Start" }).waitFor({ timeout: 60_000 });
  await dialog.getByRole("link", { name: "Schema § meta" }).waitFor({ timeout: 60_000 });
  await dialog.getByRole("link", { name: "Share ↔ import" }).waitFor({ timeout: 60_000 });
}

async function assertShareMetaExport(frame) {
  const dialog = frame.getByRole("dialog");
  await dialog.getByText("Share export").waitFor({ timeout: 60_000 });
  await dialog.getByText("Planner meta export").scrollIntoViewIfNeeded({ timeout: 60_000 });
  await dialog.getByText("embed").first().waitFor({ timeout: 60_000 });
  await dialog.getByRole("link", { name: "Gallery track" }).waitFor({ timeout: 60_000 });
}

async function main() {
  run("pnpm exec playwright install chromium");
  run("pnpm build");

  const dev = startStorybookDev();
  try {
    await waitForServer(`${STORYBOOK_BASE_URL}/index.html`, 120_000);
    await sleep(2_000);

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({
      viewport: { width: 1280, height: 900 },
    });

    await assertImportMetaRestore(
      await openStory(page, SHARE_IMPORT_STORIES.importDashboard),
    );
    await assertShareMetaExport(
      await openStory(page, SHARE_IMPORT_STORIES.shareDashboard),
    );

    await browser.close();
    console.log("share-import e2e: ok");
  } finally {
    dev.kill("SIGTERM");
    await sleep(300);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
