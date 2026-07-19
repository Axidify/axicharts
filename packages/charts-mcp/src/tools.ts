import {
  compilePanel,
  createCartesianPanel,
  listCartesianMarks,
  normalizeToCartesian,
  reviseCartesianPanel,
  validateCartesianSpec,
  CARTESIAN_PANEL_SCHEMA_URL,
  DATA_PROFILE_SCHEMA_URL,
  type ChartMode,
  type DataProfile,
  type PanelSpec,
  type SpecData,
  type ThemeName,
} from "@axicharts/charts-spec";
import { describeDataProfile } from "./describeDataProfile";

function asRowArray(rows?: SpecData): Record<string, unknown>[] | undefined {
  if (rows == null) return undefined;
  return Array.isArray(rows) ? rows : [rows];
}

export { CARTESIAN_PANEL_SCHEMA_URL, DATA_PROFILE_SCHEMA_URL };

export type ToolTextResult = {
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
};

function jsonResult(payload: unknown, isError = false): ToolTextResult {
  return {
    content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
    isError,
  };
}

export function handleCreateCartesianPanel(args: {
  intent: string;
  dataProfile?: DataProfile;
  fields?: string[];
  mode?: ChartMode;
  theme?: ThemeName;
}): ToolTextResult {
  const result = createCartesianPanel({
    intent: args.intent,
    dataProfile: args.dataProfile,
    fields: args.fields,
    mode: args.mode,
    theme: args.theme,
  });
  return jsonResult({
    schema: CARTESIAN_PANEL_SCHEMA_URL,
    ...result,
  });
}

export function handleValidateCartesianSpec(args: {
  spec: PanelSpec;
  dataProfile?: DataProfile;
  rows?: SpecData;
}): ToolTextResult {
  const panel =
    args.spec.type === "cartesian" || args.spec.type === "blocks"
      ? normalizeToCartesian(args.spec)
      : args.spec;
  const validation = validateCartesianSpec(panel, {
    dataProfile: args.dataProfile,
    rows: asRowArray(args.rows),
  });
  if (!validation.ok) {
    return jsonResult(
      {
        ok: false,
        schema: CARTESIAN_PANEL_SCHEMA_URL,
        errors: validation.errors,
      },
      true,
    );
  }
  return jsonResult({
    ok: true,
    schema: CARTESIAN_PANEL_SCHEMA_URL,
    spec: panel,
    warnings: validation.warnings,
  });
}

export function handleReviseCartesianPanel(args: {
  spec: PanelSpec;
  instruction: string;
  dataProfile?: DataProfile;
}): ToolTextResult {
  const result = reviseCartesianPanel(args);
  return jsonResult({
    schema: CARTESIAN_PANEL_SCHEMA_URL,
    ...result,
  });
}

export function handleListCartesianMarks(): ToolTextResult {
  return jsonResult({
    schema: CARTESIAN_PANEL_SCHEMA_URL,
    catalog: listCartesianMarks(),
    closedSet: listCartesianMarks().map((entry) => entry.mark),
  });
}

export function handleDescribeDataProfile(args: {
  dataProfile?: DataProfile;
  rows?: SpecData;
}): ToolTextResult {
  return jsonResult({
    schema: DATA_PROFILE_SCHEMA_URL,
    ...describeDataProfile({
      dataProfile: args.dataProfile,
      rows: asRowArray(args.rows),
    }),
  });
}

export function handleCompileCartesianPanel(args: {
  spec: PanelSpec;
  rows: SpecData;
}): ToolTextResult {
  const validation = validateCartesianSpec(args.spec, { rows: asRowArray(args.rows) });
  if (!validation.ok) {
    return jsonResult({ ok: false, errors: validation.errors }, true);
  }
  const panel = normalizeToCartesian(args.spec);
  try {
    compilePanel(panel, asRowArray(args.rows) ?? []);
  } catch (error) {
    return jsonResult(
      {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      },
      true,
    );
  }
  return jsonResult({
    ok: true,
    panelType: panel.type,
    markCount: panel.marks?.length ?? 0,
    warnings: validation.warnings,
  });
}

export const TOOL_HANDLERS = {
  create_cartesian_panel: handleCreateCartesianPanel,
  validate_cartesian_spec: handleValidateCartesianSpec,
  revise_cartesian_panel: handleReviseCartesianPanel,
  list_cartesian_marks: handleListCartesianMarks,
  describe_data_profile: handleDescribeDataProfile,
  compile_cartesian_panel: handleCompileCartesianPanel,
} as const;

export type ToolName = keyof typeof TOOL_HANDLERS;

export function callTool(name: ToolName, args: unknown): ToolTextResult {
  const handler = TOOL_HANDLERS[name];
  return handler(args as never);
}
