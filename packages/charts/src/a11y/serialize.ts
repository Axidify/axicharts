import type { ChartA11yDescriptor } from "./types";

const A11Y_ATTR = "data-axicharts-a11y";

export function serializeA11yDescriptor(descriptor: ChartA11yDescriptor): string {
  return JSON.stringify(descriptor);
}

export function parseA11yDescriptor(raw: string): ChartA11yDescriptor | null {
  try {
    const parsed = JSON.parse(raw) as ChartA11yDescriptor;
    if (!parsed || typeof parsed !== "object" || !("kind" in parsed)) {
      return null;
    }
    if (parsed.kind === "cartesian") {
      if (!Array.isArray(parsed.categories) || !Array.isArray(parsed.series)) {
        return null;
      }
      return parsed;
    }
    if (parsed.kind === "single-value") {
      if (typeof parsed.title !== "string" || typeof parsed.value !== "string") {
        return null;
      }
      return parsed;
    }
    if (parsed.kind === "pie") {
      if (!Array.isArray(parsed.slices)) {
        return null;
      }
      return parsed;
    }
    if (parsed.kind === "candlestick") {
      if (!Array.isArray(parsed.categories) || !Array.isArray(parsed.data)) {
        return null;
      }
      return parsed;
    }
    if (parsed.kind === "heatmap") {
      if (
        !Array.isArray(parsed.xCategories) ||
        !Array.isArray(parsed.yCategories) ||
        !Array.isArray(parsed.values)
      ) {
        return null;
      }
      return parsed;
    }
    if (parsed.kind === "funnel") {
      if (!Array.isArray(parsed.stages)) {
        return null;
      }
      return parsed;
    }
    if (parsed.kind === "hierarchy") {
      if (!Array.isArray(parsed.items)) {
        return null;
      }
      return parsed;
    }
    if (parsed.kind === "parallel") {
      if (!Array.isArray(parsed.dimensions) || !Array.isArray(parsed.series)) {
        return null;
      }
      return parsed;
    }
    if (parsed.kind === "theme-river") {
      if (!Array.isArray(parsed.points)) {
        return null;
      }
      return parsed;
    }
    if (parsed.kind === "word-cloud") {
      if (!Array.isArray(parsed.words)) {
        return null;
      }
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function resolveChartA11y(target: HTMLElement): ChartA11yDescriptor | null {
  const node =
    target.hasAttribute(A11Y_ATTR) ? target : (
      target.querySelector<HTMLElement>(`[${A11Y_ATTR}]`)
    );
  if (!node) {
    return null;
  }
  const raw = node.getAttribute(A11Y_ATTR);
  if (!raw) {
    return null;
  }
  return parseA11yDescriptor(raw);
}

export const CHART_A11Y_ATTR = A11Y_ATTR;
