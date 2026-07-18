import type { PanelSpec } from "./types";
import {
  cartesianHasColorEncoding,
  cartesianUsesComposableMarks,
  ejectCartesianBody,
  ejectCartesianChartName,
  ejectCartesianImports,
} from "./ejectCartesian";
import { chartPropsWithoutChromeMeta, readPanelChrome } from "./panelChrome";
import { chartPropsWithoutChartConfig, readPanelChartConfig } from "./panelChartConfig";
import { chartPropsWithoutStyle, readPanelStyle } from "./panelStyle";

function quote(value: string): string {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function chartPropsFromPanel(props: Record<string, unknown>): Record<string, unknown> {
  return chartPropsWithoutChartConfig(
    chartPropsWithoutChromeMeta(chartPropsWithoutStyle(props)),
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

  return spec.type === "pie"
    ? "PieChart"
    : spec.type === "donut"
      ? "PieChart"
      : spec.type === "funnel"
        ? "FunnelChart"
        : spec.type === "waterfall"
          ? "WaterfallChart"
          : spec.type === "candlestick"
            ? "CandlestickChart"
            : spec.type === "heatmap"
              ? "HeatmapChart"
              : spec.type === "scatter"
                ? "ScatterChart"
                : spec.type === "treemap"
                  ? "TreemapChart"
                  : spec.type === "stat"
                    ? "Stat"
                    : spec.type === "table"
                      ? "DataTable"
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

  if (spec.type === "stat" || spec.type === "gauge" || spec.type === "table") {
    const props = chartPropsFromPanel(spec.props ?? {});
    const merged =
      spec.type === "stat" || spec.type === "gauge"
        ? { ...props, label: props.label ?? spec.title }
        : props;
    return `<${chartName}\n  ${serializeProps(merged, "  ")}\n/>`;
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
    }))}${innerRadius != null ? `\n    innerRadius={${innerRadius}}` : ""}`;
  } else if (spec.type === "funnel") {
    const nameField = encoding?.name?.field ?? "name";
    const valueField = encoding?.value?.field ?? "value";
    chartBody = `stages={${dataVar}.map((row) => ({
      name: String(row.${nameField}),
      value: Number(row.${valueField}),
    }))}`;
  } else if (spec.type === "waterfall") {
    chartBody = `items={${dataVar}}
    valueFormat="currency"`;
  } else if (spec.type === "candlestick") {
    chartBody = `categories={${dataVar}.map((row) => String(row.${encoding?.x?.field ?? "time"}))}
    data={${dataVar}.map((row) => ({
      open: Number(row.open),
      high: Number(row.high),
      low: Number(row.low),
      close: Number(row.close),
    }))}`;
  } else if (spec.type === "scatter") {
    const xField = encoding?.x?.field ?? "x";
    const yField = Array.isArray(encoding?.y)
      ? encoding.y[0]?.field
      : encoding?.y?.field ?? "y";
    chartBody = `series={[{
      name: "Series",
      points: ${dataVar}.map((row) => ({
        x: Number(row.${xField}),
        y: Number(row.${yField}),
        label: row.label != null ? String(row.label) : undefined,
      })),
    }]}`;
  } else if (spec.type === "treemap") {
    chartBody = `nodes={${dataVar}.nodes ?? ${dataVar}.map((row) => ({
      name: String(row.name),
      value: Number(row.value),
    }))}`;
  } else if (spec.type === "heatmap") {
    chartBody = `matrix={${dataVar}.matrix}
    min={${dataVar}.min}
    max={${dataVar}.max}`;
  }

  const chartProps = chartPropsFromPanel(spec.props ?? {});
  const extraProps =
    !cartesianUsesComposableMarks(spec) && Object.keys(chartProps).length > 0
      ? `\n    ${serializeProps(chartProps, "    ")}`
      : "";

  const imports = new Set<string>(["ChartContainer"]);
  if (spec.type === "line" || spec.type === "area" || spec.type === "bar") {
    for (const item of ejectCartesianImports(spec)) {
      imports.add(item);
    }
  } else {
    imports.add(chartName);
  }

  const preambleBlock = preamble ? `${preamble}\n\n` : "";

  if (cartesianUsesComposableMarks(spec)) {
    return `${preambleBlock}import { ${[...imports].join(", ")} } from "@axicharts/charts";
import { ${themeImport} } from "@axicharts/charts-theme";

<ChartContainer theme={${themeExpr}}${mode}${chromeAttrs} height={${height}} width="100%">
  <${chartName}
    ${chartBody}
</ChartContainer>`;
  }

  return `${preambleBlock}import { ${[...imports].join(", ")} } from "@axicharts/charts";
import { ${themeImport} } from "@axicharts/charts-theme";

<ChartContainer theme={${themeExpr}}${mode}${chromeAttrs} height={${height}} width="100%">
  <${chartName}
    ${chartBody}${extraProps}
  />
</ChartContainer>`;
}
