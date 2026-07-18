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
});
