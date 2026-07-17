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
  Stat,
  WaterfallChart,
  type PlotSeries,
  type StatTone,
} from "@axicharts/charts";
import { getChartType } from "@axicharts/charts/registry";
import type { FieldEncoding, PanelSpec, SpecData, ThemeName, ChartMode } from "./types";
import { asRows, pluckField } from "./data";
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
  const rows = asRows(data);
  const props = spec.props ?? {};

  switch (spec.type) {
    case "line":
    case "area":
    case "bar": {
      const categories = spec.encoding?.x
        ? (pluckField(rows, spec.encoding.x) as string[])
        : (props.categories as string[] | undefined) ?? [];
      const series =
        seriesFromEncoding(rows, spec.encoding?.y).length > 0
          ? seriesFromEncoding(rows, spec.encoding?.y)
          : ((props.series as PlotSeries[] | undefined) ?? []);

      const chartProps = {
        categories,
        series,
        fill: spec.fill,
        stacked: spec.stacked,
        valueSuffix: spec.valueSuffix,
        ...props,
      };

      const Chart =
        spec.type === "area"
          ? AreaChart
          : spec.type === "bar"
            ? BarChart
            : LineChart;

      return wrapChart(spec, createElement(Chart, chartProps), options);
    }

    case "pie": {
      const nameField = spec.encoding?.name?.field ?? "name";
      const valueField = spec.encoding?.value?.field ?? "value";
      const slices = rows.map((row) => ({
        name: String(row[nameField]),
        value: Number(row[valueField]),
      }));
      return wrapChart(
        spec,
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
        spec,
        createElement(WaterfallChart, {
          items,
          valueFormat: props.valueFormat as "currency" | "number" | "compact" | undefined,
        }),
        options,
      );
    }

    case "candlestick": {
      const categories = spec.encoding?.x
        ? (pluckField(rows, spec.encoding.x) as string[])
        : ((props.categories as string[]) ?? []);
      const data = rows.map((row) => ({
        open: Number(row[spec.encoding?.open?.field ?? "open"]),
        high: Number(row[spec.encoding?.high?.field ?? "high"]),
        low: Number(row[spec.encoding?.low?.field ?? "low"]),
        close: Number(row[spec.encoding?.close?.field ?? "close"]),
      }));
      return wrapChart(
        spec,
        createElement(CandlestickChart, {
          categories,
          data,
          volume: props.volume as number[] | undefined,
        }),
        options,
      );
    }

    case "heatmap": {
      const matrix = props.matrix as Parameters<typeof HeatmapChart>[0]["matrix"];
      return wrapChart(
        spec,
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
        props.value ?? rows[0]?.[spec.encoding?.value?.field ?? "value"] ?? "",
      );
      return createElement(Stat, {
        value,
        label: String(props.label ?? spec.title ?? ""),
        tone: props.tone as StatTone | undefined,
        surface: props.surface as "light" | "dark" | undefined,
        monospace: props.monospace as boolean | undefined,
      });
    }

    case "gauge": {
      const value = Number(
        props.value ?? rows[0]?.[spec.encoding?.value?.field ?? "value"] ?? 0,
      );
      return createElement(Gauge, {
        value,
        label: String(props.label ?? spec.title ?? ""),
        unit: props.unit as string | undefined,
        warningAt: props.warningAt as number | undefined,
        criticalAt: props.criticalAt as number | undefined,
      });
    }

    default:
      return compileRegisteredPanel(spec, data, rows, options);
  }
}
