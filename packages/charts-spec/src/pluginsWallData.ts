import type { PanelSpec } from "./types";

export const DEFAULT_PLUGINS_WALL_PANELS: PanelSpec[] = [
  {
    type: "tank",
    theme: "industrial",
    height: 200,
    width: 140,
    props: { level: 68, label: "Tank 2", warningAt: 75 },
  },
  {
    type: "geo",
    theme: "clean",
    height: 160,
    width: 200,
    props: {
      width: 200,
      height: 160,
      regions: [
        { id: "us-west", label: "West", value: 72, x: 8, y: 28, width: 72, height: 54 },
        { id: "us-midwest", label: "Midwest", value: 81, x: 142, y: 22, width: 58, height: 52 },
        { id: "us-south", label: "South", value: 64, x: 118, y: 78, width: 74, height: 58 },
      ],
    },
  },
  {
    type: "andon",
    theme: "industrial",
    height: 180,
    width: 280,
    props: {
      width: 280,
      height: 180,
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
    theme: "clean",
    height: 180,
    width: 280,
    props: {
      width: 280,
      height: 180,
      nodes: [
        { name: "Solar" },
        { name: "Grid" },
        { name: "Line A" },
        { name: "Line B" },
      ],
      links: [
        { source: "Solar", target: "Grid", value: 12 },
        { source: "Grid", target: "Line A", value: 22 },
        { source: "Grid", target: "Line B", value: 16 },
      ],
    },
  },
];
