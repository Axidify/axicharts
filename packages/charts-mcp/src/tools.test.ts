import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { OPENAPI_TOOL_BUNDLE } from "./openapi";
import {
  callTool,
  CARTESIAN_PANEL_SCHEMA_URL,
  DATA_PROFILE_SCHEMA_URL,
  handleCreateCartesianPanel,
  handleValidateCartesianSpec,
} from "./tools";
import { describeDataProfile } from "./describeDataProfile";

const ROWS = [
  { week: "W1", revenue: 42, target: 40 },
  { week: "W2", revenue: 48, target: 44 },
];

describe("charts-mcp tools", () => {
  it("create_cartesian_panel returns cartesian spec with planner meta", () => {
    const result = handleCreateCartesianPanel({
      intent: "Weekly revenue bars with target line and quota at 50",
      fields: ["week", "revenue", "target"],
    });
    const payload = JSON.parse(result.content[0]!.text);
    expect(payload.panel.type).toBe("cartesian");
    expect(payload.panel.marks?.length).toBeGreaterThan(0);
    expect(payload.needsReview).toBe(false);
    expect(payload.schema).toBe(CARTESIAN_PANEL_SCHEMA_URL);
  });

  it("validate_cartesian_spec returns errors for unknown fields", () => {
    const created = JSON.parse(
      handleCreateCartesianPanel({
        intent: "bar chart of revenue",
        fields: ["week", "revenue"],
      }).content[0]!.text,
    );
    const spec = created.panel;
    spec.marks[0].field = "revnue";
    const result = handleValidateCartesianSpec({ spec, rows: ROWS });
    expect(result.isError).toBe(true);
    const payload = JSON.parse(result.content[0]!.text);
    expect(payload.errors.some((e: { code: string }) => e.code === "UNKNOWN_FIELD")).toBe(
      true,
    );
  });

  it("smoke: create → validate → compile without repo context", () => {
    const created = JSON.parse(
      callTool("create_cartesian_panel", {
        intent: "Weekly revenue bars with target line",
        fields: ["week", "revenue", "target"],
      }).content[0]!.text,
    );
    const validated = JSON.parse(
      callTool("validate_cartesian_spec", {
        spec: created.panel,
        rows: ROWS,
      }).content[0]!.text,
    );
    expect(validated.ok).toBe(true);
    const compiled = JSON.parse(
      callTool("compile_cartesian_panel", {
        spec: validated.spec,
        rows: ROWS,
      }).content[0]!.text,
    );
    expect(compiled.ok).toBe(true);
    expect(compiled.markCount).toBeGreaterThan(0);
  });

  it("describe_data_profile infers roles", () => {
    const profile = describeDataProfile({ rows: ROWS });
    expect(profile.fields.find((field) => field.field === "week")?.role).toBe("time");
    expect(profile.fields.find((field) => field.field === "revenue")?.role).toBe(
      "numeric",
    );
  });

  it("openapi bundle references published schema URLs", () => {
    const byName = Object.fromEntries(OPENAPI_TOOL_BUNDLE.map((tool) => [tool.name, tool]));
    expect(byName.create_cartesian_panel?.schemaUrl).toBe(CARTESIAN_PANEL_SCHEMA_URL);
    expect(byName.describe_data_profile?.schemaUrl).toBe(DATA_PROFILE_SCHEMA_URL);
    for (const tool of OPENAPI_TOOL_BUNDLE) {
      if (tool.name === "describe_data_profile") continue;
      expect(tool.schemaUrl).toBe(CARTESIAN_PANEL_SCHEMA_URL);
    }
    expect(OPENAPI_TOOL_BUNDLE.map((tool) => tool.name)).toEqual([
      "create_cartesian_panel",
      "validate_cartesian_spec",
      "revise_cartesian_panel",
      "list_cartesian_marks",
      "describe_data_profile",
      "compile_cartesian_panel",
    ]);
  });

  it("schema file requires cartesian type and marks[]", () => {
    const schemaPath = join(
      dirname(fileURLToPath(import.meta.url)),
      "../../charts-spec/schema/cartesian-panel.schema.json",
    );
    const schema = JSON.parse(readFileSync(schemaPath, "utf8")) as {
      properties: {
        type: { const: string };
        marks: { type: string; items: { oneOf: unknown[] } };
      };
      required: string[];
    };
    expect(schema.properties.type.const).toBe("cartesian");
    expect(schema.required).toContain("marks");
    expect(schema.properties.marks.type).toBe("array");
    expect(schema.properties.marks.items.oneOf.length).toBe(5);
  });
});
