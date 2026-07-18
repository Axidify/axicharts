import { createElement, type ReactElement } from "react";
import {
  AreaChart,
  BarChart,
  BoxplotChart,
  ViolinChart,
  SwarmChart,
  RidgelineChart,
  CandlestickChart,
  ChartContainer,
  ChartNavigator,
  CHART_NAVIGATOR_HEIGHT,
  ComboChart,
  CartesianChart,
  Gauge,
  HeatmapChart,
  HistogramChart,
  CalendarHeatmapChart,
  LineChart,
  PieChart,
  FunnelChart,
  PictorialBarChart,
  LiquidFillChart,
  RadarChart,
  ParallelChart,
  ThemeRiverChart,
  BumpChart,
  GraphChart,
  WordCloudChart,
  ScatterChart,
  Stat,
  SunburstChart,
  TreemapChart,
  WaterfallChart,
  AlertPanel,
  DataTable,
  MarkdownPanel,
  EChartsOptionChart,
  type AlertItem,
  type PlotSeries,
  type StatTone,
  type SeriesTone,
  type ComboSeries,
  type NavigatorPreset,
  readTagTones,
  applyTagTonesToSeries,
  resolveTagStatTone,
} from "@axicharts/charts";
import { GanttChart } from "@axicharts/charts-gantt";
import { GeoMapChart } from "@axicharts/charts-geo";
import { MapChart } from "@axicharts/charts-map";
import { SankeyChart } from "@axicharts/charts-sankey";
import { getChartType } from "@axicharts/charts/registry";
import type { FieldEncoding, PanelSpec, SpecData, ThemeName, ChartMode } from "./types";
import { asRows, pluckField } from "./data";
import { applySpecCompilers } from "./specCompiler";
import { resolveTheme } from "./themes";
import { fillsFromColorField } from "./colorEncoding";
import { sizesFromSizeField } from "./sizeEncoding";
import { comboSeriesFromEncoding } from "./comboEncoding";
import {
  blockMarksToChartProps,
  marksCurve,
} from "./blockMarks";
import { normalizeToCartesian } from "./normalizeToCartesian";
import {
  CartesianSpecValidationError,
  validateCartesianSpec,
} from "./cartesianValidation";
import {
  chartPropsWithoutChromeMeta,
  readPanelChrome,
} from "./panelChrome";
import {
  chartPropsWithoutChartConfig,
  readPanelChartConfig,
  toChartConfig,
} from "./panelChartConfig";
import {
  chartPropsWithoutAnimation,
  readPanelAnimation,
} from "./panelAnimation";
import {
  chartPropsWithoutLiveAnimate,
  readPanelLiveAnimate,
} from "./panelLiveAnimate";
import {
  chartPropsWithoutStyle,
  readPanelStyle,
  themeWithPanelStyle,
} from "./panelStyle";
import { registerPluginChartTypes } from "./registerPluginChartTypes";
import { assertPanelCategoryEnabled } from "./panelCategories";
import { radarFromRows, resolveHeatmapMatrix } from "./heatmapEncoding";
import { resolveCalendarHeatmapData } from "./calendarEncoding";
import { resolvePictorialBarData } from "./pictorialBarEncoding";
import { resolveLiquidFillValue } from "./liquidFillEncoding";
import { resolveMapDrillProps } from "./mapEncoding";
import { parallelFromRows, themeRiverFromRows } from "./parallelEncoding";
import { bumpFromRows } from "./bumpEncoding";
import { graphFromRows } from "./graphEncoding";
import { violinFromRows } from "./violinEncoding";
import { swarmFromRows } from "./swarmEncoding";
import { ridgelineFromRows } from "./ridgelineEncoding";
import { wordCloudFromRows } from "./wordCloudEncoding";
import { panelPropsWithAnnotations } from "./panelAnnotations";
import { panelPropsWithGraphics } from "./panelGraphics";

