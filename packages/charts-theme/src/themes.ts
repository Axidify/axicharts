import type { ChartColorTokens } from "./cssTokens";

export type ChartTheme = {
  name: string;
  tokens?: ChartColorTokens;
  grid: {
    show: boolean;
    horizontal: boolean;
    vertical: boolean;
    opacity: number;
    strokeWidth: number;
  };
  axis: {
    show: boolean;
  };
  line: {
    strokeWidth: number;
    curve: "monotone" | "linear";
  };
  area: {
    show: boolean;
    fillOpacity: number;
  };
  bar: {
    radius: number;
    gap: number;
  };
  caption: {
    show: boolean;
  };
  values: {
    monospace: boolean;
  };
};

export type LineCurve = ChartTheme["line"]["curve"];

export type { ChartColorTokens } from "./cssTokens";

const baseGrid = {
  show: true,
  horizontal: true,
  vertical: false,
  opacity: 0.85,
  strokeWidth: 1,
};

export const cleanTheme: ChartTheme = {
  name: "clean",
  grid: { ...baseGrid },
  axis: { show: true },
  line: { strokeWidth: 2.25, curve: "monotone" },
  area: { show: true, fillOpacity: 0.24 },
  bar: { radius: 5, gap: 0.28 },
  caption: { show: true },
  values: { monospace: false },
};

export const liveTheme: ChartTheme = {
  name: "live",
  grid: { ...baseGrid, vertical: true, opacity: 0.55 },
  axis: { show: true },
  line: { strokeWidth: 2, curve: "monotone" },
  area: { show: true, fillOpacity: 0.2 },
  bar: { radius: 4, gap: 0.24 },
  caption: { show: true },
  values: { monospace: true },
};

export const industrialTheme: ChartTheme = {
  name: "industrial",
  grid: { ...baseGrid, vertical: true, opacity: 0.62 },
  axis: { show: true },
  line: { strokeWidth: 2, curve: "monotone" },
  area: { show: true, fillOpacity: 0.24 },
  bar: { radius: 4, gap: 0.24 },
  caption: { show: true },
  values: { monospace: true },
};

export const presentationTheme: ChartTheme = {
  name: "presentation",
  grid: { ...baseGrid, opacity: 0.55 },
  axis: { show: true },
  line: { strokeWidth: 3, curve: "monotone" },
  area: { show: true, fillOpacity: 0.28 },
  bar: { radius: 8, gap: 0.3 },
  caption: { show: true },
  values: { monospace: false },
};
