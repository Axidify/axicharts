import type { ChartTheme } from "@axicharts/charts-theme";
import { seriesPalette, toneColor } from "./themeBridge";
import type { TreemapNode } from "./treemapTypes";

type EChartsTreemapDatum = {
  name: string;
  value?: number;
  itemStyle?: { color: string };
  children?: EChartsTreemapDatum[];
};

export function mapTreemapData(
  nodes: TreemapNode[],
  theme?: Pick<ChartTheme, "tokens">,
  paletteStart = 0,
): EChartsTreemapDatum[] {
  const palette = seriesPalette(theme);
  return nodes.map((node, index) => {
    const color =
      toneColor(node.tone, theme) ??
      palette[(paletteStart + index) % palette.length]!;
    const mapped: EChartsTreemapDatum = {
      name: node.name,
      itemStyle: { color },
    };
    if (node.value != null) {
      mapped.value = node.value;
    }
    if (node.children?.length) {
      mapped.children = mapTreemapData(node.children, theme, paletteStart + index + 1);
    }
    return mapped;
  });
}

export function flattenTreemapValues(nodes: TreemapNode[]): number[] {
  const values: number[] = [];
  for (const node of nodes) {
    if (node.children?.length) {
      values.push(...flattenTreemapValues(node.children));
    } else if (node.value != null) {
      values.push(node.value);
    }
  }
  return values;
}
