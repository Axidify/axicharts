import type { ChartTheme } from "@axicharts/charts-theme";

export type SessionShading = boolean | "rth";

export type SessionMarkAreaBand = {
  name: string;
  startIndex: number;
  endIndex: number;
  color: string;
};

const TIME_RE = /^(\d{1,2}):(\d{2})$/;

function parseMinutes(label: string): number | null {
  const match = TIME_RE.exec(label.trim());
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

function isTimeCategory(categories: string[]): boolean {
  return categories.length > 0 && categories.every((label) => parseMinutes(label) != null);
}

function sessionBandColor(theme: ChartTheme, kind: "premarket" | "afterhours"): string {
  const dark = theme.name === "live" || theme.name === "industrial";
  if (kind === "premarket") {
    return dark ? "rgba(59, 130, 246, 0.08)" : "rgba(59, 130, 246, 0.06)";
  }
  return dark ? "rgba(245, 158, 11, 0.08)" : "rgba(245, 158, 11, 0.06)";
}

/**
 * Build pre-market / after-hours markArea bands for intraday time categories (HH:MM).
 * `sessionShading: "rth"` shades bars outside regular trading hours (09:30–16:00 ET).
 */
export function buildSessionMarkAreas(
  categories: string[],
  sessionShading: SessionShading,
  theme: ChartTheme,
): SessionMarkAreaBand[] {
  if (!sessionShading || categories.length < 2 || !isTimeCategory(categories)) {
    return [];
  }

  const openMinutes = 9 * 60 + 30;
  const closeMinutes = 16 * 60;
  const bands: SessionMarkAreaBand[] = [];

  let preEnd = -1;
  for (let index = 0; index < categories.length; index += 1) {
    const minutes = parseMinutes(categories[index]!)!;
    if (minutes < openMinutes) {
      preEnd = index;
      continue;
    }
    break;
  }
  if (preEnd >= 0) {
    bands.push({
      name: "Pre-market",
      startIndex: 0,
      endIndex: preEnd,
      color: sessionBandColor(theme, "premarket"),
    });
  }

  let afterStart = -1;
  for (let index = categories.length - 1; index >= 0; index -= 1) {
    const minutes = parseMinutes(categories[index]!)!;
    if (minutes >= closeMinutes) {
      afterStart = index;
      continue;
    }
    break;
  }
  if (afterStart >= 0) {
    bands.push({
      name: "After-hours",
      startIndex: afterStart,
      endIndex: categories.length - 1,
      color: sessionBandColor(theme, "afterhours"),
    });
  }

  return bands;
}

export function sessionMarkAreaToECharts(
  categories: string[],
  bands: SessionMarkAreaBand[],
): Array<[{ xAxis: string }, { xAxis: string }]> {
  return bands.map((band) => [
    {
      xAxis: categories[band.startIndex]!,
      itemStyle: { color: band.color },
      name: band.name,
    },
    { xAxis: categories[band.endIndex]! },
  ]);
}
