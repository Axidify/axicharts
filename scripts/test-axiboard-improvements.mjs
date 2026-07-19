import { chromium } from "playwright";

const BASE = process.env.AXIBOARD_URL ?? "http://localhost:3000";

function fail(message) {
  throw new Error(message);
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const consoleErrors = [];
page.on("console", (msg) => {
  if (msg.type() === "error") consoleErrors.push(msg.text());
});

const results = [];

async function jsClick(label) {
  await page.evaluate((buttonLabel) => {
    const button = [...document.querySelectorAll("button")].find(
      (node) => node.textContent?.trim() === buttonLabel,
    );
    if (!button) throw new Error(`${buttonLabel} button not found`);
    button.click();
  }, label);
}

try {
  await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 30_000 });
  await page.waitForSelector("text=Axiboard");
  results.push("✓ App loaded");

  await page.evaluate(() => {
    const feed = [...document.querySelectorAll("select")].find((select) =>
      [...select.options].some((option) => option.value === "static"),
    );
    if (!feed) throw new Error("Feed select not found");
    feed.value = "static";
    feed.dispatchEvent(new Event("change", { bubbles: true }));
  });
  await page.waitForTimeout(500);

  await jsClick("Plan");
  await page.waitForSelector('[role="dialog"]', { timeout: 10_000 });

  await page.evaluate(() => {
    const textarea = document.querySelector('[role="dialog"] textarea');
    if (!textarea) throw new Error("Planner textarea not found");
    const setter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      "value",
    )?.set;
    setter?.call(textarea, "Static CSV snapshot batch report");
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await jsClick("Generate plan");
  await page.waitForSelector("text=Panels", { timeout: 15_000 });

  const panelCount = Number(
    await page.locator("dt:text('Panels') + dd").first().textContent(),
  );
  if (!(panelCount > 0)) fail(`Expected planner panels > 0, got ${panelCount}`);
  results.push(`✓ Planner generated ${panelCount} panels`);

  await jsClick("Apply to builder");
  await page.waitForSelector("text=Static feed", { timeout: 15_000 });
  const panelTitles = await page.locator("[data-panel-title]").count();
  if (!(panelTitles > 0)) fail(`Expected rendered panels, got ${panelTitles}`);
  results.push(`✓ C151: ${panelTitles} planner panels rendered on static feed`);

  await jsClick("R&D Ledger");
  await page.waitForSelector("text=R&D — Ledger → dashboard");
  await page.waitForSelector("text=Agent decisions");
  results.push("✓ R&D Ledger baseline dashboard visible");

  const followUps = [
    "show payment method breakdown",
    "show transaction table",
    "waterfall by category",
    "stacked debit and credit",
  ];

  for (const intentText of followUps) {
    await page.evaluate((intentText) => {
      const input = document.querySelector('input[placeholder*="Ask agent"]');
      if (!input) throw new Error("Ask agent input not found");
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value",
      )?.set;
      setter?.call(input, intentText);
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }, intentText);
    await page.evaluate(() => {
      const ask = [...document.querySelectorAll("button")].find(
        (node) => node.textContent?.trim() === "Ask agent",
      );
      if (!ask) throw new Error("Ask agent button not found");
      ask.click();
    });
    await page.waitForSelector("text=ledgerInterpreter", { timeout: 10_000 });
    results.push(`✓ Follow-up: ${intentText}`);
  }

  const severeErrors = consoleErrors.filter(
    (line) =>
      line.startsWith("[error]") ||
      line.startsWith("[pageerror]") ||
      (line.includes("validation failed") && !line.includes("Encountered two children")),
  );
  if (severeErrors.length > 0) fail(`Console errors: ${severeErrors.join(" | ")}`);
} catch (error) {
  console.error("FAIL:", error instanceof Error ? error.message : error);
  try {
    await page.screenshot({ path: "/tmp/axiboard-test-fail.png", fullPage: true, timeout: 5_000 });
    console.error("Screenshot: /tmp/axiboard-test-fail.png");
  } catch {
    // ignore
  }
  process.exitCode = 1;
} finally {
  for (const line of results) console.log(line);
  await browser.close();
}
