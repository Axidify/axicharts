import type { PanelSpec } from "./types";

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

export function ejectCartesianChartName(spec: PanelSpec): string {
  return resolveChartName(spec.type);
}

export function ejectCartesianImports(spec: PanelSpec): string[] {
  if (!cartesianHasColorEncoding(spec)) {
    return [ejectCartesianChartName(spec)];
  }

  const mark = markName(spec.type);
  return [ejectCartesianChartName(spec), mark, "Cell", "XAxis", "YAxis"];
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
  const colorField = encoding?.color?.field;

  if (colorField) {
    const mark = markName(spec.type);
    const chart = resolveChartName(spec.type);
    const flags = [
      spec.fill && spec.type !== "bar" ? "fill" : "",
      spec.stacked ? "stacked" : "",
      spec.valueSuffix ? `valueSuffix="${spec.valueSuffix}"` : "",
      spec.props?.showValues === true ? "showValues" : "",
    ].filter(Boolean);

    return {
      preamble: COLOR_FILL_HELPER,
      body: `data={${dataVar}}
    ${flags.length > 0 ? `${flags.join("\n    ")}\n    ` : ""}>
    <XAxis dataKey="${xField}" />
    <YAxis />
    <${mark} dataKey="${yField}">
      {${dataVar}.map((row) => (
        <Cell
          key={String(row.${xField})}
          dataKey={String(row.${xField})}
          fill={resolveColorFill(row.${colorField})}
        />
      ))}
    </${mark}>
  </${chart}>`,
    };
  }

  const flags = [
    spec.fill ? "fill" : "",
    spec.stacked ? "stacked" : "",
    spec.valueSuffix ? `valueSuffix="${spec.valueSuffix}"` : "",
  ].filter(Boolean);

  return {
    body: `categories={${dataVar}.map((row) => String(row.${xField}))}
    series={[{ name: "${yField ?? "value"}", data: ${dataVar}.map((row) => Number(row.${yField})) }]}${flags.length > 0 ? `\n    ${flags.join("\n    ")}` : ""}`,
  };
}
