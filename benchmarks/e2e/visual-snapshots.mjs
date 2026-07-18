#!/usr/bin/env node
import { execSync } from "node:child_process";
import { resolveRoot } from "../browser/lib.mjs";

const root = resolveRoot(import.meta.url);

execSync("pnpm exec playwright install chromium", { cwd: root, stdio: "inherit" });
if (!process.env.SKIP_VISUAL_BUILD) {
  execSync("pnpm --filter @axicharts/storybook build", { cwd: root, stdio: "inherit" });
}

const playwrightArgs = ["exec", "playwright", "test", "-c", "benchmarks/e2e/playwright.config.mjs"];
if (process.env.UPDATE_SNAPSHOTS === "1") {
  playwrightArgs.push("--update-snapshots");
}

const env = { ...process.env, SKIP_VISUAL_BUILD: "1" };
if (process.env.CI === undefined && !process.env.GITHUB_ACTIONS) {
  delete env.CI;
}

execSync(`pnpm ${playwrightArgs.join(" ")}`, {
  cwd: root,
  stdio: "inherit",
  env,
});
