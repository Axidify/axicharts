import { createElement, type ReactElement } from "react";
import {
  AreaChart,
  BarChart,
  CandlestickChart,
  ChartContainer,
  Gauge,
  HeatmapChart,
  LineChart,
  PieChart,
  ScatterChart,
  Stat,
  TreemapChart,
  WaterfallChart,
  type PlotSeries,
  type StatTone,
} from "@axicharts/charts";
import { getChartType } from "@axicharts/charts/registry";
import type { FieldEncoding, PanelSpec, SpecData, ThemeName, ChartMode } from "./types";
import { asRows, pluckField } from "./data";
import { applySpecCompilers } from "./specCompiler";
import { resolveTheme } from "./themes";

export type CompileOptions = {
  theme?: ThemeName;
  mode?: ChartMode;
  height?: number;
  width?: number | string;
};

function seriesFromEncoding(
  rows: Record<string, unknown>[],
  encoding: FieldEncoding | FieldEncoding[] | undefined,
): PlotSeries[] {
  if (!encoding) return [];
  const encodings = Array.isArray(encoding) ? encoding : [encoding];
  return encodings.map((item) => {
    const data = pluckField(rows, { ...item, type: "quantitative" }) as number[];
    return {
      name: item.label ?? item.field,
      data,
    };
  });
}

function wrapChart(
  spec: PanelSpec,
  chart: ReactElement,
  options: CompileOptions,
): ReactElement {
  const theme = resolveTheme(options.theme ?? spec.theme);
  const mode = options.mode ?? spec.mode;
  const height = options.height ?? spec.height ?? 240;
  const width = options.width ?? spec.width ?? "100%";

  return createElement(
    ChartContainer,
    { theme, mode, height, width },
    chart,
  );
}

function objectDataFromSpec(data: SpecData): Record<string, unknown> {
  if (Array.isArray(data)) return {};
  if (data !== null && typeof data === "object") {
    return data as Record<string, unknown>;
  }
  return {};
}

function compileRegisteredPanel(
  spec: PanelSpec,
  data: SpecData,
  rows: Record<string, unknown>[],
  options: CompileOptions,
): ReactElement {
  const registration = getChartType(spec.type);
  if (!registration) {
    throw new Error(`Unsupported panel type: ${spec.type}`);
  }

  const chartProps = {
    ...objectDataFromSpec(data),
    ...(rows[0] ?? {}),
    ...spec.props,
  };

  return wrapChart(
    spec,
    createElement(registration.Chart, chartProps),
    options,
  );
}

