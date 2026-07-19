import { CARTESIAN_PANEL_SCHEMA_URL, DATA_PROFILE_SCHEMA_URL } from "./tools";

export type OpenApiToolDefinition = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  schemaUrl: string;
};

/** OpenAPI-compatible tool bundle for non-MCP agents (LangChain, Vercel AI SDK, etc.). */
export const OPENAPI_TOOL_BUNDLE: OpenApiToolDefinition[] = [
  {
    name: "create_cartesian_panel",
    description:
      "Create a cartesian panel from natural-language intent. Intent must name mark types (bar, line, area).",
    schemaUrl: CARTESIAN_PANEL_SCHEMA_URL,
    inputSchema: {
      type: "object",
      required: ["intent"],
      properties: {
        intent: { type: "string" },
        fields: { type: "array", items: { type: "string" } },
        dataProfile: { type: "object" },
        mode: { enum: ["static", "interactive", "live"] },
        theme: { enum: ["clean", "studio", "live", "dark"] },
      },
    },
  },
  {
    name: "validate_cartesian_spec",
    description: "Validate a cartesian panel spec against sample rows or data profile.",
    schemaUrl: CARTESIAN_PANEL_SCHEMA_URL,
    inputSchema: {
      type: "object",
      required: ["spec"],
      properties: {
        spec: { type: "object" },
        dataProfile: { type: "object" },
        rows: { type: "array", items: { type: "object" } },
      },
    },
  },
  {
    name: "revise_cartesian_panel",
    description: "Revise an existing cartesian panel from a follow-up instruction.",
    schemaUrl: CARTESIAN_PANEL_SCHEMA_URL,
    inputSchema: {
      type: "object",
      required: ["spec", "instruction"],
      properties: {
        spec: { type: "object" },
        instruction: { type: "string" },
        dataProfile: { type: "object" },
      },
    },
  },
  {
    name: "list_cartesian_marks",
    description: "List the closed v1 cartesian mark catalog.",
    schemaUrl: CARTESIAN_PANEL_SCHEMA_URL,
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "describe_data_profile",
    description: "Infer field names and roles from data profile or sample rows.",
    schemaUrl: DATA_PROFILE_SCHEMA_URL,
    inputSchema: {
      type: "object",
      properties: {
        dataProfile: {
          type: "object",
          description: `Data profile input — see ${DATA_PROFILE_SCHEMA_URL}`,
        },
        rows: { type: "array", items: { type: "object" } },
      },
    },
  },
  {
    name: "compile_cartesian_panel",
    description: "Validate and compile a cartesian panel (smoke test).",
    schemaUrl: CARTESIAN_PANEL_SCHEMA_URL,
    inputSchema: {
      type: "object",
      required: ["spec", "rows"],
      properties: {
        spec: { type: "object" },
        rows: { type: "array", items: { type: "object" } },
      },
    },
  },
];
