import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { runCli } from "./cli";

const examplesDir = join(dirname(fileURLToPath(import.meta.url)), "..", "examples");

describe("charts-runtime cli", () => {
  it("validates example runtime specs", () => {
    const code = runCli([
      "validate",
      join(examplesDir, "ops-mosaic.runtime.json"),
    ]);
    expect(code).toBe(0);
  });

  it("fails on invalid runtime specs", () => {
    const dir = mkdtempSync(join(tmpdir(), "charts-runtime-cli-"));
    const invalidPath = join(dir, "invalid.runtime.json");
    writeFileSync(invalidPath, '{"layout":"embed"}');
    expect(runCli(["validate", invalidPath])).toBe(1);
  });

  it("prints runtime JSON schema", () => {
    const code = runCli(["schema", "runtime-spec"]);
    expect(code).toBe(0);
  });
});
