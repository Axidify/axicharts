export type ChartTheme = {
  name: string;
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

const baseGrid = {
  show: true,
  horizontal: true,
  vertical: false,
  opacity: 0.6,
  strokeWidth: 1,
};

export const cleanTheme: ChartTheme = {
  name: "clean",
  grid: { ...baseGrid },
  axis: { show: true },
  line: { strokeWidth: 2, curve: "monotone" },
  area: { show: true, fillOpacity: 0.18 },
  bar: { radius: 3, gap: 0.2 },
  caption: { show: true },
  values: { monospace: false },
};

export const liveTheme: ChartTheme = {
  name: "live",
  grid: { ...baseGrid, vertical: true },
  axis: { show: true },
  line: { strokeWidth: 2, curve: "monotone" },
  area: { show: true, fillOpacity: 0.18 },
  bar: { radius: 3, gap: 0.2 },
  caption: { show: true },
  values: { monospace: true },
};

export const industrialTheme: ChartTheme = {
  name: "industrial",
  grid: { ...baseGrid, vertical: true, opacity: 0.7 },
  axis: { show: true },
  line: { strokeWidth: 2, curve: "monotone" },
  area: { show: true, fillOpacity: 0.22 },
  bar: { radius: 3, gap: 0.2 },
  caption: { show: true },
  values: { monospace: true },
};

export const presentationTheme: ChartTheme = {
  name: "presentation",
  grid: { ...baseGrid, opacity: 0.3 },
  axis: { show: true },
  line: { strokeWidth: 3, curve: "monotone" },
  area: { show: true, fillOpacity: 0.22 },
  bar: { radius: 6, gap: 0.2 },
  caption: { show: true },
  values: { monospace: false },
};
