import { defineConfig } from "@playwright/test";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  testDir: here,
  testMatch: "visual.spec.ts",
  snapshotPathTemplate: "{testDir}/visual-snapshots/{arg}{ext}",
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: `http://127.0.0.1:${process.env.E2E_STORYBOOK_PORT ?? 6018}`,
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 1,
    locale: "en-US",
    timezoneId: "UTC",
    colorScheme: "light",
    reducedMotion: "reduce",
  },
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: Number(process.env.VISUAL_MAX_DIFF ?? 0.02),
      animations: "disabled",
    },
  },
  webServer: {
    command: "node serve-storybook-static.mjs",
    cwd: here,
    port: Number(process.env.E2E_STORYBOOK_PORT ?? 6018),
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
  },
});
