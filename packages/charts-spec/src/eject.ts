import type { PanelSpec } from "./types";

function quote(value: string): string {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
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

export function ejectPanel(spec: PanelSpec, dataVar = "data"): string {
  const theme = spec.theme ?? "clean";
  const mode = spec.mode ? `\n      mode="${spec.mode}"` : "";
  const height = spec.height ?? 240;
  const chartName =
    spec.type === "line"
      ? "LineChart"
      : spec.type === "area"
        ? "AreaChart"
        : spec.type === "bar"
          ? "BarChart"
          : spec.type === "pie"
            ? "PieChart"
            : spec.type === "waterfall"
              ? "WaterfallChart"
              : spec.type === "candlestick"
                ? "CandlestickChart"
                : spec.type === "heatmap"
                  ? "HeatmapChart"
                  : spec.type === "scatter"
                    ? "ScatterChart"
                    : spec.type === "stat"
                    ? "Stat"
                    : "Gauge";

  if (spec.type === "stat" || spec.type === "gauge") {
    const props = spec.props ?? {};
    return `<${chartName}\n  ${serializeProps({ ...props, label: props.label ?? spec.title }, "  ")}\n/>`;
  }

  const encoding = spec.encoding;
  let chartBody = "";

  if (spec.type === "line" || spec.type === "area" || spec.type === "bar") {
    const xField = encoding?.x?.field ?? "category";
    const yField = Array.isArray(encoding?.y)
      ? encoding.y[0]?.field
      : encoding?.y?.field ?? "value";
    chartBody = `categories={${dataVar}.map((row) => String(row.${xField}))}
      series={[{ name: ${quote(yField ?? "value")}, data: ${dataVar}.map((row) => Number(row.${yField})) }]}${spec.fill ? "\n      fill" : ""}${spec.valueSuffix ? `\n      valueSuffix=${quote(spec.valueSuffix)}` : ""}`;
  } else if (spec.type === "pie") {
    const nameField = encoding?.name?.field ?? "name";
    const valueField = encoding?.value?.field ?? "value";
    chartBody = `slices={${dataVar}.map((row) => ({
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
  } else if (spec.type === "heatmap") {
    chartBody = `matrix={${dataVar}.matrix}
      min={${dataVar}.min}
      max={${dataVar}.max}`;
  }

  const extraProps = spec.props ? `\n      ${serializeProps(spec.props, "      ")}` : "";

  return `import { ChartContainer, ${chartName} } from "@axicharts/charts";
import { ${theme}Theme } from "@axicharts/charts-theme";

<ChartContainer theme={${theme}Theme}${mode} height={${height}} width="100%">
  <${chartName}
    ${chartBody}${extraProps}
  />
</ChartContainer>`;
}
