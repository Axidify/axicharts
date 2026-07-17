import { describe, expect, it } from "vitest";
import { normalizePanelSpec, parsePanelSpecFile } from "./parseSpec";
import { runCli } from "./cli";
import { writeFileSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

describe("parseSpec", () => {
  it("rejects unsupported spec versions", () => {
    expect(() =>
      normalizePanelSpec({ specVersion: 99, type: "line" }),
    ).toThrow(/Unsupported specVersion/);
  });

  it("parses a panel file", () => {
    const spec = parsePanelSpecFile(
      JSON.stringify({
        type: "line",
        encoding: { x: { field: "day" }, y: { field: "value" } },
      }),
    );
    expect(spec.type).toBe("line");
    expect(spec.specVersion).toBe(1);
  });
});

describe("runCli", () => {
  it("ejects JSX from a panel file", () => {
    const dir = mkdtempSync(join(tmpdir(), "charts-spec-"));
    const panelPath = join(dir, "panel.json");
    writeFileSync(
      panelPath,
      JSON.stringify({
        type: "stat",
        props: { value: "42%", label: "CPU" },
      }),
    );

    const outPath = join(dir, "panel.tsx");
    const code = runCli(["eject", panelPath, "--out", outPath]);
    expect(code).toBe(0);
    expect(readFileSync(outPath, "utf8")).toContain("<Stat");
  });

  it("plans panels from a profile file", () => {
    const dir = mkdtempSync(join(tmpdir(), "charts-spec-"));
    const profilePath = join(dir, "profile.json");
    writeFileSync(
      profilePath,
      JSON.stringify({
        metrics: [{ name: "revenue", tags: { vertical: "finance" } }],
      }),
    );
    const outPath = join(dir, "panels.json");
    const code = runCli(["plan", profilePath, "--out", outPath]);
    expect(code).toBe(0);
    const output = JSON.parse(readFileSync(outPath, "utf8")) as {
      suggestedTemplate: string;
      panels: unknown[];
    };
    expect(output.suggestedTemplate).toBe("finance-pnl");
    expect(output.panels).toHaveLength(1);
  });

  it("lists all templates including plugins-wall", () => {
    const code = runCli(["templates"]);
    expect(code).toBe(0);
  });
});
