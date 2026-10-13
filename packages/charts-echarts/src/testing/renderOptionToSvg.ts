import * as echarts from "echarts";

/**
 * Render an ECharts option through real ECharts (SSR, SVG renderer) so tests can
 * assert on drawn output — not just option shape. Custom-series `renderItem`
 * bugs only surface here.
 */
export function renderOptionToSvg(
  option: Record<string, unknown>,
  { width = 640, height = 360 }: { width?: number; height?: number } = {},
): string {
  const chart = echarts.init(null, undefined, {
    renderer: "svg",
    ssr: true,
    width,
    height,
  });
  try {
    chart.setOption({ ...option, animation: false });
    return chart.renderToSVGString();
  } finally {
    chart.dispose();
  }
}

/**
 * Count filled `<path>` / `<polygon>` elements — drawn data shapes, not axis or
 * grid strokes. Custom-series polygons serialize as `<polygon>`.
 */
export function countFilledShapes(svg: string): number {
  const tags = svg.match(/<(path|polygon)\s[^>]*>/g) ?? [];
  return tags.filter(
    (tag) => /\sfill="[^"]+"/.test(tag) && !/\sfill="(none|transparent)"/.test(tag),
  ).length;
}

/** Axis label text in render order. */
export function svgTexts(svg: string): string[] {
  return [...svg.matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map((match) => match[1]!);
}
