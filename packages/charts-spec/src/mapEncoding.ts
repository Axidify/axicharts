import type { MapHierarchy } from "@axicharts/charts-map";

export function resolveMapHierarchy(
  props: Record<string, unknown>,
): MapHierarchy | undefined {
  return props.hierarchy as MapHierarchy | undefined;
}

export function resolveMapDrillProps(props: Record<string, unknown>) {
  return {
    drilldown: props.drilldown as boolean | undefined,
    hierarchy: resolveMapHierarchy(props),
    drillPath: props.drillPath as string[] | undefined,
    drillLabels: props.drillLabels as string[] | undefined,
  };
}

export function mapDrillEjectProps(props: Record<string, unknown>): string {
  const lines: string[] = [];
  if (props.drilldown) {
    lines.push("drilldown");
  }
  if (props.hierarchy) {
    lines.push(`hierarchy={${JSON.stringify(props.hierarchy)}}`);
  }
  if (Array.isArray(props.drillPath) && props.drillPath.length > 0) {
    lines.push(`drillPath={${JSON.stringify(props.drillPath)}}`);
  }
  if (Array.isArray(props.drillLabels) && props.drillLabels.length > 0) {
    lines.push(`drillLabels={${JSON.stringify(props.drillLabels)}}`);
  }
  return lines.length > 0 ? `\n    ${lines.join("\n    ")}` : "";
}
