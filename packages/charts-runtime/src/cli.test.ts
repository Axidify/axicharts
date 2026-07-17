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

  it("validates example runtime specs with JSON Schema", () => {
    const code = runCli([
      "validate",
      "--schema",
      join(examplesDir, "ops-mosaic.runtime.json"),
    ]);
    expect(code).toBe(0);
  });

  it("runs dual schema + semantic gate", () => {
    const code = runCli([
      "validate",
      "--all",
      join(examplesDir, "ops-embed.runtime.json"),
    ]);
    expect(code).toBe(0);
  });

  it("rejects invalid runtime specs at schema layer", () => {
    const dir = mkdtempSync(join(tmpdir(), "charts-runtime-cli-schema-"));
    const invalidPath = join(dir, "invalid.runtime.json");
    writeFileSync(
      invalidPath,
      JSON.stringify({
        layout: "embed",
        dashboard: { title: "Missing template" },
      }),
    );
    expect(runCli(["validate", "--schema", invalidPath])).toBe(1);
    expect(runCli(["validate", invalidPath])).toBe(1);
  });
});
