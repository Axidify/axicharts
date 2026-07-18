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
  FunnelChart,
  ScatterChart,
  Stat,
  TreemapChart,
  WaterfallChart,
  AlertPanel,
  DataTable,
  type AlertItem,
  type PlotSeries,
  type StatTone,
  type SeriesTone,
  readTagTones,
  applyTagTonesToSeries,
  resolveTagStatTone,
} from "@axicharts/charts";
import { getChartType } from "@axicharts/charts/registry";
import type { FieldEncoding, PanelSpec, SpecData, ThemeName, ChartMode } from "./types";
import { asRows, pluckField } from "./data";
import { applySpecCompilers } from "./specCompiler";
import { resolveTheme } from "./themes";
import { fillsFromColorField } from "./colorEncoding";

export type CompileOptions = {
  theme?: ThemeName;
  mode?: ChartMode;
  height?: number;
  width?: number | string;
  tagTones?: Record<string, SeriesTone>;
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
  tagTones?: Record<string, SeriesTone>,
): ReactElement {
  const theme = resolveTheme(options.theme ?? spec.theme);
  const mode = options.mode ?? spec.mode;
  const height = options.height ?? spec.height ?? 240;
  const width = options.width ?? spec.width ?? "100%";
  const dark = theme.name === "live" || theme.name === "industrial";

  const panel = createElement(
    ChartContainer,
    { theme, mode, height, width, tagTones },
    chart,
  );

  if (!spec.title) return panel;

  return createElement(
    "div",
    {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 6,
        minWidth: 0,
      },
    },
    createElement(
      "div",
      {
        style: {
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color: dark ? "#94a3b8" : "#64748b",
        },
      },
      spec.title,
    ),
    panel,
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
  tagTones: Record<string, SeriesTone>,
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
    tagTones,
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
  const objectData = objectDataFromSpec(data);
  const tagTones = options.tagTones ?? readTagTones(objectData);
  const wrap = (chart: ReactElement) =>
    wrapChart(resolved, chart, options, tagTones);

  switch (resolved.type) {
    case "line":
    case "area":
    case "bar": {
      const categories = resolved.encoding?.x
        ? (pluckField(rows, resolved.encoding.x) as string[])
        : (props.categories as string[] | undefined) ?? [];
      const baseSeries =
        seriesFromEncoding(rows, resolved.encoding?.y).length > 0
          ? seriesFromEncoding(rows, resolved.encoding?.y)
          : ((props.series as PlotSeries[] | undefined) ?? []);

      let seriesWithColor = baseSeries;
      if (resolved.type === "bar" && resolved.encoding?.color && baseSeries[0]) {
        const fills = fillsFromColorField(
          rows,
          resolved.encoding.color.field,
          baseSeries[0].color,
        );
        seriesWithColor = [{ ...baseSeries[0], fills }, ...baseSeries.slice(1)];
      }

      const chartProps = {
        ...props,
        categories,
        series: applyTagTonesToSeries(seriesWithColor, tagTones),
        fill: resolved.fill,
        stacked: resolved.stacked,
        valueSuffix: resolved.valueSuffix,
      };

      const Chart =
        resolved.type === "area"
          ? AreaChart
          : resolved.type === "bar"
            ? BarChart
            : LineChart;

      return wrap(createElement(Chart, chartProps));
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
      return wrap(
        createElement(ScatterChart, {
          series: scatterSeries,
          ...props,
        }),
      );
    }

    case "funnel": {
      const nameField = resolved.encoding?.name?.field ?? "name";
      const valueField = resolved.encoding?.value?.field ?? "value";
      const stages =
        (props.stages as Parameters<typeof FunnelChart>[0]["stages"]) ??
        rows.map((row) => ({
          name: String(row[nameField]),
          value: Number(row[valueField]),
        }));
      return wrap(
        createElement(FunnelChart, {
          stages,
          ...props,
        }),
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
      return wrap(
        createElement(TreemapChart, {
          nodes,
          ...props,
        }),
      );
    }

    case "pie":
    case "donut": {
      const nameField = resolved.encoding?.name?.field ?? "name";
      const valueField = resolved.encoding?.value?.field ?? "value";
      const slices =
        (props.slices as Parameters<typeof PieChart>[0]["slices"]) ??
        rows.map((row) => ({
          name: String(row[nameField]),
          value: Number(row[valueField]),
        }));
      const innerRadius =
        resolved.innerRadius ??
        (props.innerRadius as number | undefined) ??
        (resolved.type === "donut" ? 42 : undefined);
      return wrap(
        createElement(PieChart, {
          slices,
          innerRadius,
          showLabels: props.showLabels as boolean | undefined,
        }),
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
      return wrap(
        createElement(WaterfallChart, {
          items,
          valueFormat: props.valueFormat as "currency" | "number" | "compact" | undefined,
        }),
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
      return wrap(
        createElement(CandlestickChart, {
          categories,
          data: candleData,
          volume: props.volume as number[] | undefined,
          brush: props.brush as boolean | undefined,
          brushEnd: props.brushEnd as number | undefined,
        }),
      );
    }

    case "heatmap": {
      const matrix = props.matrix as Parameters<typeof HeatmapChart>[0]["matrix"];
      return wrap(
        createElement(HeatmapChart, {
          matrix,
          min: props.min as number | undefined,
          max: props.max as number | undefined,
        }),
      );
    }

    case "stat": {
      const value = String(
        props.value ?? rows[0]?.[resolved.encoding?.value?.field ?? "value"] ?? "",
      );
      const label = String(props.label ?? resolved.title ?? "");
      return createElement(Stat, {
        value,
        label,
        tone:
          (props.tone as StatTone | undefined) ??
          resolveTagStatTone(tagTones, label),
        surface: props.surface as "light" | "dark" | undefined,
        monospace: props.monospace as boolean | undefined,
      });
    }

    case "gauge": {
      const value = Number(
        props.value ?? rows[0]?.[resolved.encoding?.value?.field ?? "value"] ?? 0,
      );
      const label = String(props.label ?? resolved.title ?? "");
      return wrap(
        createElement(Gauge, {
          value,
          label,
          unit: props.unit as string | undefined,
          warningAt: props.warningAt as number | undefined,
          criticalAt: props.criticalAt as number | undefined,
          tone:
            (props.tone as StatTone | undefined) ??
            resolveTagStatTone(tagTones, label),
        }),
      );
    }

    case "table": {
      const columns =
        (props.columns as Parameters<typeof DataTable>[0]["columns"]) ?? [];
      const tableRows =
        rows.length > 0
          ? (rows as Parameters<typeof DataTable>[0]["rows"])
          : ((props.rows as Parameters<typeof DataTable>[0]["rows"]) ?? []);
      return createElement(DataTable, {
        columns,
        rows: tableRows,
        surface: props.surface as "light" | "dark" | undefined,
        compact: props.compact as boolean | undefined,
        caption: String(props.caption ?? resolved.title ?? ""),
      });
    }

    case "alert": {
      const objectData = objectDataFromSpec(data);
      const alarmRows =
        (props.alarms as AlertItem[]) ??
        (Array.isArray(objectData.alarms) ? (objectData.alarms as AlertItem[]) : []);
      return createElement(AlertPanel, {
        alarms: alarmRows,
        surface: props.surface as "light" | "dark" | undefined,
        title: String(props.title ?? resolved.title ?? "Active alarms"),
      });
    }

    default:
      return compileRegisteredPanel(resolved, data, rows, options, tagTones);
  }
}
