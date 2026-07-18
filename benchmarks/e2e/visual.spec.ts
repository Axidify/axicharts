import { test, expect } from "@playwright/test";

const VISUAL_STORIES = [
  {
    id: "charts-shadcnparity--gallery",
    name: "shadcn-gallery",
    waitFor: "canvas",
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
] as const;

/** Fixed viewport clip — avoids 1–3px height drift between macOS baselines and Linux CI. */
const VIEWPORT_CLIP = { x: 0, y: 0, width: 1280, height: 900 };

for (const story of VISUAL_STORIES) {
  test(`visual ${story.name}`, async ({ page }) => {
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
