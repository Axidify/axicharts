import type { PanelSpec } from "./types";

export const DEFAULT_PLUGINS_WALL_PANELS: PanelSpec[] = [
  {
    type: "tank",
    title: "Tank level",
    theme: "industrial",
    height: 200,
    width: 140,
    props: { level: 68, label: "Tank 2", warningAt: 75 },
  },
  {
    type: "geo",
    title: "Regional load",
    theme: "clean",
    height: 180,
    width: 260,
    props: {
      regions: [
        { id: "us-west", label: "West", value: 72, x: 8, y: 28, width: 72, height: 54 },
        { id: "us-mountain", label: "Mountain", value: 58, x: 84, y: 24, width: 56, height: 48 },
        { id: "us-midwest", label: "Midwest", value: 81, x: 142, y: 22, width: 58, height: 52 },
        { id: "us-south", label: "South", value: 64, x: 118, y: 78, width: 74, height: 58 },
        { id: "us-northeast", label: "Northeast", value: 91, x: 198, y: 18, width: 52, height: 46 },
      ],
      showScale: true,
    },
  },
  {
    type: "andon",
    title: "Line status",
    theme: "industrial",
    height: 180,
    width: 280,
    props: {
      columns: 2,
      stations: [
        { id: "st-01", label: "Feeder", status: "ok" },
        { id: "st-02", label: "Filler", status: "warning", detail: "Low hopper" },
        { id: "st-03", label: "Capper", status: "ok" },
        { id: "st-04", label: "Inspector", status: "fault", detail: "Reject high" },
      ],
    },
  },
  {
    type: "sankey",
    title: "Energy flow",
    theme: "clean",
    height: 200,
    width: 300,
    props: {
      nodes: [
        { name: "Solar" },
        { name: "Grid" },
        { name: "Boiler" },
        { name: "Line A" },
        { name: "Line B" },
        { name: "Losses" },
      ],
      links: [
        { source: "Solar", target: "Grid", value: 12 },
        { source: "Grid", target: "Boiler", value: 18 },
        { source: "Grid", target: "Line A", value: 22 },
        { source: "Grid", target: "Line B", value: 16 },
        { source: "Boiler", target: "Line A", value: 10 },
        { source: "Boiler", target: "Losses", value: 8 },
      ],
    },
  },
];
