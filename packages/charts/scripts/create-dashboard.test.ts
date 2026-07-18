import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  buildDashboardFiles,
  parseCreateDashboardArgs,
  scaffoldDashboard,
} from "./create-dashboard.mjs";

const tempDirs = [];

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

async function makeTempDir() {
  const dir = await mkdtemp(path.join(os.tmpdir(), "axicharts-scaffold-"));
  tempDirs.push(dir);
  return dir;
}

describe("create-dashboard scaffold", () => {
  it("parses target dir and default cartesian category", () => {
    expect(parseCreateDashboardArgs(["my-app"])).toEqual({
      targetDir: "my-app",
      category: "cartesian",
    });
  });

  it("parses --category distribution", () => {
    expect(parseCreateDashboardArgs(["my-app", "--category", "distribution"])).toEqual({
      targetDir: "my-app",
      category: "distribution",
    });
    expect(parseCreateDashboardArgs(["--category=matrix"])).toEqual({
      targetDir: "axicharts-dashboard",
      category: "matrix",
    });
  });

  it("rejects unknown categories", () => {
    expect(() => parseCreateDashboardArgs(["--category", "unknown"])).toThrow(
      /Invalid --category/,
    );
  });

  it("scaffolds cartesian quick chart defaults", async () => {
    const dir = await makeTempDir();
    await scaffoldDashboard(dir, "cartesian");

    const app = await readFile(path.join(dir, "src/App.tsx"), "utf8");
    const tokens = await readFile(path.join(dir, "src/tokens.css"), "utf8");
    const pkg = JSON.parse(await readFile(path.join(dir, "package.json"), "utf8"));

    expect(app).toContain('@axicharts/charts/quick');
    expect(app).toContain("QuickLineChart");
    expect(tokens).toContain("--chart-1");
    expect(pkg.dependencies.echarts).toBeUndefined();
  });

  it("scaffolds distribution PieChart sample", async () => {
    const dir = await makeTempDir();
    await scaffoldDashboard(dir, "distribution");

    const app = await readFile(path.join(dir, "src/App.tsx"), "utf8");
    const pkg = JSON.parse(await readFile(path.join(dir, "package.json"), "utf8"));

    expect(app).toContain('@axicharts/charts/distribution');
    expect(app).toContain("PieChart");
    expect(pkg.dependencies.echarts).toBe("^5.6.0");
  });

  it("buildDashboardFiles includes responsive global styles", () => {
    const files = buildDashboardFiles("demo", "cartesian");
    expect(files["src/global.css"]).toContain("width: min(960px, 100%)");
    expect(files["README.md"]).toContain("category: **cartesian**");
  });
});
