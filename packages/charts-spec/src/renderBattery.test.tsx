import { beforeAll, describe, expect, it } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { registerBuiltinChartTypes } from "@axicharts/charts/registry";
import { compilePanel } from "./compilePanel";
import {
  checkRenderSurface,
  hasEmptyStateOverlay,
  summarizeRenderBattery,
  type RenderBatteryCase,
  type RenderBatteryResult,
} from "./renderBattery";
import { buildRenderBatteryCases } from "./renderBatteryCases";
import { assertChartsSpecTestHarness } from "./testHarness";

const CASES = buildRenderBatteryCases();
const PASS_CASES = CASES.filter((entry) => entry.expect === "pass");
const NEGATIVE_CASES = CASES.filter((entry) => entry.expect === "compile_throw");

let pluginsRegistered = false;

function ensurePlugins(): void {
  if (!pluginsRegistered) {
    registerBuiltinChartTypes();
    pluginsRegistered = true;
  }
}

async function runPassCase(testCase: RenderBatteryCase): Promise<RenderBatteryResult> {
  try {
    if (testCase.registerPlugins) {
      ensurePlugins();
    }

    const panel = compilePanel(testCase.panel, testCase.rows, {
      height: testCase.height,
      width: testCase.width,
    });

    const view = render(panel);
    const surface = testCase.surface ?? "any";

    await waitFor(
      () => {
        const check = checkRenderSurface(view.container, surface);
        if (check.ok) return;
        if (testCase.emptyStateOk && hasEmptyStateOverlay(view.container)) return;
        expect(check.ok, check.details).toBe(true);
      },
      { timeout: 4_000 },
    );

    const check = checkRenderSurface(view.container, surface);
    if (!check.ok && testCase.emptyStateOk && hasEmptyStateOverlay(view.container)) {
      return {
        id: testCase.id,
        group: testCase.group,
        expect: testCase.expect,
        outcome: "pass",
        details: "empty-state overlay (graceful)",
      };
    }
    return {
      id: testCase.id,
      group: testCase.group,
      expect: testCase.expect,
      outcome: check.ok ? "pass" : "fail",
      details: check.details,
    };
  } catch (error) {
    const message =
      error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    return {
      id: testCase.id,
      group: testCase.group,
      expect: testCase.expect,
      outcome: "crash",
      details: message,
    };
  }
}

function runCompileThrowCase(testCase: RenderBatteryCase): RenderBatteryResult {
  try {
    compilePanel(testCase.panel, testCase.rows, {
      height: testCase.height,
      width: testCase.width,
    });
    return {
      id: testCase.id,
      group: testCase.group,
      expect: testCase.expect,
      outcome: "fail",
      details: "compilePanel succeeded but compile_throw expected",
    };
  } catch {
    return {
      id: testCase.id,
      group: testCase.group,
      expect: testCase.expect,
      outcome: "pass",
      details: "compilePanel threw as expected",
    };
  }
}

describe("render battery — edge-case mount suite", () => {
  beforeAll(() => {
    assertChartsSpecTestHarness();
  });

  it("catalog is non-empty and ids are unique", () => {
    const ids = CASES.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(CASES.length).toBeGreaterThanOrEqual(40);
  });

  it("negative cases throw at compile time", () => {
    const results = NEGATIVE_CASES.map(runCompileThrowCase);
    const summary = summarizeRenderBattery(results);
    expect(summary.compile_throw_miss, JSON.stringify(summary.failures, null, 2)).toBe(0);
    expect(summary.compile_throw_ok).toBe(NEGATIVE_CASES.length);
  });
});

describe.each(PASS_CASES)("$id — $description", (testCase) => {
  it(
    `mounts (${testCase.group}) without crash`,
    async () => {
      const result = await runPassCase(testCase);
      expect(result.outcome, result.details).toBe("pass");
    },
    12_000,
  );
});
