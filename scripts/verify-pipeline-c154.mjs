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
page.on("pageerror", (err) => consoleErrors.push(`[pageerror] ${err.message}`));

const results = [];

try {
  await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 30_000 });
  await page.waitForSelector("text=Axiboard");
  results.push("✓ App loaded");

  await page.evaluate(() => {
    const btn = [...document.querySelectorAll("button")].find((b) =>
      b.textContent?.includes("R&D Sales"),
    );
    if (!btn) throw new Error("R&D Sales button not found");
    btn.click();
  });

  await page.waitForSelector("text=R&D — Sales pipeline", { timeout: 15_000 });
  await page.waitForSelector("text=Agent decisions", { timeout: 15_000 });
  results.push("✓ R&D Sales view opened");

  const summary = await page.locator("main").innerText();
  if (!/5 opportunities/.test(summary)) fail("Expected 5 opportunities in summary");
  if (!/4 open/.test(summary)) fail("Expected 4 open deals");
  if (!/558,000/.test(summary)) fail("Expected total pipeline RM 558,000");
  if (!/417,000/.test(summary)) fail("Expected weighted forecast RM 417,000");
  results.push("✓ KPI summary: 5 opps, 4 open, RM 558k pipeline, RM 417k weighted");

  const kpiCards = await page.locator("main").getByText("Total pipeline").count();
  if (kpiCards < 1) fail("Missing Total pipeline KPI");
  results.push("✓ KPI stat cards rendered");

  const panels = await page.locator("[data-panel-title]").count();
  if (panels < 3) fail(`Expected >= 3 panels, got ${panels}`);
  results.push(`✓ ${panels} panels rendered (table + charts)`);

  const titles = await page.locator("[data-panel-title]").allTextContents();
  if (!titles.some((t) => /Pipeline opportunities/i.test(t))) fail("Missing pipeline table panel");
  if (!titles.some((t) => /stage/i.test(t))) fail("Missing pipeline by stage panel");
  if (!titles.some((t) => /weighted/i.test(t))) fail("Missing weighted forecast panel");
  results.push("✓ Table + stage + weighted forecast panels present");

  const decisions = await page.locator("main").innerText();
  if (!/Opportunity ID:identifier/.test(decisions)) {
    fail("Expected Opportunity ID:identifier in profile (C154 fix)");
  }
  if (!/Expected Close:time/.test(decisions)) {
    fail("Expected Expected Close:time in profile (C154 fix)");
  }
  results.push("✓ Profile shows Opportunity ID:identifier and Expected Close:time");

  await page.evaluate((intentText) => {
    const input = document.querySelector('input[placeholder*="Ask agent"]');
    if (!input) throw new Error("Ask agent input not found");
    const setter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value",
    )?.set;
    setter?.call(input, intentText);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    const ask = [...document.querySelectorAll("button")].find(
      (node) => node.textContent?.trim() === "Ask agent",
    );
    ask?.click();
  }, "pipeline by stage open only");

  await page.waitForSelector("text=pipelineInterpreter", { timeout: 10_000 });
  results.push("✓ Follow-up interpreter: pipeline by stage open only");

  const severe = consoleErrors.filter(
    (line) =>
      line.includes("validation failed") ||
      line.includes("[pageerror]") ||
      (line.startsWith("[error]") && !line.includes("Encountered two children")),
  );
  if (severe.length > 0) fail(`Console errors: ${severe.join(" | ")}`);
  results.push("✓ No validation crashes");
} catch (error) {
  console.error("FAIL:", error instanceof Error ? error.message : error);
  try {
    await page.screenshot({ path: "/tmp/axiboard-pipeline-verify.png", fullPage: true, timeout: 5_000 });
    console.error("Screenshot: /tmp/axiboard-pipeline-verify.png");
  } catch {
    // ignore
  }
  process.exitCode = 1;
} finally {
  for (const line of results) console.log(line);
  await browser.close();
}