function panelChartProps<T extends Record<string, unknown>>(
  spec: PanelSpec,
  props: T,
): T {
  return panelPropsWithGraphics(spec, panelPropsWithAnnotations(spec, props));
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

export type CompileOptions = {
  theme?: ThemeName;
  mode?: ChartMode;
  height?: number;
  width?: number | string;
  tagTones?: Record<string, SeriesTone>;
  /** Validate cartesian/blocks panels before compile (default true). */
  validateCartesian?: boolean;
  dataProfile?: import("./types").DataProfile;
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
  const theme = themeWithPanelStyle(
    resolveTheme(options.theme ?? spec.theme),
    readPanelStyle(spec.props),
  );
  const mode = options.mode ?? spec.mode;
  const height = options.height ?? spec.height ?? 240;
  const width = options.width ?? spec.width ?? "100%";
  const dark = theme.name === "live" || theme.name === "industrial";

  const chrome = readPanelChrome(spec.props);
  const chartConfig = toChartConfig(readPanelChartConfig(spec.props));
  const syncId =
    typeof spec.props?.syncId === "string" ? spec.props.syncId : undefined;
  const syncFollower =
    typeof spec.props?.syncFollower === "string"
      ? spec.props.syncFollower
      : undefined;
  const liveAnimate = readPanelLiveAnimate(spec);

  const panel = createElement(
    ChartContainer,
    {
      theme,
      mode,
      height,
      width,
      tagTones,
      config: chartConfig,
      legendVariant: chrome.legendVariant,
      tooltipVariant: chrome.tooltipVariant,
      syncId,
      syncFollower,
      ...(liveAnimate != null ? { liveAnimate } : {}),
    },
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
    ...chartPropsFromPanel(spec.props ?? {}),
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
  if (!spec) {
    throw new Error(
      "compilePanel: panel spec is required (use the Chart `panel` prop, not `spec`)",
    );
  }
  registerPluginChartTypes();

  const resolved = applySpecCompilers(spec, data);
  assertPanelCategoryEnabled(resolved.type);
  const rows = asRows(data);
  const props = chartPropsFromPanel(resolved.props ?? {});
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
      if (
        (resolved.type === "bar" ||
          resolved.type === "line" ||
          resolved.type === "area") &&
        resolved.encoding?.color &&
        baseSeries[0]
      ) {
        const fills = fillsFromColorField(
          rows,
          resolved.encoding.color.field,
          baseSeries[0].color,
        );
        seriesWithColor = [{ ...baseSeries[0], fills }, ...baseSeries.slice(1)];
      }

      let seriesWithSize = seriesWithColor;
      if (
        (resolved.type === "bar" ||
          resolved.type === "line" ||
          resolved.type === "area") &&
        resolved.encoding?.size &&
        seriesWithSize[0]
      ) {
        const sizes = sizesFromSizeField(
          rows,
          resolved.encoding.size.field,
          resolved.type === "bar" ? "bar" : "point",
          resolved.encoding.size.range,
        );
        seriesWithSize = [
          { ...seriesWithSize[0], sizes },
          ...seriesWithSize.slice(1),
        ];
      }

      const panelLiveAnimate = readPanelLiveAnimate(resolved);

      const chartProps = panelChartProps(resolved, {
        ...props,
        categories,
        series: applyTagTonesToSeries(seriesWithSize, tagTones),
        fill: resolved.fill,
        stacked: resolved.stacked,
        valueSuffix: resolved.valueSuffix,
        animate: readPanelAnimation(resolved),
        ...(panelLiveAnimate != null ? { liveAnimate: panelLiveAnimate } : {}),
      });

      const Chart =
        resolved.type === "area"
          ? AreaChart
          : resolved.type === "bar"
            ? BarChart
            : LineChart;

      return wrap(createElement(Chart, chartProps));
    }

    case "combo": {
      const categories = resolved.encoding?.x
        ? (pluckField(rows, resolved.encoding.x) as string[])
        : (props.categories as string[] | undefined) ?? [];
      const fromEncoding = comboSeriesFromEncoding(rows, resolved.encoding?.y);
      const baseSeries =
        fromEncoding.length > 0
          ? fromEncoding
          : ((props.series as ComboSeries[] | undefined) ?? []);

      const panelLiveAnimate = readPanelLiveAnimate(resolved);

      const chartProps = panelChartProps(resolved, {
        ...props,
        categories,
        series: applyTagTonesToSeries(baseSeries, tagTones) as ComboSeries[],
        fill: resolved.fill,
        valueSuffix: resolved.valueSuffix,
        animate: readPanelAnimation(resolved),
        ...(panelLiveAnimate != null ? { liveAnimate: panelLiveAnimate } : {}),
      });

      return wrap(createElement(ComboChart, chartProps));
    }

    case "cartesian":
    case "blocks": {
      if (resolved.type === "blocks" && process.env.NODE_ENV !== "production") {
        console.warn(
          '[axicharts] Panel type "blocks" is deprecated; use type "cartesian"',
        );
      }

      const cartesian = normalizeToCartesian(resolved);
      const shouldValidate = options.validateCartesian !== false;
      if (shouldValidate) {
        const validation = validateCartesianSpec(cartesian, {
          rows,
          dataProfile: options.dataProfile,
        });
        if (!validation.ok) {
          throw new CartesianSpecValidationError(validation.errors);
        }
        for (const warning of validation.warnings) {
          if (process.env.NODE_ENV !== "production") {
            console.warn(`[axicharts] ${warning.code}: ${warning.message}`);
          }
        }
      }

      const categories = cartesian.encoding?.x
        ? (pluckField(rows, cartesian.encoding.x) as string[])
        : (props.categories as string[] | undefined) ?? [];
      const marks = cartesian.marks ?? [];
      const fromMarks = blockMarksToChartProps(rows, marks);
      const panelLiveAnimate = readPanelLiveAnimate(cartesian);
      const curve =
        marksCurve(marks) ?? readPanelStyle(cartesian.props)?.line?.curve;

      const chartProps = panelChartProps(cartesian, {
        ...props,
        categories,
        series: applyTagTonesToSeries(fromMarks.series, tagTones) as ComboSeries[],
        fill: cartesian.fill ?? fromMarks.fill,
        valueSuffix: cartesian.valueSuffix,
        ...(fromMarks.showValues || cartesian.showValues
          ? { showValues: true }
          : {}),
        ...(fromMarks.stacked || cartesian.stacked ? { stacked: true } : {}),
        ...(fromMarks.dualAxis != null
          ? { dualAxis: fromMarks.dualAxis }
          : props.dualAxis != null
            ? { dualAxis: props.dualAxis as boolean }
            : {}),
        referenceLines: [
          ...fromMarks.referenceLines,
          ...((props.referenceLines as typeof fromMarks.referenceLines | undefined) ??
            []),
        ],
        thresholdBands: [
          ...fromMarks.thresholdBands,
          ...((props.thresholdBands as typeof fromMarks.thresholdBands | undefined) ??
            []),
        ],
        ...(curve ? { curve } : {}),
        animate: readPanelAnimation(cartesian),
        ...(panelLiveAnimate != null ? { liveAnimate: panelLiveAnimate } : {}),
      });

      return wrap(createElement(CartesianChart, chartProps));
    }

    case "scatter": {
      const xField = resolved.encoding?.x?.field ?? "x";
      const yEnc = resolved.encoding?.y;
      const yField = Array.isArray(yEnc)
        ? yEnc[0]?.field
        : yEnc?.field ?? "y";
      const labelField = (props.labelField as string | undefined) ?? "label";
      const basePoints = rows.map((row) => ({
        x: Number(row[xField]),
        y: Number(row[yField]),
        label:
          row[labelField] != null ? String(row[labelField]) : undefined,
      }));
      const points =
        resolved.encoding?.size != null
          ? basePoints.map((point, index) => ({
              ...point,
              size: sizesFromSizeField(
                rows,
                resolved.encoding!.size!.field,
                "bubble",
                resolved.encoding!.size!.range,
              )[index],
            }))
          : basePoints;
      const scatterSeries =
        (props.series as Parameters<typeof ScatterChart>[0]["series"]) ??
        [
          {
            name: (props.seriesName as string | undefined) ?? "Series",
            points,
          },
        ];
      const chartProps = panelChartProps(resolved, {
        series: scatterSeries,
        ...props,
        ...(resolved.encoding?.size
          ? {
              showSizeLegend:
                (props.showSizeLegend as boolean | undefined) ?? true,
            }
          : {}),
      });
      return wrap(createElement(ScatterChart, chartProps));
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

    case "pictorial-bar":
    case "pictorialBar": {
      const chartProps = chartPropsFromPanel(resolved.props ?? {});
      const data = resolvePictorialBarData(rows, chartProps, resolved.encoding);
      return wrap(
        createElement(PictorialBarChart, {
          data,
          symbol: chartProps.symbol as string | undefined,
          symbolRepeat: chartProps.symbolRepeat as boolean | undefined,
          barGap: chartProps.barGap as number | string | undefined,
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

    case "sunburst": {
      const nameField = resolved.encoding?.name?.field ?? "name";
      const valueField = resolved.encoding?.value?.field ?? "value";
      const nodes =
        (props.nodes as Parameters<typeof SunburstChart>[0]["nodes"]) ??
        rows.map((row) => ({
          name: String(row[nameField]),
          value: Number(row[valueField]),
        }));
      return wrap(
        createElement(SunburstChart, {
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
        createElement(PieChart, panelChartProps(resolved, {
          slices,
          innerRadius,
          showLabels: props.showLabels as boolean | undefined,
        })),
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
          showLabels: props.showLabels as boolean | undefined,
          showSigns: props.showSigns as boolean | undefined,
          connectorStyle: props.connectorStyle as "solid" | "dashed" | undefined,
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
      const volumeField = props.volumeField as string | undefined;
      const volume =
        (props.volume as number[] | undefined) ??
        (volumeField
          ? (pluckField(rows, { field: volumeField, type: "quantitative" }) as number[])
          : undefined);
      return wrap(
        createElement(CandlestickChart, {
          categories,
          data: candleData,
          volume,
          brush: props.brush as boolean | undefined,
          brushStart: props.brushStart as number | undefined,
          brushEnd: props.brushEnd as number | undefined,
          sessionShading: props.sessionShading as boolean | "rth" | undefined,
        }),
      );
    }

    case "heatmap": {
      const matrix = resolveHeatmapMatrix(
        rows,
        chartPropsFromPanel(resolved.props ?? {}),
        resolved.encoding,
      );
      const chartProps = chartPropsFromPanel(resolved.props ?? {});
      return wrap(
        createElement(HeatmapChart, {
          matrix,
          min: chartProps.min as number | undefined,
          max: chartProps.max as number | undefined,
          showLabels: chartProps.showLabels as boolean | undefined,
          showAxes: chartProps.showAxes as boolean | undefined,
        }),
      );
    }

    case "calendar":
    case "calendar-heatmap": {
      const chartProps = chartPropsFromPanel(resolved.props ?? {});
      const data = resolveCalendarHeatmapData(
        rows,
        chartProps,
        resolved.encoding,
      );
      return wrap(
        createElement(CalendarHeatmapChart, {
          data,
          year: chartProps.year as number | undefined,
          range: chartProps.range as [string, string] | undefined,
          min: chartProps.min as number | undefined,
          max: chartProps.max as number | undefined,
          showLabels: chartProps.showLabels as boolean | undefined,
          cellSize: chartProps.cellSize as number | [number, number] | undefined,
        }),
      );
    }

    case "radar": {
      const chartProps = chartPropsFromPanel(resolved.props ?? {});
      const { indicators, series } = radarFromRows(
        rows,
        chartProps,
        resolved.encoding,
      );
      return wrap(
        createElement(RadarChart, {
          indicators,
          series,
          showLabels: chartProps.showLabels as boolean | undefined,
          showAxes: chartProps.showAxes as boolean | undefined,
          areaFill: chartProps.areaFill as boolean | undefined,
        }),
      );
    }

    case "parallel": {
      const chartProps = chartPropsFromPanel(resolved.props ?? {});
      const { dimensions, series } = parallelFromRows(
        rows,
        chartProps,
        resolved.encoding,
      );
      return wrap(
        createElement(ParallelChart, {
          dimensions,
          series,
          showAxes: chartProps.showAxes as boolean | undefined,
          lineOpacity: chartProps.lineOpacity as number | undefined,
        }),
      );
    }

    case "theme-river": {
      const chartProps = chartPropsFromPanel(resolved.props ?? {});
      const { points } = themeRiverFromRows(
        rows,
        chartProps,
        resolved.encoding,
      );
      return wrap(
        createElement(ThemeRiverChart, {
          points,
          showAxes: chartProps.showAxes as boolean | undefined,
        }),
      );
    }

    case "bump":
    case "bump-chart": {
      const chartProps = chartPropsFromPanel(resolved.props ?? {});
      const yEncoding = Array.isArray(resolved.encoding?.y)
        ? resolved.encoding.y[0]
        : resolved.encoding?.y;
      const data = bumpFromRows(rows, chartProps, {
        x: resolved.encoding?.x,
        y: yEncoding,
        series: resolved.encoding?.series,
      });
      return wrap(
        createElement(BumpChart, {
          data,
          maxRank: chartProps.maxRank as number | undefined,
          showLabels: chartProps.showLabels as boolean | undefined,
          showAxes: chartProps.showAxes as boolean | undefined,
          smooth: chartProps.smooth as boolean | undefined,
        }),
      );
    }

    case "graph":
    case "network": {
      const chartProps = chartPropsFromPanel(resolved.props ?? {});
      const data = graphFromRows(rows, chartProps, {
        source: resolved.encoding?.source,
        target: resolved.encoding?.target,
        value: resolved.encoding?.value,
      });
      return wrap(
        createElement(GraphChart, {
          data,
          layout: chartProps.layout as "force" | "none" | "circular" | undefined,
          roam: chartProps.roam as boolean | undefined,
          showLegend: chartProps.showLegend as boolean | undefined,
          repulsion: chartProps.repulsion as number | undefined,
          edgeLength: chartProps.edgeLength as number | [number, number] | undefined,
        }),
      );
    }

    case "wordcloud":
    case "word-cloud": {
      const chartProps = chartPropsFromPanel(resolved.props ?? {});
      const { words } = wordCloudFromRows(
        rows,
        chartProps,
        resolved.encoding,
      );
      return wrap(
        createElement(WordCloudChart, {
          words,
          shape: chartProps.shape as
            | "circle"
            | "cardioid"
            | "diamond"
            | "triangle"
            | "pentagon"
            | "star"
            | undefined,
          rotationRange: chartProps.rotationRange as [number, number] | undefined,
          gridSize: chartProps.gridSize as number | undefined,
          sizeRange: chartProps.sizeRange as [number, number] | undefined,
        }),
      );
    }

    case "boxplot": {
      const items = props.items as Parameters<typeof BoxplotChart>[0]["items"];
      const series = props.series as Parameters<typeof BoxplotChart>[0]["series"];
      return wrap(
        createElement(BoxplotChart, {
          items,
          series,
        }),
      );
    }

    case "violin": {
      const chartProps = chartPropsFromPanel(resolved.props ?? {});
      const yEncoding = Array.isArray(resolved.encoding?.y)
        ? resolved.encoding.y[0]
        : resolved.encoding?.y;
      const data = violinFromRows(rows, chartProps, {
        x: resolved.encoding?.x,
        y: yEncoding,
        series: resolved.encoding?.series,
      });
      return wrap(
        createElement(ViolinChart, {
          items: data.items,
          series: data.series,
          showAxes: chartProps.showAxes as boolean | undefined,
          valueSuffix: chartProps.valueSuffix as string | undefined,
          bandwidth: chartProps.bandwidth as number | undefined,
          showBoxplot: chartProps.showBoxplot as boolean | undefined,
          showMedianLine: chartProps.showMedianLine as boolean | undefined,
        }),
      );
    }

    case "swarm":
    case "beeswarm": {
      const chartProps = chartPropsFromPanel(resolved.props ?? {});
      const yEncoding = Array.isArray(resolved.encoding?.y)
        ? resolved.encoding.y[0]
        : resolved.encoding?.y;
      const data = swarmFromRows(rows, chartProps, {
        x: resolved.encoding?.x,
        y: yEncoding,
        series: resolved.encoding?.series,
      });
      return wrap(
        createElement(SwarmChart, {
          items: data.items,
          series: data.series,
          showAxes: chartProps.showAxes as boolean | undefined,
          valueSuffix: chartProps.valueSuffix as string | undefined,
          pointRadius: chartProps.pointRadius as number | undefined,
          pointOpacity: chartProps.pointOpacity as number | undefined,
          jitterWidth: chartProps.jitterWidth as number | undefined,
          showMedianLine: chartProps.showMedianLine as boolean | undefined,
        }),
      );
    }

    case "ridgeline":
    case "joyplot": {
      const chartProps = chartPropsFromPanel(resolved.props ?? {});
      const yEncoding = Array.isArray(resolved.encoding?.y)
        ? resolved.encoding.y[0]
        : resolved.encoding?.y;
      const data = ridgelineFromRows(rows, chartProps, {
        x: resolved.encoding?.x,
        y: yEncoding,
        series: resolved.encoding?.series,
      });
      return wrap(
        createElement(RidgelineChart, {
          items: data.items,
          series: data.series,
          showAxes: chartProps.showAxes as boolean | undefined,
          valueSuffix: chartProps.valueSuffix as string | undefined,
          bandwidth: chartProps.bandwidth as number | undefined,
          ridgeHeight: chartProps.ridgeHeight as number | undefined,
          showMedianLine: chartProps.showMedianLine as boolean | undefined,
        }),
      );
    }

    case "histogram": {
      const categories = props.categories as string[];
      const values = props.values as number[];
      return wrap(
        createElement(HistogramChart, {
          categories,
          values,
        }),
      );
    }

    case "stat": {
      const value = String(
        props.value ?? rows[0]?.[resolved.encoding?.value?.field ?? "value"] ?? "",
      );
      const label = String(props.label ?? resolved.title ?? "");
      const statElement = createElement(Stat, {
        value,
        label,
        tone:
          (props.tone as StatTone | undefined) ??
          resolveTagStatTone(tagTones, label),
        surface: props.surface as "light" | "dark" | undefined,
        monospace: props.monospace as boolean | undefined,
      });
      const panelMode = options.mode ?? spec.mode;
      return panelMode === "presentation" ? wrap(statElement) : statElement;
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

    case "liquid-fill":
    case "liquidFill": {
      const chartProps = chartPropsFromPanel(resolved.props ?? {});
      const value = resolveLiquidFillValue(rows, chartProps, resolved.encoding);
      const label = String(chartProps.label ?? resolved.title ?? "");
      return wrap(
        createElement(LiquidFillChart, {
          value,
          label,
          waves: chartProps.waves as number[] | undefined,
          color: chartProps.color as string | undefined,
          tone: chartProps.tone as SeriesTone | undefined,
          shape: chartProps.shape as
            | "circle"
            | "rect"
            | "roundRect"
            | "triangle"
            | "diamond"
            | "pin"
            | undefined,
          waveAnimation: chartProps.waveAnimation as boolean | undefined,
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

    case "navigator": {
      const categories = resolved.encoding?.x
        ? (pluckField(rows, resolved.encoding.x) as string[])
        : ((props.categories as string[]) ?? []);
      const baseSeries =
        seriesFromEncoding(rows, resolved.encoding?.y).length > 0
          ? seriesFromEncoding(rows, resolved.encoding?.y)
          : ((props.series as PlotSeries[]) ?? []);
      const navigatorProps =
        (props.navigator as Record<string, unknown> | undefined) ?? {};
      const presets =
        (props.presets as NavigatorPreset[] | undefined) ??
        (navigatorProps.presets as NavigatorPreset[] | undefined);
      const initialPreset =
        (props.initialPreset as NavigatorPreset | undefined) ??
        (navigatorProps.initialPreset as NavigatorPreset | undefined);
      const minRangePercent =
        (props.minRangePercent as number | undefined) ??
        (navigatorProps.minRangePercent as number | undefined);

      return wrapChart(
        { ...resolved, height: resolved.height ?? CHART_NAVIGATOR_HEIGHT },
        createElement(ChartNavigator, {
          categories,
          series: applyTagTonesToSeries(baseSeries, tagTones),
          presets,
          initialPreset,
          minRangePercent,
        }),
        options,
        tagTones,
      );
    }

    case "markdown":
    case "text": {
      const objectData = objectDataFromSpec(data);
      const content = String(
        props.content ??
          props.markdown ??
          objectData.content ??
          objectData.markdown ??
          rows[0]?.[resolved.encoding?.value?.field ?? "content"] ??
          "",
      );
      return createElement(MarkdownPanel, {
        content,
        surface: props.surface as "light" | "dark" | undefined,
        title: String(props.title ?? resolved.title ?? ""),
      });
    }

    case "sankey": {
      const nodes =
        (props.nodes as Parameters<typeof SankeyChart>[0]["nodes"]) ??
        (objectData.nodes as Parameters<typeof SankeyChart>[0]["nodes"]);
      const links =
        (props.links as Parameters<typeof SankeyChart>[0]["links"]) ??
        (objectData.links as Parameters<typeof SankeyChart>[0]["links"]);
      return wrap(
        createElement(SankeyChart, {
          nodes: nodes ?? [],
          links: links ?? [],
          surface: props.surface as "light" | "dark" | undefined,
        }),
      );
    }

    case "geo": {
      const regions =
        (props.regions as Parameters<typeof GeoMapChart>[0]["regions"]) ??
        (objectData.regions as Parameters<typeof GeoMapChart>[0]["regions"]);
      return wrap(
        createElement(GeoMapChart, {
          regions: regions ?? [],
          min: props.min as number | undefined,
          max: props.max as number | undefined,
          showLabels: props.showLabels as boolean | undefined,
          showScale: props.showScale as boolean | undefined,
          surface: props.surface as "light" | "dark" | undefined,
        }),
      );
    }

    case "map": {
      const topology =
        (props.topology as Parameters<typeof MapChart>[0]["topology"]) ??
        (objectData.topology as Parameters<typeof MapChart>[0]["topology"]);
      const values =
        (props.values as Parameters<typeof MapChart>[0]["values"]) ??
        (objectData.values as Parameters<typeof MapChart>[0]["values"]);
      const drillProps = resolveMapDrillProps(props);
      return wrap(
        createElement(MapChart, {
          topology: topology!,
          values: values ?? {},
          objectKey: props.objectKey as string | undefined,
          featureId: props.featureId as string | undefined,
          nameKey: props.nameKey as string | undefined,
          projection: props.projection as Parameters<typeof MapChart>[0]["projection"],
          min: props.min as number | undefined,
          max: props.max as number | undefined,
          showLabels: props.showLabels as boolean | undefined,
          showScale: props.showScale as boolean | undefined,
          surface: props.surface as "light" | "dark" | undefined,
          ...drillProps,
        }),
      );
    }

    case "gantt": {
      const tasks =
        (props.tasks as Parameters<typeof GanttChart>[0]["tasks"]) ??
        (objectData.tasks as Parameters<typeof GanttChart>[0]["tasks"]);
      const milestones =
        (props.milestones as Parameters<typeof GanttChart>[0]["milestones"]) ??
        (objectData.milestones as Parameters<typeof GanttChart>[0]["milestones"]);
      return wrap(
        createElement(GanttChart, {
          tasks: tasks ?? [],
          milestones,
          unit: props.unit as string | undefined,
          rangeStart: props.rangeStart as number | undefined,
          rangeEnd: props.rangeEnd as number | undefined,
          today: props.today as number | undefined,
          surface: props.surface as "light" | "dark" | undefined,
        }),
      );
    }

    case "echarts": {
      const option =
        (props.option as Parameters<typeof EChartsOptionChart>[0]["option"]) ??
        (objectData.option as Parameters<typeof EChartsOptionChart>[0]["option"]) ??
        (resolved as PanelSpec & { option?: unknown }).option;
      const categories =
        (props.categories as string[] | undefined) ??
        (objectData.categories as string[] | undefined);
      if (!option || typeof option !== "object") {
        throw new Error(
          '[AxiCharts] Panel type "echarts" requires an ECharts option object in props.option, data.option, or top-level option.',
        );
      }
      return wrap(
        createElement(EChartsOptionChart, panelChartProps(resolved, {
          option: option as Parameters<typeof EChartsOptionChart>[0]["option"],
          categories,
        })),
      );
    }

    default:
      return compileRegisteredPanel(resolved, data, rows, options, tagTones);
  }
}
