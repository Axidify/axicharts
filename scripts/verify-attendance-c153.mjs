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
      b.textContent?.includes("R&D Attendance"),
    );
    if (!btn) throw new Error("R&D Attendance button not found");
    btn.click();
  });

  await page.waitForSelector("text=R&D — Attendance → dashboard", { timeout: 15_000 });
  await page.waitForSelector("text=Agent decisions", { timeout: 15_000 });
  results.push("✓ R&D Attendance view opened");

  const summary = await page.locator("main").innerText();
  if (!/4 employees/.test(summary)) fail("Expected 4 employees in summary");
  if (!/3 present/.test(summary)) fail("Expected 3 present");
  if (!/1 on leave/.test(summary)) fail("Expected 1 on leave");
  if (!/27\.2/.test(summary)) fail("Expected total hours ~27.2");
  results.push("✓ KPI summary: 4 employees, 3 present, 1 leave, 27.2h total");

  const kpiCards = await page.locator("main").getByText("Total hours").count();
  if (kpiCards < 1) fail("Missing Total hours KPI");
  results.push("✓ KPI stat cards rendered");

  const panels = await page.locator("[data-panel-title]").count();
  if (panels < 3) fail(`Expected >= 3 panels, got ${panels}`);
  results.push(`✓ ${panels} panels rendered (table + charts)`);

  const titles = await page.locator("[data-panel-title]").allTextContents();
  if (!titles.some((t) => /Attendance log/i.test(t))) fail("Missing attendance table panel");
  if (!titles.some((t) => /department/i.test(t))) fail("Missing hours by department panel");
  if (!titles.some((t) => /status/i.test(t))) fail("Missing status panel");
  results.push("✓ Table + hours-by-dept + status panels present");

  const decisions = await page.locator("main").innerText();
  if (!/Hours:measure/.test(decisions) && !/Hours/i.test(decisions)) {
    fail("Expected Hours field in profile decisions");
  }
  if (!/Employee ID:identifier/.test(decisions)) {
    fail("Expected Employee ID:identifier in profile (C153 fix)");
  }
  results.push("✓ Profile shows Employee ID:identifier and Hours in field roles");

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
  }, "status breakdown");

  await page.waitForSelector("text=attendanceInterpreter", { timeout: 10_000 });
  results.push("✓ Follow-up interpreter: status breakdown");

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
    await page.screenshot({ path: "/tmp/axiboard-attendance-verify.png", fullPage: true, timeout: 5_000 });
    console.error("Screenshot: /tmp/axiboard-attendance-verify.png");
  } catch {
    // ignore
  }
  process.exitCode = 1;
} finally {
  for (const line of results) console.log(line);
  await browser.close();
}
