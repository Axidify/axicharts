import { ejectGraphicsProp } from "./panelGraphics";
import { readPanelStyle } from "./panelStyle";
import { readPanelOrientation } from "./panelOrientation";
import { readPanelAnimation, animationToSpecField } from "./panelAnimation";
import { readPanelLiveAnimate } from "./panelLiveAnimate";
import {
  cartesianHasSizeEncoding,
  ejectSizeProp,
  SIZE_SCALE_HELPER,
  sizeFieldMinMaxBlock,
} from "./ejectSizeEncoding";

export { cartesianHasSizeEncoding };

const COLOR_FILL_HELPER = `function resolveColorFill(raw: unknown): string {
  if (raw === true || raw === "success") return "#16a34a";
  if (raw === false || raw === "critical") return "#dc2626";
  if (raw === "warning") return "#d97706";
  if (raw === "info") return "#0891b2";
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (
      trimmed.startsWith("#") ||
      trimmed.startsWith("hsl") ||
      trimmed.startsWith("rgb") ||
      trimmed.startsWith("var(")
    ) {
      return trimmed;
    }
  }
  return "#2563eb";
}`;

function markName(type: PanelSpec["type"]): "Bar" | "Line" | "Area" {
  if (type === "area") return "Area";
  if (type === "bar") return "Bar";
  return "Line";
}

function resolveChartName(type: PanelSpec["type"]): string {
  if (type === "area") return "AreaChart";
  if (type === "bar") return "BarChart";
  return "LineChart";
}

export function cartesianHasColorEncoding(spec: PanelSpec): boolean {
  return (
    (spec.type === "line" || spec.type === "area" || spec.type === "bar") &&
    Boolean(spec.encoding?.color?.field)
  );
}

export function cartesianUsesComposableMarks(spec: PanelSpec): boolean {
  return cartesianHasColorEncoding(spec) || cartesianHasSizeEncoding(spec);
}

export function ejectCartesianChartName(spec: PanelSpec): string {
  return resolveChartName(spec.type);
}

export function ejectCartesianImports(spec: PanelSpec): string[] {
  if (!cartesianUsesComposableMarks(spec)) {
    return [ejectCartesianChartName(spec)];
  }

  const mark = markName(spec.type);
  return [ejectCartesianChartName(spec), mark, "Cell", "XAxis", "YAxis"];
}

function curveTypeAttr(spec: PanelSpec): string {
  const curve = readPanelStyle(spec.props)?.line?.curve;
  if (curve !== "linear" && curve !== "monotone") return "";
  if (spec.type !== "line" && spec.type !== "area") return "";
  return `\n      type="${curve}"`;
}

function chartLevelCurveFlag(spec: PanelSpec): string {
  const curve = readPanelStyle(spec.props)?.line?.curve;
  if (curve !== "linear" && curve !== "monotone") return "";
  if (spec.type !== "line" && spec.type !== "area") return "";
  if (cartesianUsesComposableMarks(spec)) return "";
  return `curve="${curve}"`;
}

function chartLevelFlags(spec: PanelSpec): string[] {
  const annotations = spec.annotations ?? spec.props?.annotations;
  const animation = animationToSpecField(readPanelAnimation(spec));
  const liveAnimate = readPanelLiveAnimate(spec);
  return [
    spec.fill && spec.type !== "bar" ? "fill" : "",
    spec.stacked ? "stacked" : "",
    readPanelOrientation(spec) === "horizontal" ? `orientation="horizontal"` : "",
    spec.valueSuffix ? `valueSuffix="${spec.valueSuffix}"` : "",
    spec.props?.showValues === true ? "showValues" : "",
    chartLevelCurveFlag(spec),
    animation ? `animate={${JSON.stringify(animation)}}` : "",
    liveAnimate ? `liveAnimate="${liveAnimate}"` : "",
    Array.isArray(annotations) && annotations.length > 0
      ? `annotations={${JSON.stringify(annotations)}}`
      : "",
    ejectGraphicsProp(spec),
  ].filter((item): item is string => Boolean(item));
}

function buildPreamble(spec: PanelSpec, dataVar: string): string | undefined {
  const parts: string[] = [];
  if (cartesianHasColorEncoding(spec)) {
    parts.push(COLOR_FILL_HELPER);
  }
  if (cartesianHasSizeEncoding(spec)) {
    parts.push(SIZE_SCALE_HELPER);
    const field = spec.encoding!.size!.field;
    const prefix = field.replace(/[^a-zA-Z0-9]/g, "") || "size";
    parts.push(sizeFieldMinMaxBlock(dataVar, field, prefix));
  }
  return parts.length > 0 ? parts.join("\n\n") : undefined;
}

function buildCellAttrs(spec: PanelSpec, dataVar: string): string[] {
  const attrs: string[] = [];
  const colorField = spec.encoding?.color?.field;
  if (colorField) {
    attrs.push(`fill={resolveColorFill(row.${colorField})}`);
  }

  const sizeField = spec.encoding?.size?.field;
  if (sizeField) {
    const prefix = sizeField.replace(/[^a-zA-Z0-9]/g, "") || "size";
    const sizeProp = ejectSizeProp(spec, dataVar, prefix);
    if (sizeProp) attrs.push(sizeProp);
  }

  return attrs;
}

export function ejectCartesianBody(
  spec: PanelSpec,
  dataVar: string,
): { body: string; preamble?: string } {
  const encoding = spec.encoding;
  const xField = encoding?.x?.field ?? "category";
  const yField = Array.isArray(encoding?.y)
    ? encoding.y[0]?.field
    : encoding?.y?.field ?? "value";

  if (cartesianUsesComposableMarks(spec)) {
    const mark = markName(spec.type);
    const chart = resolveChartName(spec.type);
    const flags = chartLevelFlags(spec);
    const cellAttrs = buildCellAttrs(spec, dataVar);
    const cellAttrLines =
      cellAttrs.length > 0
        ? `\n          ${cellAttrs.join("\n          ")}`
        : "";

    return {
      preamble: buildPreamble(spec, dataVar),
      body: `data={${dataVar}}
    ${flags.length > 0 ? `${flags.join("\n    ")}\n    ` : ""}>
    <XAxis dataKey="${xField}" />
    <YAxis />
    <${mark} dataKey="${yField}"${curveTypeAttr(spec)}>
      {${dataVar}.map((row) => (
        <Cell
          key={String(row.${xField})}
          dataKey={String(row.${xField})}${cellAttrLines}
        />
      ))}
    </${mark}>
  </${chart}>`,
    };
  }

  const flags = chartLevelFlags(spec);

  return {
    body: `categories={${dataVar}.map((row) => String(row.${xField}))}
    series={[{ name: "${yField ?? "value"}", data: ${dataVar}.map((row) => Number(row.${yField})) }]}${flags.length > 0 ? `\n    ${flags.join("\n    ")}` : ""}`,
  };
}
