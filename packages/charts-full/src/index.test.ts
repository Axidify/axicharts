import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const distDir = fileURLToPath(new URL("../dist/", import.meta.url));

function readDist(name: string) {
  return readFileSync(`${distDir}${name}`, "utf8");
}

describe("@axicharts/charts-full exports", () => {
  it("ships thin re-export shims for platform packages", () => {
    expect(readDist("index.js")).toContain("@axicharts/charts/full");
    expect(readDist("spec.js")).toContain("@axicharts/charts-spec");
    expect(readDist("runtime.js")).toContain("@axicharts/charts-runtime");
    expect(readDist("theme.js")).toContain("@axicharts/charts-theme");
  });

  it("resolves spec subpath at runtime", async () => {
    const spec = await import("../dist/spec.js");
    expect(spec.compilePanel).toBeTypeOf("function");
    expect(spec.ejectPanel).toBeTypeOf("function");
  });

  it("resolves runtime subpath at runtime", async () => {
    const runtime = await import("../dist/runtime.js");
    expect(runtime.validateRuntimeSpecJson).toBeTypeOf("function");
    expect(runtime.RUNTIME_VERSION).toBeTypeOf("string");
  });

  it("resolves theme subpath at runtime", async () => {
    const theme = await import("../dist/theme.js");
    expect(theme.cleanTheme).toBeDefined();
    expect(theme.liveTheme).toBeDefined();
  });
});
