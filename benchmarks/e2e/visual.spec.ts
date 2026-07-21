import { test, expect } from "@playwright/test";

const VISUAL_STORIES = [
  {
    id: "charts-shadcnparity--gallery",
    name: "shadcn-gallery",
    waitFor: "canvas",
    maxDiffPixelRatio: 0.04,
  },
  {
    id: "charts-catalog--all-types",
    name: "catalog-all-types",
    waitFor: "text=Shipped chart types",
    settleMs: 3500,
    maxDiffPixelRatio: 0.04,
  },
  {
    id: "charts-wordcloud--incident-and-feedback",
    name: "wordcloud-incident",
    waitFor: "canvas",
    settleMs: 3500,
    maxDiffPixelRatio: 0.08,
  },
  {
    id: "charts-finance--ibcs-waterfall",
    name: "finance-ibcs-waterfall",
    waitFor: "canvas",
    settleMs: 2000,
  },
  {
    id: "charts-navigator--ops-multi-panel",
    name: "navigator-ops",
    waitFor: ".axicharts-uplot",
  },
  {
    id: "charts-scatter--market-cap-bubble",
    name: "scatter-market-cap-bubble",
    waitFor: "canvas",
    settleMs: 2000,
    maxDiffPixelRatio: 0.08,
  },
  {
    id: "charts-annotations--ops-finance-wall",
    name: "annotations-ops-finance",
    waitFor: ".axicharts-uplot",
    settleMs: 2000,
  },
  {
    id: "mockups-g-·-clean-default--api-latency",
    name: "mockup-g-api-latency",
    waitFor: ".axicharts-uplot",
  },
  {
    id: "audit-render--iot-dashboard-grid",
    name: "audit-iot-dashboard-grid",
    waitFor: ".axicharts-uplot",
    settleMs: 2000,
    maxDiffPixelRatio: 0.04,
  },
  {
    id: "audit-render--compact-pie-tile",
    name: "audit-compact-pie-tile",
    waitFor: "canvas",
    settleMs: 2000,
  },
  {
    id: "audit-render--stacked-bar-totals",
    name: "audit-stacked-bar-totals",
    waitFor: ".axicharts-uplot",
    settleMs: 2000,
    maxDiffPixelRatio: 0.04,
  },
  {
    id: "audit-render--industrial-primitives",
    name: "audit-industrial-primitives",
    waitFor: "text=Spindle",
    settleMs: 1500,
    maxDiffPixelRatio: 0.05,
  },
  {
    id: "audit-design--recharts-parity-tile-360",
    name: "design-recharts-parity-360",
    waitFor: ".axicharts-uplot",
    settleMs: 2500,
    maxDiffPixelRatio: 0.1,
  },
  {
    id: "audit-design--horizontal-bar-tile-360",
    name: "design-horizontal-bar-360",
    waitFor: ".axicharts-uplot",
    settleMs: 2000,
    maxDiffPixelRatio: 0.04,
  },
  {
    id: "audit-dashboard-adjacent--lane-b-tile-360",
    name: "design-lane-b-adjacent-360",
    waitFor: "text=dashboard-adjacent",
    settleMs: 2500,
    maxDiffPixelRatio: 0.06,
  },
  {
    id: "audit-design--scatter-tile-360",
    name: "design-scatter-360",
    waitFor: "canvas",
    settleMs: 2500,
    maxDiffPixelRatio: 0.06,
  },
  {
    id: "audit-design--radar-tile-360",
    name: "design-radar-360",
    waitFor: "canvas",
    settleMs: 2500,
    maxDiffPixelRatio: 0.06,
  },
  {
    id: "audit-design--histogram-tile-360",
    name: "design-histogram-360",
    waitFor: "canvas",
    settleMs: 2500,
    maxDiffPixelRatio: 0.06,
  },
  {
    id: "audit-niche-industrial--lane-c-tile-wall",
    name: "design-lane-c-niche-360",
    waitFor: "text=Lane C",
    settleMs: 3500,
    maxDiffPixelRatio: 0.08,
  },
  {
    id: "audit-design--pie-tile-360",
    name: "design-pie-360",
    waitFor: "canvas",
    settleMs: 2500,
    maxDiffPixelRatio: 0.06,
  },
  {
    id: "audit-design--blocks-tile-360",
    name: "design-blocks-360",
    waitFor: ".axicharts-uplot",
    settleMs: 2500,
    maxDiffPixelRatio: 0.06,
  },
  {
    id: "audit-studio--studio-tile-wall",
    name: "design-studio-360",
    waitFor: "text=Studio lane",
    settleMs: 2500,
    maxDiffPixelRatio: 0.08,
  },
] as const;

/** Fixed viewport clip — avoids 1–3px height drift between macOS baselines and Linux CI. */
const VIEWPORT_CLIP = { x: 0, y: 0, width: 1280, height: 900 };

for (const story of VISUAL_STORIES) {
  test(`visual ${story.name}`, async ({ page }) => {
    test.setTimeout(120_000);
    const params = new URLSearchParams({
      id: story.id,
      viewMode: "story",
    });
    await page.goto(`/iframe.html?${params.toString()}`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForSelector(story.waitFor, { timeout: 60_000 });
    await page.waitForTimeout(story.settleMs ?? 1200);
    await expect(page).toHaveScreenshot(`${story.name}.png`, {
      clip: VIEWPORT_CLIP,
      maxDiffPixelRatio: story.maxDiffPixelRatio ?? 0.02,
    });
  });
}
