import { serializeRuntimeSpec } from "./runtimeSpec";
import {
  formatValidationErrors,
  validateRuntimeSpecJson as validateRuntimeSpecDeep,
  type RuntimeValidationIssue,
} from "./runtimeValidation";
import type { RuntimeDashboardSpec } from "./types";

export type EmbedSnippetOptions = {
  componentName?: string;
  specImportPath?: string;
  presentation?: boolean;
  alarmScopeId?: string;
};

export type EmbedBundle = {
  reactSnippet: string;
  inlineReactSnippet: string;
  specJson: string;
};

function runtimePropsLines(options: EmbedSnippetOptions): string[] {
  const lines: string[] = [];
  if (options.presentation) {
    lines.push("      presentation");
  }
  if (options.alarmScopeId) {
    lines.push(`      alarmScopeId="${options.alarmScopeId}"`);
  }
  return lines;
}

export function buildReactEmbedSnippet(
  spec: RuntimeDashboardSpec,
  options: EmbedSnippetOptions = {},
): string {
  const componentName = options.componentName ?? "Dashboard";
  const specImportPath = options.specImportPath ?? "./dashboard.runtime.json";
  const props = runtimePropsLines(options);
  const propsBlock =
    props.length > 0
      ? `\n    <RuntimeDashboard\n      spec={spec}\n      ${props.join("\n      ")}\n    />`
      : "\n    <RuntimeDashboard spec={spec} />";

  return `import { RuntimeDashboard } from "@axicharts/charts-runtime";
import spec from "${specImportPath}";

export function ${componentName}() {
  return (${propsBlock}
  );
}
`;
}

export function buildInlineReactEmbedSnippet(
  spec: RuntimeDashboardSpec,
  options: EmbedSnippetOptions = {},
): string {
  const componentName = options.componentName ?? "Dashboard";
  const specJson = serializeRuntimeSpec(spec, true);
  const props = runtimePropsLines(options);
  const propsBlock =
    props.length > 0
      ? `\n    <RuntimeDashboard\n      spec={spec}\n      ${props.join("\n      ")}\n    />`
      : "\n    <RuntimeDashboard spec={spec} />";

  return `import { RuntimeDashboard, type RuntimeDashboardSpec } from "@axicharts/charts-runtime";

const spec = ${specJson} as const satisfies RuntimeDashboardSpec;

export function ${componentName}() {
  return (${propsBlock}
  );
}
`;
}

export function buildEmbedBundle(
  spec: RuntimeDashboardSpec,
  options: EmbedSnippetOptions = {},
): EmbedBundle {
  return {
    reactSnippet: buildReactEmbedSnippet(spec, options),
    inlineReactSnippet: buildInlineReactEmbedSnippet(spec, options),
    specJson: buildPortableSpecJson(spec, true),
  };
}

export function buildPortableSpecJson(spec: RuntimeDashboardSpec, pretty = true): string {
  return serializeRuntimeSpec(spec, pretty, { schema: true });
}

export function validateRuntimeSpecJson(json: string): {
  spec: RuntimeDashboardSpec;
  error?: undefined;
  errors?: undefined;
} | {
  spec?: undefined;
  error: string;
  errors: RuntimeValidationIssue[];
} {
  const result = validateRuntimeSpecDeep(json);
  if (result.ok) {
    return { spec: result.spec };
  }
  return {
    error: formatValidationErrors(result.errors),
    errors: result.errors,
  };
}
