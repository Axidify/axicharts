import type { PanelSpec } from "./types";

export const DEFAULT_PROGRAM_DASHBOARD_DATA = {
  kpis: [
    { value: "34", label: "Points left", tone: "warning" as const },
    { value: "28", label: "Velocity", tone: "success" as const },
    { value: "92%", label: "On-time", tone: "info" as const },
  ],
  burndown: {
    categories: ["D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "D10"],
    remaining: [120, 108, 96, 88, 74, 68, 58, 52, 44, 34],
    ideal: [120, 108, 96, 84, 72, 60, 48, 36, 24, 12],
  },
  velocity: {
    categories: ["S1", "S2", "S3", "S4"],
    done: [22, 26, 24, 28],
    carry: [6, 4, 5, 3],
  },
  status: {
    slices: [
      { name: "Done", value: 48, tone: "success" as const },
      { name: "In progress", value: 22, tone: "info" as const },
      { name: "Blocked", value: 6, tone: "critical" as const },
      { name: "Backlog", value: 34, tone: "default" as const },
    ],
  },
  funnel: {
    stages: [
      { name: "Ideas", value: 120 },
      { name: "Scoped", value: 84 },
      { name: "In dev", value: 52 },
      { name: "Shipped", value: 38 },
    ],
  },
  gantt: {
    tasks: [
      { name: "Discovery", start: 0, end: 4, progress: 1, tone: "success" as const },
      { name: "Design", start: 3, end: 8, progress: 1, tone: "success" as const },
      { name: "Build", start: 7, end: 16, progress: 0.55, tone: "info" as const },
      { name: "QA", start: 14, end: 18, progress: 0.1, tone: "warning" as const },
    ],
    milestones: [{ label: "Beta", at: 12, tone: "warning" as const }],
  },
};

export const PROGRAM_DASHBOARD_PANELS: PanelSpec[] = [
  { type: "stat", props: { value: "34", label: "Points left", tone: "warning" } },
  { type: "stat", props: { value: "28", label: "Velocity", tone: "success" } },
  { type: "stat", props: { value: "92%", label: "On-time", tone: "info" } },
  {
    type: "line",
    title: "Burndown",
    fill: true,
    props: {
      categories: DEFAULT_PROGRAM_DASHBOARD_DATA.burndown.categories,
      series: [
        {
          name: "Remaining",
          data: DEFAULT_PROGRAM_DASHBOARD_DATA.burndown.remaining,
          tone: "warning",
        },
        {
          name: "Ideal",
          data: DEFAULT_PROGRAM_DASHBOARD_DATA.burndown.ideal,
          tone: "default",
        },
      ],
      thresholdBands: [{ min: 0, max: 40, label: "Scope floor", tone: "critical" }],
    },
  },
  {
    type: "bar",
    title: "Velocity",
    stacked: true,
    props: {
      categories: DEFAULT_PROGRAM_DASHBOARD_DATA.velocity.categories,
      series: [
        { name: "Done", data: DEFAULT_PROGRAM_DASHBOARD_DATA.velocity.done, tone: "success" },
        { name: "Carry-over", data: DEFAULT_PROGRAM_DASHBOARD_DATA.velocity.carry, tone: "warning" },
      ],
    },
  },
  {
    type: "donut",
    title: "Status mix",
    props: {
      slices: DEFAULT_PROGRAM_DASHBOARD_DATA.status.slices,
    },
  },
  {
    type: "funnel",
    title: "Delivery funnel",
    props: { stages: DEFAULT_PROGRAM_DASHBOARD_DATA.funnel.stages },
  },
  {
    type: "gantt",
    title: "Timeline",
    height: 220,
    props: DEFAULT_PROGRAM_DASHBOARD_DATA.gantt,
  },
];