export function compilePanel(
  spec: PanelSpec,
  data: SpecData,
  options: CompileOptions = {},
): ReactElement {
  const resolved = applySpecCompilers(spec, data);
  const rows = asRows(data);
  const props = resolved.props ?? {};

  switch (resolved.type) {
    case "line":
    case "area":
    case "bar": {
      const categories = resolved.encoding?.x
        ? (pluckField(rows, resolved.encoding.x) as string[])
        : (props.categories as string[] | undefined) ?? [];
      const series =
        seriesFromEncoding(rows, resolved.encoding?.y).length > 0
          ? seriesFromEncoding(rows, resolved.encoding?.y)
          : ((props.series as PlotSeries[] | undefined) ?? []);

      const chartProps = {
        categories,
        series,
        fill: resolved.fill,
        stacked: resolved.stacked,
        valueSuffix: resolved.valueSuffix,
        ...props,
      };

      const Chart =
        resolved.type === "area"
          ? AreaChart
          : resolved.type === "bar"
            ? BarChart
            : LineChart;

      return wrapChart(resolved, createElement(Chart, chartProps), options);
    }

    case "scatter": {
      const xField = resolved.encoding?.x?.field ?? "x";
      const yEnc = resolved.encoding?.y;
      const yField = Array.isArray(yEnc)
        ? yEnc[0]?.field
        : yEnc?.field ?? "y";
      const labelField = (props.labelField as string | undefined) ?? "label";
      const scatterSeries =
        (props.series as Parameters<typeof ScatterChart>[0]["series"]) ??
        [
          {
            name: (props.seriesName as string | undefined) ?? "Series",
            points: rows.map((row) => ({
              x: Number(row[xField]),
              y: Number(row[yField]),
              label:
                row[labelField] != null
                  ? String(row[labelField])
                  : undefined,
            })),
          },
        ];
      return wrapChart(
        resolved,
        createElement(ScatterChart, {
          series: scatterSeries,
          ...props,
        }),
        options,
      );
    }

    case "treemap": {
      const nameField = resolved.encoding?.name?.field ?? "name";
      const valueField = resolved.encoding?.value?.field ?? "value";
      const nodes =
        (props.nodes as Parameters<typeof TreemapChart>[0]["nodes"]) ??
        rows.map((row) => ({
          name: String(row[nameField]),
          value: Number(row[valueField]),
        }));
      return wrapChart(
        resolved,
        createElement(TreemapChart, {
          nodes,
          ...props,
        }),
        options,
      );
    }

    case "pie": {
      const nameField = resolved.encoding?.name?.field ?? "name";
      const valueField = resolved.encoding?.value?.field ?? "value";
      const slices = rows.map((row) => ({
        name: String(row[nameField]),
        value: Number(row[valueField]),
      }));
      return wrapChart(
        resolved,
        createElement(PieChart, {
          slices,
          ...props,
        }),
        options,
      );
    }

    case "waterfall": {
      const items =
        (props.items as Parameters<typeof WaterfallChart>[0]["items"]) ??
        rows.map((row) => ({
          name: String(row.name ?? row.label ?? ""),
          value: Number(row.value),
          isTotal: Boolean(row.isTotal),
          tone: row.tone as "critical" | "success" | "warning" | "default" | undefined,
        }));
      return wrapChart(
        resolved,
        createElement(WaterfallChart, {
          items,
          valueFormat: props.valueFormat as "currency" | "number" | "compact" | undefined,
        }),
        options,
      );
    }

    case "candlestick": {
      const categories = resolved.encoding?.x
        ? (pluckField(rows, resolved.encoding.x) as string[])
        : ((props.categories as string[]) ?? []);
      const candleData = rows.map((row) => ({
        open: Number(row[resolved.encoding?.open?.field ?? "open"]),
        high: Number(row[resolved.encoding?.high?.field ?? "high"]),
        low: Number(row[resolved.encoding?.low?.field ?? "low"]),
        close: Number(row[resolved.encoding?.close?.field ?? "close"]),
      }));
      return wrapChart(
        resolved,
        createElement(CandlestickChart, {
          categories,
          data: candleData,
          volume: props.volume as number[] | undefined,
          brush: props.brush as boolean | undefined,
          brushEnd: props.brushEnd as number | undefined,
        }),
        options,
      );
    }

    case "heatmap": {
      const matrix = props.matrix as Parameters<typeof HeatmapChart>[0]["matrix"];
      return wrapChart(
        resolved,
        createElement(HeatmapChart, {
          matrix,
          min: props.min as number | undefined,
          max: props.max as number | undefined,
        }),
        options,
      );
    }

    case "stat": {
      const value = String(
        props.value ?? rows[0]?.[resolved.encoding?.value?.field ?? "value"] ?? "",
      );
      return createElement(Stat, {
        value,
        label: String(props.label ?? resolved.title ?? ""),
        tone: props.tone as StatTone | undefined,
        surface: props.surface as "light" | "dark" | undefined,
        monospace: props.monospace as boolean | undefined,
      });
    }

    case "gauge": {
      const value = Number(
        props.value ?? rows[0]?.[resolved.encoding?.value?.field ?? "value"] ?? 0,
      );
      return createElement(Gauge, {
        value,
        label: String(props.label ?? resolved.title ?? ""),
        unit: props.unit as string | undefined,
        warningAt: props.warningAt as number | undefined,
        criticalAt: props.criticalAt as number | undefined,
      });
    }

    default:
      return compileRegisteredPanel(resolved, data, rows, options);
  }
}
