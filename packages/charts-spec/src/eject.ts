import type { PanelSpec } from "./types";
import {
  cartesianHasColorEncoding,
  cartesianUsesComposableMarks,
  ejectCartesianBody,
  ejectCartesianChartName,
  ejectCartesianImports,
} from "./ejectCartesian";
import { ejectComboBody } from "./ejectCombo";
import { chartPropsWithoutChromeMeta, readPanelChrome } from "./panelChrome";
import { chartPropsWithoutChartConfig, readPanelChartConfig } from "./panelChartConfig";
import { chartPropsWithoutStyle, readPanelStyle } from "./panelStyle";
import { chartPropsWithoutAnimation, readPanelAnimation } from "./panelAnimation";
import { chartPropsWithoutLiveAnimate } from "./panelLiveAnimate";
import { mapDrillEjectProps } from "./mapEncoding";
import { ejectGraphicsProp } from "./panelGraphics";
import {
  SIZE_SCALE_HELPER,
  sizeFieldMinMaxBlock,
} from "./ejectSizeEncoding";

function quote(value: string): string {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function chartPropsFromPanel(props: Record<string, unknown>): Record<string, unknown> {
  return chartPropsWithoutLiveAnimate(
    chartPropsWithoutAnimation(
      chartPropsWithoutChartConfig(
        chartPropsWithoutChromeMeta(chartPropsWithoutStyle(props)),
      ),
    ),
  );
}

function serializeProps(props: Record<string, unknown>, indent: string): string {
  const lines: string[] = [];
  for (const [key, value] of Object.entries(props)) {
    if (value == null) continue;
    if (typeof value === "string") {
      lines.push(`${indent}${key}={${quote(value)}}`);
    } else if (typeof value === "number" || typeof value === "boolean") {
      lines.push(`${indent}${key}={${String(value)}}`);
    } else {
      lines.push(`${indent}${key}={${JSON.stringify(value)}}`);
    }
  }
  return lines.join("\n");
}

function resolveChartName(spec: PanelSpec): string {
  if (spec.type === "line" || spec.type === "area" || spec.type === "bar") {
    return ejectCartesianChartName(spec);
  }

  return spec.type === "combo"
    ? "ComboChart"
    : spec.type === "pie"
      ? "PieChart"
      : spec.type === "donut"
        ? "PieChart"
        : spec.type === "funnel"
          ? "FunnelChart"
          : spec.type === "pictorial-bar" || spec.type === "pictorialBar"
            ? "PictorialBarChart"
          : spec.type === "liquid-fill" || spec.type === "liquidFill"
            ? "LiquidFillChart"
          : spec.type === "bump" || spec.type === "bump-chart"
            ? "BumpChart"
          : spec.type === "graph" || spec.type === "network"
            ? "GraphChart"
          : spec.type === "violin"
            ? "ViolinChart"
          : spec.type === "swarm" || spec.type === "beeswarm"
            ? "SwarmChart"
          : spec.type === "ridgeline" || spec.type === "joyplot"
            ? "RidgelineChart"
          : spec.type === "waterfall"
            ? "WaterfallChart"
            : spec.type === "candlestick"
              ? "CandlestickChart"
              : spec.type === "heatmap"
                ? "HeatmapChart"
                : spec.type === "calendar" || spec.type === "calendar-heatmap"
                  ? "CalendarHeatmapChart"
                : spec.type === "radar"
                  ? "RadarChart"
                  : spec.type === "parallel"
                    ? "ParallelChart"
                    : spec.type === "theme-river"
                      ? "ThemeRiverChart"
                      : spec.type === "wordcloud" || spec.type === "word-cloud"
                        ? "WordCloudChart"
                  : spec.type === "scatter"
                  ? "ScatterChart"
                  : spec.type === "treemap"
                    ? "TreemapChart"
                    : spec.type === "sunburst"
                      ? "SunburstChart"
                      : spec.type === "stat"
                      ? "Stat"
                      : spec.type === "table"
                      ? "DataTable"
                      : spec.type === "markdown" || spec.type === "text"
                        ? "MarkdownPanel"
                        : spec.type === "sankey"
                          ? "SankeyChart"
                          : spec.type === "geo"
                            ? "GeoMapChart"
                            : spec.type === "map"
                              ? "MapChart"
                              : spec.type === "gantt"
                                ? "GanttChart"
                                : spec.type === "echarts"
                                  ? "EChartsOptionChart"
                                  : spec.type === "navigator"
                                  ? "ChartNavigator"
                                  : "Gauge";
}

export function ejectPanel(spec: PanelSpec, dataVar = "data"): string {
  const theme = spec.theme ?? "clean";
  const panelStyle = readPanelStyle(spec.props);
  const chrome = readPanelChrome(spec.props);
  const chartConfig = readPanelChartConfig(spec.props);
  const themeImport = panelStyle
    ? `createTheme, ${theme}Theme`
    : `${theme}Theme`;
  const themeExpr = panelStyle
    ? `createTheme(${theme}Theme, ${JSON.stringify({
        name: `${theme}-panel`,
        ...panelStyle,
      })})`
    : `${theme}Theme`;
  const mode = spec.mode ? `\n  mode="${spec.mode}"` : "";
  const height = spec.height ?? 240;
  const chartName = resolveChartName(spec);
  const chromeAttrs = [
    chrome.legendVariant ? `\n  legendVariant="${chrome.legendVariant}"` : "",
    chrome.tooltipVariant ? `\n  tooltipVariant="${chrome.tooltipVariant}"` : "",
    chartConfig ? `\n  config={${JSON.stringify(chartConfig)}}` : "",
  ].join("");

  if (
    spec.type === "stat" ||
    spec.type === "gauge" ||
    spec.type === "table" ||
    spec.type === "markdown" ||
    spec.type === "text"
  ) {
    const props = chartPropsFromPanel(spec.props ?? {});
    const merged =
      spec.type === "stat" || spec.type === "gauge"
        ? { ...props, label: props.label ?? spec.title }
        : spec.type === "markdown" || spec.type === "text"
          ? {
              ...props,
              content: props.content ?? props.markdown,
              title: props.title ?? spec.title,
            }
          : props;
    return `<${chartName}\n  ${serializeProps(merged, "  ")}\n/>`;
  }

  if (
    (spec.type === "liquid-fill" || spec.type === "liquidFill") &&
    !spec.encoding?.value?.field
  ) {
    const props = chartPropsFromPanel(spec.props ?? {});
    const merged = { ...props, label: props.label ?? spec.title };
    return `<LiquidFillChart\n  ${serializeProps(merged, "  ")}\n/>`;
  }

  const encoding = spec.encoding;
  let chartBody = "";
  let preamble = "";

  if (spec.type === "line" || spec.type === "area" || spec.type === "bar") {
    const cartesian = ejectCartesianBody(spec, dataVar);
    chartBody = cartesian.body;
    preamble = cartesian.preamble ?? "";
  } else if (spec.type === "pie" || spec.type === "donut") {
    const nameField = encoding?.name?.field ?? "name";
    const valueField = encoding?.value?.field ?? "value";
    const innerRadius =
      spec.innerRadius ??
      (spec.props?.innerRadius as number | undefined) ??
      (spec.type === "donut" ? 42 : undefined);
    chartBody = `slices={${dataVar}.map((row) => ({
      name: String(row.${nameField}),
      value: Number(row.${valueField}),
    }))}${innerRadius != null ? `\n    innerRadius={${innerRadius}}` : ""}${
      spec.props?.showLabels === false ? "" : "\n    showLabels"
    }`;
  } else if (spec.type === "funnel") {
    const nameField = encoding?.name?.field ?? "name";
    const valueField = encoding?.value?.field ?? "value";
    chartBody = `stages={${dataVar}.map((row) => ({
      name: String(row.${nameField}),
      value: Number(row.${valueField}),
    }))}`;
  } else if (spec.type === "pictorial-bar" || spec.type === "pictorialBar") {
    const xField = encoding?.x?.field ?? encoding?.category?.field ?? "category";
    const yEncoding = Array.isArray(encoding?.y) ? encoding?.y[0] : encoding?.y;
    const valueField = encoding?.value?.field ?? yEncoding?.field ?? "value";
    if (encoding?.x || encoding?.y || encoding?.category || encoding?.value) {
      chartBody = `data={{
  items: ${dataVar}.map((row) => ({
    category: String(row.${xField}),
    value: Number(row.${valueField}),
  })),
  symbol: ${dataVar}.symbol,
}}`;
    } else {
      chartBody = `data={${dataVar}.data ?? { items: ${dataVar}.items ?? [] }}
    symbol={${dataVar}.symbol}`;
    }
  } else if (spec.type === "liquid-fill" || spec.type === "liquidFill") {
    const valueField = encoding?.value?.field ?? "value";
    chartBody = `value={Number(${dataVar}[0]?.${valueField} ?? 0)}`;
  } else if (spec.type === "waterfall") {
    const valueFormat = (spec.props?.valueFormat as string | undefined) ?? "currency";
    const showSigns = spec.props?.showSigns !== false;
    const connectorStyle =
      (spec.props?.connectorStyle as string | undefined) ?? "dashed";
    chartBody = `items={${dataVar}}
    valueFormat="${valueFormat}"${
      spec.props?.showLabels === false ? "" : "\n    showLabels"
    }${showSigns ? "\n    showSigns" : "\n    showSigns={false}"}${
      connectorStyle === "dashed" ? "\n    connectorStyle=\"dashed\"" : `\n    connectorStyle="${connectorStyle}"`
    }`;
  } else if (spec.type === "candlestick") {
    const volumeField = spec.props?.volumeField as string | undefined;
    const sessionShading = spec.props?.sessionShading;
    chartBody = `categories={${dataVar}.map((row) => String(row.${encoding?.x?.field ?? "time"}))}
    data={${dataVar}.map((row) => ({
      open: Number(row.open),
      high: Number(row.high),
      low: Number(row.low),
      close: Number(row.close),
    }))}${
      volumeField
        ? `\n    volume={${dataVar}.map((row) => Number(row.${volumeField}))}`
        : ""
    }${spec.props?.brush ? "\n    brush" : ""}${
      typeof spec.props?.brushEnd === "number"
        ? `\n    brushEnd={${spec.props.brushEnd}}`
        : ""
    }${
      sessionShading === "rth"
        ? '\n    sessionShading="rth"'
        : sessionShading
          ? "\n    sessionShading"
          : ""
    }`;
  } else if (spec.type === "scatter") {
    const xField = encoding?.x?.field ?? "x";
    const yField = Array.isArray(encoding?.y)
      ? encoding.y[0]?.field
      : encoding?.y?.field ?? "y";
    const labelField =
      (spec.props?.labelField as string | undefined) ?? "label";
    const sizeField = encoding?.size?.field;
    const sizeRange =
      encoding?.size?.range != null
        ? `, ${JSON.stringify(encoding.size.range)}`
        : "";
    if (sizeField) {
      const prefix = sizeField.replace(/[^a-zA-Z0-9]/g, "") || "size";
      preamble = `${SIZE_SCALE_HELPER}\n\n${sizeFieldMinMaxBlock(dataVar, sizeField, prefix)}`;
      chartBody = `series={[{
      name: "Series",
      points: ${dataVar}.map((row) => ({
        x: Number(row.${xField}),
        y: Number(row.${yField}),
        label: row.${labelField} != null ? String(row.${labelField}) : undefined,
        size: resolveSizeMark(row.${sizeField}, ${prefix}SizeMinMax.min, ${prefix}SizeMinMax.max, "bubble"${sizeRange}),
      })),
    }]}${spec.props?.showSizeLegend === false ? "" : "\n    showSizeLegend"}`;
    } else {
      chartBody = `series={[{
      name: "Series",
      points: ${dataVar}.map((row) => ({
        x: Number(row.${xField}),
        y: Number(row.${yField}),
        label: row.${labelField} != null ? String(row.${labelField}) : undefined,
      })),
    }]}`;
    }
  } else if (spec.type === "treemap") {
    chartBody = `nodes={${dataVar}.nodes ?? ${dataVar}.map((row) => ({
      name: String(row.name),
      value: Number(row.value),
    }))}${
      spec.props?.drilldown ? "\n    drilldown" : ""
    }`;
  } else if (spec.type === "sunburst") {
    chartBody = `nodes={${dataVar}.nodes ?? ${dataVar}.map((row) => ({
      name: String(row.name),
      value: Number(row.value),
    }))}`;
  } else if (spec.type === "heatmap") {
    const xField = encoding?.x?.field ?? "x";
    const yEncoding = Array.isArray(encoding?.y) ? encoding?.y[0] : encoding?.y;
    const yField = yEncoding?.field ?? "y";
    const valueField = encoding?.value?.field ?? "value";
    if (encoding?.x && encoding?.y && encoding?.value) {
      chartBody = `matrix={(() => {
  const xCategories = [...new Set(${dataVar}.map((row) => String(row.${xField})))];
  const yCategories = [...new Set(${dataVar}.map((row) => String(row.${yField})))];
  const values = yCategories.map((y) =>
    xCategories.map((x) => {
      const match = ${dataVar}.find((row) => String(row.${xField}) === x && String(row.${yField}) === y);
      return match ? Number(match.${valueField}) : 0;
    }),
  );
  return { xCategories, yCategories, values };
})()}
    min={${dataVar}.min}
    max={${dataVar}.max}${spec.props?.showLabels === false ? "" : "\n    showLabels"}`;
    } else {
      chartBody = `matrix={${dataVar}.matrix}
    min={${dataVar}.min}
    max={${dataVar}.max}${spec.props?.showLabels === false ? "" : "\n    showLabels"}`;
    }
  } else if (spec.type === "calendar" || spec.type === "calendar-heatmap") {
    const dateField = encoding?.date?.field ?? encoding?.x?.field ?? "date";
    const yEncoding = Array.isArray(encoding?.y) ? encoding?.y[0] : encoding?.y;
    const valueField = encoding?.value?.field ?? yEncoding?.field ?? "value";
    if (encoding?.date || encoding?.value || (encoding?.x && encoding?.y)) {
      chartBody = `data={{
  points: ${dataVar}.map((row) => ({
    date: String(row.${dateField}),
    value: Number(row.${valueField}),
  })),
  year: ${dataVar}.year,
  range: ${dataVar}.range,
}}`;
    } else {
      chartBody = `data={${dataVar}.data ?? { points: ${dataVar}.points ?? [] }}
    year={${dataVar}.year}
    range={${dataVar}.range}`;
    }
  } else if (spec.type === "radar") {
    const nameField = encoding?.name?.field ?? "name";
    const valueField = encoding?.value?.field ?? "value";
    const seriesField = encoding?.series?.field;
    chartBody = seriesField
      ? `indicators={[...new Set(${dataVar}.map((row) => String(row.${nameField})))].map((name) => ({ name }))}
    series={[...new Set(${dataVar}.map((row) => String(row.${seriesField})))].map((group) => ({
      name: group,
      values: [...new Set(${dataVar}.map((row) => String(row.${nameField})))].map((axis) => {
        const match = ${dataVar}.find((row) => String(row.${seriesField}) === group && String(row.${nameField}) === axis);
        return match ? Number(match.${valueField}) : 0;
      }),
    }))}`
      : `indicators={${dataVar}.indicators ?? [...new Set(${dataVar}.map((row) => String(row.${nameField})))].map((name) => ({ name }))}
    series={${dataVar}.series ?? [{
      name: "Series",
      values: ${dataVar}.map((row) => Number(row.${valueField})),
    }]}`;
  } else if (spec.type === "parallel") {
    const nameField = encoding?.name?.field ?? "name";
    chartBody = `dimensions={${dataVar}.dimensions ?? ${JSON.stringify(chartPropsFromPanel(spec.props ?? {}).dimensions ?? [])}}
    series={${dataVar}.series ?? ${dataVar}.map((row) => ({
      name: String(row.${nameField}),
      values: ${dataVar}.dimensions
        ? ${dataVar}.dimensions.map((dimension) => Number(row[dimension.field ?? dimension.name.toLowerCase().replace(/\\s+/g, "_")]))
        : Object.keys(row).filter((key) => key !== "${nameField}" && typeof row[key] === "number").map((key) => Number(row[key])),
    }))}`;
  } else if (spec.type === "theme-river") {
    const timeField = encoding?.x?.field ?? "date";
    const valueField = encoding?.value?.field ?? "value";
    const seriesField = encoding?.series?.field ?? "series";
    chartBody = `points={${dataVar}.points ?? ${dataVar}.map((row) => ({
      time: row.${timeField},
      value: Number(row.${valueField}),
      series: String(row.${seriesField}),
    }))}`;
  } else if (spec.type === "bump" || spec.type === "bump-chart") {
    const periodField = encoding?.x?.field ?? "period";
    const rankField = Array.isArray(encoding?.y)
      ? encoding.y[0]?.field
      : encoding?.y?.field ?? "rank";
    const entityField = encoding?.series?.field ?? "entity";
    chartBody = `data={${dataVar}.categories && ${dataVar}.series ? ${dataVar} : (() => {
  const categories = [...new Set(${dataVar}.map((row) => String(row.${periodField})))];
  const entities = [...new Set(${dataVar}.map((row) => String(row.${entityField})))];
  return {
    categories,
    series: entities.map((name) => ({
      name,
      ranks: categories.map((period) => {
        const match = ${dataVar}.find((row) => String(row.${periodField}) === period && String(row.${entityField}) === name);
        return match ? Number(match.${rankField}) : entities.length;
      }),
    })),
  };
})()}`;
  } else if (spec.type === "graph" || spec.type === "network") {
    const sourceField = encoding?.source?.field ?? "source";
    const targetField = encoding?.target?.field ?? "target";
    const valueField = encoding?.value?.field ?? "value";
    chartBody = `data={${dataVar}.nodes && ${dataVar}.edges ? ${dataVar} : (() => {
  const edges = ${dataVar}.map((row) => ({
    source: String(row.${sourceField}),
    target: String(row.${targetField}),
    ...(row.${valueField} != null ? { value: Number(row.${valueField}) } : {}),
  }));
  const nodeIds = [...new Set(edges.flatMap((edge) => [edge.source, edge.target]))];
  return {
    nodes: nodeIds.map((id) => ({ id, name: id })),
    edges,
  };
})()}`;
  } else if (spec.type === "violin") {
    const categoryField = encoding?.x?.field ?? "category";
    const valueField = Array.isArray(encoding?.y)
      ? encoding.y[0]?.field
      : encoding?.y?.field ?? "value";
    const seriesField = encoding?.series?.field;
    chartBody = seriesField
      ? `series={${dataVar}.series ?? (() => {
  const seriesNames = [...new Set(${dataVar}.map((row) => String(row.${seriesField})))];
  return seriesNames.map((name) => ({
    name,
    items: [...new Set(${dataVar}.filter((row) => String(row.${seriesField}) === name).map((row) => String(row.${categoryField})))].map((category) => ({
      category,
      samples: ${dataVar}.filter((row) => String(row.${seriesField}) === name && String(row.${categoryField}) === category).map((row) => Number(row.${valueField})).filter((value) => Number.isFinite(value)),
    })),
  }));
})()}`
      : `items={${dataVar}.items ?? [...new Set(${dataVar}.map((row) => String(row.${categoryField})))].map((category) => ({
  category,
  samples: ${dataVar}.filter((row) => String(row.${categoryField}) === category).map((row) => Number(row.${valueField})).filter((value) => Number.isFinite(value)),
}))}`;
  } else if (spec.type === "swarm" || spec.type === "beeswarm") {
    const categoryField = encoding?.x?.field ?? "category";
    const valueField = Array.isArray(encoding?.y)
      ? encoding.y[0]?.field
      : encoding?.y?.field ?? "value";
    const seriesField = encoding?.series?.field;
    chartBody = seriesField
      ? `series={${dataVar}.series ?? (() => {
  const seriesNames = [...new Set(${dataVar}.map((row) => String(row.${seriesField})))];
  return seriesNames.map((name) => ({
    name,
    items: [...new Set(${dataVar}.filter((row) => String(row.${seriesField}) === name).map((row) => String(row.${categoryField})))].map((category) => ({
      category,
      values: ${dataVar}.filter((row) => String(row.${seriesField}) === name && String(row.${categoryField}) === category).map((row) => Number(row.${valueField})).filter((value) => Number.isFinite(value)),
    })),
  }));
})()}`
      : `items={${dataVar}.items ?? [...new Set(${dataVar}.map((row) => String(row.${categoryField})))].map((category) => ({
  category,
  values: ${dataVar}.filter((row) => String(row.${categoryField}) === category).map((row) => Number(row.${valueField})).filter((value) => Number.isFinite(value)),
}))}`;
  } else if (spec.type === "ridgeline" || spec.type === "joyplot") {
    const categoryField = encoding?.x?.field ?? "category";
    const valueField = Array.isArray(encoding?.y)
      ? encoding.y[0]?.field
      : encoding?.y?.field ?? "value";
    const seriesField = encoding?.series?.field;
    chartBody = seriesField
      ? `series={${dataVar}.series ?? (() => {
  const seriesNames = [...new Set(${dataVar}.map((row) => String(row.${seriesField})))];
  return seriesNames.map((name) => ({
    name,
    items: [...new Set(${dataVar}.filter((row) => String(row.${seriesField}) === name).map((row) => String(row.${categoryField})))].map((category) => ({
      category,
      samples: ${dataVar}.filter((row) => String(row.${seriesField}) === name && String(row.${categoryField}) === category).map((row) => Number(row.${valueField})).filter((value) => Number.isFinite(value)),
    })),
  }));
})()}`
      : `items={${dataVar}.items ?? [...new Set(${dataVar}.map((row) => String(row.${categoryField})))].map((category) => ({
  category,
  samples: ${dataVar}.filter((row) => String(row.${categoryField}) === category).map((row) => Number(row.${valueField})).filter((value) => Number.isFinite(value)),
}))}`;
  } else if (spec.type === "wordcloud" || spec.type === "word-cloud") {
    const textField = encoding?.name?.field ?? "text";
    const valueField = encoding?.value?.field ?? "value";
    chartBody = `words={${dataVar}.words ?? ${dataVar}.map((row) => ({
      text: String(row.${textField}),
      value: Number(row.${valueField}),
    }))}`;
  } else if (spec.type === "combo") {
    chartBody = ejectComboBody(spec, dataVar);
  } else if (spec.type === "sankey") {
    chartBody = `nodes={${dataVar}.nodes ?? ${JSON.stringify(chartPropsFromPanel(spec.props ?? {}).nodes ?? [])}}
    links={${dataVar}.links ?? ${JSON.stringify(chartPropsFromPanel(spec.props ?? {}).links ?? [])}}`;
  } else if (spec.type === "geo") {
    chartBody = `regions={${dataVar}.regions ?? ${JSON.stringify(chartPropsFromPanel(spec.props ?? {}).regions ?? [])}}
    showScale={${dataVar}.showScale ?? ${String(chartPropsFromPanel(spec.props ?? {}).showScale ?? true)}}`;
  } else if (spec.type === "map") {
    chartBody = `topology={${dataVar}.topology ?? ${JSON.stringify(chartPropsFromPanel(spec.props ?? {}).topology ?? {})}}
    values={${dataVar}.values ?? ${JSON.stringify(chartPropsFromPanel(spec.props ?? {}).values ?? {})}}
    showScale={${dataVar}.showScale ?? ${String(chartPropsFromPanel(spec.props ?? {}).showScale ?? true)}}${mapDrillEjectProps(spec.props ?? {})}`;
  } else if (spec.type === "gantt") {
    chartBody = `tasks={${dataVar}.tasks ?? ${JSON.stringify(chartPropsFromPanel(spec.props ?? {}).tasks ?? [])}}
    milestones={${dataVar}.milestones ?? ${JSON.stringify(chartPropsFromPanel(spec.props ?? {}).milestones ?? [])}}
    today={${dataVar}.today ?? ${String(chartPropsFromPanel(spec.props ?? {}).today ?? "undefined")}}`;
  } else if (spec.type === "echarts") {
    const echartsProps = chartPropsFromPanel(spec.props ?? {});
    const option =
      echartsProps.option ??
      (spec as PanelSpec & { option?: unknown }).option ??
      {};
    chartBody = `option={${dataVar}.option ?? ${JSON.stringify(option)}}`;
  } else if (spec.type === "navigator") {
    const xField = encoding?.x?.field ?? "date";
    const yField = Array.isArray(encoding?.y)
      ? encoding.y[0]?.field
      : encoding?.y?.field ?? "value";
    const navigatorProps =
      (spec.props?.navigator as Record<string, unknown> | undefined) ?? {};
    const presets =
      (spec.props?.presets as unknown) ?? navigatorProps.presets;
    const initialPreset =
      (spec.props?.initialPreset as unknown) ?? navigatorProps.initialPreset;
    const minRangePercent =
      (spec.props?.minRangePercent as number | undefined) ??
      (navigatorProps.minRangePercent as number | undefined);
    chartBody = `categories={${dataVar}.map((row) => String(row.${xField}))}
    series={[{
      name: "Series",
      data: ${dataVar}.map((row) => Number(row.${yField})),
    }]}${
      presets ? `\n    presets={${JSON.stringify(presets)}}` : ""
    }${
      initialPreset ? `\n    initialPreset={${quote(String(initialPreset))}}` : ""
    }${
      typeof minRangePercent === "number"
        ? `\n    minRangePercent={${minRangePercent}}`
        : ""
    }`;
  }

  const graphicsEject = ejectGraphicsProp(spec);
  if (
    graphicsEject &&
    spec.type !== "line" &&
    spec.type !== "area" &&
    spec.type !== "bar" &&
    spec.type !== "combo"
  ) {
    chartBody += `\n    ${graphicsEject}`;
  }

  const chartProps = chartPropsFromPanel(spec.props ?? {});
  const extraProps =
  spec.type !== "combo" &&
    !cartesianUsesComposableMarks(spec) &&
    Object.keys(chartProps).length > 0
      ? `\n    ${serializeProps(chartProps, "    ")}`
      : "";

  const imports = new Set<string>(["ChartContainer"]);
  if (spec.type === "line" || spec.type === "area" || spec.type === "bar") {
    for (const item of ejectCartesianImports(spec)) {
      imports.add(item);
    }
  } else if (
    spec.type !== "sankey" &&
    spec.type !== "geo" &&
    spec.type !== "map" &&
    spec.type !== "gantt"
  ) {
    imports.add(chartName);
  }

  const pluginImport =
    spec.type === "sankey"
      ? "@axicharts/charts-sankey"
      : spec.type === "geo"
        ? "@axicharts/charts-geo"
        : spec.type === "map"
          ? "@axicharts/charts-map"
          : spec.type === "gantt"
            ? "@axicharts/charts-gantt"
            : null;

  const chartsImport = pluginImport
    ? `import { ${chartName} } from "${pluginImport}";`
    : "";

  const preambleBlock = preamble ? `${preamble}\n\n` : "";

  if (cartesianUsesComposableMarks(spec)) {
    return `${preambleBlock}import { ${[...imports].join(", ")} } from "@axicharts/charts";
import { ${themeImport} } from "@axicharts/charts-theme";
${chartsImport ? `${chartsImport}\n` : ""}
<ChartContainer theme={${themeExpr}}${mode}${chromeAttrs} height={${height}} width="100%">
  <${chartName}
    ${chartBody}
</ChartContainer>`;
  }

  return `${preambleBlock}import { ${[...imports].join(", ")} } from "@axicharts/charts";
import { ${themeImport} } from "@axicharts/charts-theme";
${chartsImport ? `${chartsImport}\n` : ""}
<ChartContainer theme={${themeExpr}}${mode}${chromeAttrs} height={${height}} width="100%">
  <${chartName}
    ${chartBody}${extraProps}
  />
</ChartContainer>`;
}
