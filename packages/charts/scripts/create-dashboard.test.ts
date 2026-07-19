import { mkdtemp, readFile, realpath, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
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
      preset: null,
    });
  });

  it("resolves . to cwd", () => {
    expect(parseCreateDashboardArgs(["."])).toEqual({
      targetDir: process.cwd(),
      category: "cartesian",
      preset: null,
    });
  });

  it("parses --category distribution", () => {
    expect(parseCreateDashboardArgs(["my-app", "--category", "distribution"])).toEqual({
      targetDir: "my-app",
      category: "distribution",
      preset: null,
    });
    expect(parseCreateDashboardArgs(["--category=matrix"])).toEqual({
      targetDir: "axicharts-dashboard",
      category: "matrix",
      preset: null,
    });
  });

  it("parses --preset full", () => {
    expect(parseCreateDashboardArgs(["my-app", "--preset", "full"])).toEqual({
      targetDir: "my-app",
      category: "full",
      preset: "full",
    });
    expect(parseCreateDashboardArgs(["--preset=full"])).toEqual({
      targetDir: "axicharts-dashboard",
      category: "full",
      preset: "full",
    });
  });

  it("parses --preset studio", () => {
    expect(parseCreateDashboardArgs(["my-app", "--preset", "studio"])).toEqual({
      targetDir: "my-app",
      category: "studio",
      preset: "studio",
    });
    expect(parseCreateDashboardArgs(["--preset=studio"])).toEqual({
      targetDir: "axicharts-dashboard",
      category: "studio",
      preset: "studio",
    });
  });

  it("rejects unknown presets", () => {
    expect(() => parseCreateDashboardArgs(["--preset", "lite"])).toThrow(
      /Invalid --preset/,
    );
  });

  it("scaffolds full meta-package preset", async () => {
    const dir = await makeTempDir();
    await scaffoldDashboard(dir, "full", "full");

    const app = await readFile(path.join(dir, "src/App.tsx"), "utf8");
    const pkg = JSON.parse(await readFile(path.join(dir, "package.json"), "utf8"));

    expect(app).toContain("@axicharts/charts-full");
    expect(app).toContain("@axicharts/charts-full/theme");
    expect(app).toContain("LineChart");
    expect(pkg.dependencies["@axicharts/charts-full"]).toMatch(/^\^0\.\d+\.\d+$/);
    expect(pkg.dependencies.echarts).toBe("^5.6.0");
    expect(pkg.dependencies.uplot).toBe("^1.6.31");
  });

  it("scaffolds studio preset with StudioLineChart", async () => {
    const dir = await makeTempDir();
    await scaffoldDashboard(dir, "studio", "studio");

    const app = await readFile(path.join(dir, "src/App.tsx"), "utf8");
    const pkg = JSON.parse(await readFile(path.join(dir, "package.json"), "utf8"));

    expect(app).toContain("@axicharts/charts/studio");
    expect(app).toContain("StudioLineChart");
    expect(app).toContain('data-theme="studio"');
    expect(app).toContain("studio-tokens.css");
    expect(pkg.dependencies["@axicharts/charts"]).toMatch(/^\^0\.\d+\.\d+$/);
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
    expect(pkg.dependencies["@axicharts/charts"]).toMatch(/^\^0\.\d+\.\d+$/);
    expect(pkg.dependencies["@axicharts/charts-theme"]).toMatch(/^\^0\.\d+\.\d+$/);
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

  it("scaffolds into cwd when target is .", async () => {
    const dir = await makeTempDir();
    const originalCwd = process.cwd();
    process.chdir(dir);
    try {
      const result = await scaffoldDashboard(".", "cartesian");
      expect(await realpath(result.targetDir)).toBe(await realpath(dir));
      expect(result.files).toContain("package.json");
      await expect(readFile(path.join(dir, "package.json"), "utf8")).resolves.toContain(
        "@axicharts/charts",
      );
    } finally {
      process.chdir(originalCwd);
    }
  });

  it("bin entry scaffolds via npx-style invocation", async () => {
    const dir = await makeTempDir();
    const bin = path.join(
      path.dirname(fileURLToPath(import.meta.url)),
      "../bin/create-dashboard.mjs",
    );

    const exitCode = await new Promise<number>((resolve, reject) => {
      const child = spawn(process.execPath, [bin, dir], { stdio: "pipe" });
      let stderr = "";
      child.stderr.on("data", (chunk) => {
        stderr += chunk.toString();
      });
      child.on("error", reject);
      child.on("close", (code) => {
        if (code !== 0) {
          reject(new Error(stderr || `exit ${code}`));
          return;
        }
        resolve(code ?? 0);
      });
    });

    expect(exitCode).toBe(0);
    await expect(readFile(path.join(dir, "package.json"), "utf8")).resolves.toContain(
      "@axicharts/charts",
    );
  });
});
