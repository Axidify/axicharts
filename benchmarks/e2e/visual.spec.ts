import { test, expect } from "@playwright/test";

const VISUAL_STORIES = [
  {
    id: "charts-shadcnparity--gallery",
    name: "shadcn-gallery",
    waitFor: "canvas",
  },
  {
    id: "charts-wordcloud--incident-and-feedback",
    name: "wordcloud-incident",
    waitFor: "canvas",
    settleMs: 3500,
    maxDiffPixelRatio: 0.08,
  },
  {
    id: "charts-navigator--ops-multi-panel",
    name: "navigator-ops",
    waitFor: ".axicharts-uplot",
  },
  {
    id: "mockups-g-·-clean-default--api-latency",
    name: "mockup-g-api-latency",
    waitFor: ".axicharts-uplot",
  },
] as const;

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
      fullPage: true,
      maxDiffPixelRatio: story.maxDiffPixelRatio ?? 0.02,
    });
  });
}
