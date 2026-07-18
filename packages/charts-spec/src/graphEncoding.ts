import type { GraphChartData, GraphEdge, GraphNode } from "@axicharts/charts-echarts";
import type { FieldEncoding } from "./types";

export function graphFromRows(
  rows: Record<string, unknown>[],
  props: Record<string, unknown>,
  encoding?: {
    source?: FieldEncoding;
    target?: FieldEncoding;
    value?: FieldEncoding;
  },
): GraphChartData {
  const nodesFromProps = props.nodes as GraphNode[] | undefined;
  const edgesFromProps = props.edges as GraphEdge[] | undefined;
  const categories = props.categories as GraphChartData["categories"];

  if (nodesFromProps && edgesFromProps) {
    return { nodes: nodesFromProps, edges: edgesFromProps, categories };
  }

  const sourceField =
    encoding?.source?.field ??
    (props.sourceField as string | undefined) ??
    "source";
  const targetField =
    encoding?.target?.field ??
    (props.targetField as string | undefined) ??
    "target";
  const valueField =
    encoding?.value?.field ?? (props.valueField as string | undefined);

  const edges: GraphEdge[] =
    edgesFromProps ??
    rows.map((row) => ({
      source: String(row[sourceField]),
      target: String(row[targetField]),
      ...(valueField != null && row[valueField] != null
        ? { value: Number(row[valueField]) }
        : {}),
    }));

  const nodes: GraphNode[] =
    nodesFromProps ??
    [...new Set(edges.flatMap((edge) => [edge.source, edge.target]))].map((id) => ({
      id,
      name: id,
    }));

  return { nodes, edges, categories };
}
