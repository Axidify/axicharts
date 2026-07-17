import { serializeRuntimeSpec } from "./runtimeSpec";
import type { RuntimeDashboardSpec } from "./types";

export type EmbedSnippetOptions = {
  componentName?: string;
  specImportPath?: string;
};

export function buildReactEmbedSnippet(
  spec: RuntimeDashboardSpec,
  options: EmbedSnippetOptions = {},
): string {
  const componentName = options.componentName ?? "Dashboard";
  const specImportPath = options.specImportPath ?? "./dashboard.runtime.json";

  return `import { RuntimeDashboard } from "@axicharts/charts-runtime";
import spec from "${specImportPath}";

export function ${componentName}() {
  return <RuntimeDashboard spec={spec} />;
}
`;
}

export function buildPortableSpecJson(spec: RuntimeDashboardSpec, pretty = true): string {
  return serializeRuntimeSpec(spec, pretty);
}
