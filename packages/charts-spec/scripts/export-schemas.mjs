import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const toneEnum = ["default", "info", "success", "warning", "critical"];

const seriesMarkProps = {
  field: { type: "string" },
  label: { type: "string" },
  tone: { enum: toneEnum },
  yAxisId: { enum: ["left", "right"] },
  stack: { type: "string" },
  labels: { type: "boolean" },
  curve: { enum: ["linear", "monotone"] },
};

function seriesMarkDef(mark) {
  return {
    oneOf: [
      {
        type: "object",
        required: ["mark", "field"],
        additionalProperties: false,
        properties: { mark: { const: mark }, ...seriesMarkProps },
      },
      {
        type: "object",
        required: ["type", "field"],
        additionalProperties: false,
        properties: { type: { const: mark }, ...seriesMarkProps },
      },
    ],
  };
}

/** RFC marks accept either `mark` or `type` as the discriminator. */
function overlayMarkDef(mark, required, properties) {
  return {
    oneOf: ["mark", "type"].map((key) => ({
      type: "object",
      required: [key, ...required],
      additionalProperties: false,
      properties: { [key]: { const: mark }, ...properties },
    })),
  };
}

const xPosition = { type: ["number", "string"] };

const markDefs = {
  barMark: seriesMarkDef("bar"),
  lineMark: seriesMarkDef("line"),
  areaMark: seriesMarkDef("area"),
  pointMark: seriesMarkDef("point"),
  ruleMark: overlayMarkDef("rule", ["value"], {
    value: { type: "number" },
    label: { type: "string" },
    tone: { enum: toneEnum },
    orientation: { enum: ["horizontal", "vertical"] },
    x: xPosition,
    id: { type: "string" },
  }),
  bandMark: overlayMarkDef("band", ["min", "max"], {
    min: { type: "number" },
    max: { type: "number" },
    label: { type: "string" },
    tone: { enum: toneEnum },
    id: { type: "string" },
  }),
  textMark: overlayMarkDef("text", ["text", "y"], {
    text: { type: "string" },
    y: { type: "number" },
    x: xPosition,
    tone: { enum: toneEnum },
    position: { enum: ["top", "bottom", "left", "right", "center"] },
    id: { type: "string" },
  }),
  markerMark: overlayMarkDef("marker", ["y"], {
    y: { type: "number" },
    x: xPosition,
    label: { type: "string" },
    tone: { enum: toneEnum },
    draggable: { type: "boolean" },
    id: { type: "string" },
  }),
};

/** @type {Record<string, object>} */
const exportedSchemas = {
  "cartesian-panel.schema.json": {
    $schema: "http://json-schema.org/draft-07/schema#",
    $id: "https://axicharts.dev/schema/cartesian-panel.schema.json",
    title: "CartesianPanelSpec",
    description:
      "RFC-002 cartesian dashboard panel — type cartesian with marks[] only.",
    type: "object",
    required: ["type", "encoding", "marks"],
    additionalProperties: true,
    $defs: markDefs,
    properties: {
      specVersion: { type: "integer", const: 1 },
      type: { type: "string", const: "cartesian" },
      title: { type: "string" },
      mode: { enum: ["static", "interactive", "live"] },
      theme: { enum: ["clean", "studio", "live", "dark"] },
      height: { type: "number", minimum: 80 },
      encoding: {
        type: "object",
        required: ["x"],
        properties: {
          x: {
            type: "object",
            required: ["field"],
            properties: {
              field: { type: "string" },
              label: { type: "string" },
            },
          },
        },
      },
      marks: {
        type: "array",
        minItems: 1,
        items: {
          oneOf: [
            { $ref: "#/$defs/barMark" },
            { $ref: "#/$defs/lineMark" },
            { $ref: "#/$defs/areaMark" },
            { $ref: "#/$defs/pointMark" },
            { $ref: "#/$defs/ruleMark" },
            { $ref: "#/$defs/bandMark" },
            { $ref: "#/$defs/textMark" },
            { $ref: "#/$defs/markerMark" },
          ],
        },
      },
    },
  },
  "data-profile.schema.json": {
    $schema: "http://json-schema.org/draft-07/schema#",
    $id: "https://axicharts.dev/schema/data-profile.schema.json",
    title: "DataProfile",
    description:
      "Known metrics and row fields for cartesian planner and MCP tools.",
    type: "object",
    required: ["metrics"],
    additionalProperties: false,
    properties: {
      metrics: {
        type: "array",
        items: {
          type: "object",
          required: ["name"],
          additionalProperties: false,
          properties: {
            name: { type: "string" },
            unit: { type: "string" },
            kind: {
              enum: ["gauge", "counter", "histogram", "ohlc", "distribution"],
            },
            tags: {
              type: "object",
              additionalProperties: { type: "string" },
            },
          },
        },
      },
      fields: {
        type: "array",
        items: { type: "string" },
      },
      fieldProfiles: {
        type: "array",
        items: {
          type: "object",
          required: ["name", "role"],
          additionalProperties: false,
          properties: {
            name: { type: "string" },
            role: { enum: ["time", "dimension", "measure", "identifier"] },
            format: { enum: ["number", "currency", "percent", "compact"] },
          },
        },
      },
      grain: { enum: ["transaction", "entity", "daily", "unknown"] },
      timeSpan: {
        type: "object",
        required: ["field", "from", "to"],
        additionalProperties: false,
        properties: {
          field: { type: "string" },
          from: { type: "string" },
          to: { type: "string" },
        },
      },
      cardinalities: {
        type: "object",
        additionalProperties: { type: "number" },
      },
    },
  },
};

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const schemaDir = join(root, "schema");
const mcpSchemaDir = join(root, "..", "charts-mcp", "schema");

mkdirSync(schemaDir, { recursive: true });
mkdirSync(mcpSchemaDir, { recursive: true });

for (const [filename, schema] of Object.entries(exportedSchemas)) {
  const json = `${JSON.stringify(schema, null, 2)}\n`;
  writeFileSync(join(schemaDir, filename), json);
  if (filename === "cartesian-panel.schema.json") {
    writeFileSync(join(mcpSchemaDir, filename), json);
  }
}

console.log(
  `Exported ${Object.keys(exportedSchemas).length} schemas to packages/charts-spec/schema/`,
);
console.log("Synced cartesian-panel.schema.json to packages/charts-mcp/schema/");
