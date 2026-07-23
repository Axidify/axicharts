"use client";

import { useState, type ReactElement } from "react";
import { useChartLayout } from "@axicharts/charts";
import { resolvePluginHoverPalette } from "@axicharts/charts-theme";
import {
  barGeometry,
  resolveRange,
  toneColor,
  type GanttMilestone,
  type GanttTask,
} from "./ganttLayout";

export type GanttSurface = "light" | "dark";

export type GanttChartProps = {
  tasks: GanttTask[];
  milestones?: GanttMilestone[];
  unit?: string;
  rangeStart?: number;
  rangeEnd?: number;
  today?: number;
  surface?: GanttSurface;
};

function resolveSurface(
  explicit: GanttSurface | undefined,
  themeName: string | undefined,
): GanttSurface {
  if (explicit) return explicit;
  if (themeName === "live" || themeName === "industrial") return "dark";
  return "light";
}

function surfacePalette(surface: GanttSurface, theme?: { hover?: { taskDimOpacity?: number; dimOpacity?: number } }) {
  const hover = resolvePluginHoverPalette(surface, theme);
  if (surface === "dark") {
    return {
      canvas: "#0f172a",
      grid: "#334155",
      tick: "#94a3b8",
      label: "#e2e8f0",
      track: "#1e293b",
      hoverStroke: hover.hoverStroke,
      taskDimOpacity: hover.taskDimOpacity,
    };
  }
  return {
    canvas: "#ffffff",
    grid: "#e2e8f0",
    tick: "#64748b",
    label: "#334155",
    track: "#e2e8f0",
    hoverStroke: hover.hoverStroke,
    taskDimOpacity: hover.taskDimOpacity,
  };
}

export const SAMPLE_GANTT_PROGRAM: Pick<GanttChartProps, "tasks" | "milestones"> = {
  tasks: [
    { name: "Discovery", start: 0, end: 4, progress: 1, tone: "success" },
    { name: "Design", start: 3, end: 8, progress: 1, tone: "success" },
    { name: "Build", start: 7, end: 16, progress: 0.55, tone: "info" },
    { name: "QA", start: 14, end: 18, progress: 0.1, tone: "warning" },
  ],
  milestones: [{ label: "Beta", at: 12, tone: "warning" }],
};

export function GanttChart({
  tasks,
  milestones = [],
  unit = "d",
  rangeStart,
  rangeEnd,
  today,
  surface: surfaceProp,
}: GanttChartProps): ReactElement | null {
  const { size, ready, theme } = useChartLayout();
  const [hoverTask, setHoverTask] = useState<string | null>(null);
  const surface = resolveSurface(surfaceProp, theme.name);
  const palette = surfacePalette(surface, theme);

  if (!ready || size.width < 1 || size.height < 1 || tasks.length === 0) {
    return null;
  }

  const width = Math.floor(size.width);
  const height = Math.floor(size.height);
  const labelW = 120;
  const padTop = 24;
  const padBottom = 20;
  const plotX = labelW + 12;
  const plotW = width - plotX - 12;
  const rowHeight = Math.max(
    28,
    Math.floor((height - padTop - padBottom) / tasks.length),
  );
  const plotH = rowHeight * tasks.length;
  const range = resolveRange(tasks, milestones, rangeStart, rangeEnd);
  const [min, max] = range;
  const span = max - min || 1;
  const ticks = 5;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`Gantt chart with ${tasks.length} tasks`}
    >
      <rect x={0} y={0} width={width} height={height} fill={palette.canvas} rx={8} />

      {Array.from({ length: ticks + 1 }, (_, index) => {
        const value = min + (span * index) / ticks;
        const x = plotX + (plotW * index) / ticks;
        return (
          <g key={value}>
            <line
              x1={x}
              x2={x}
              y1={padTop}
              y2={padTop + plotH}
              stroke={palette.grid}
              strokeWidth={1}
            />
            <text
              x={x}
              y={padTop - 6}
              textAnchor="middle"
              fill={palette.tick}
              fontSize={10}
            >
              {value.toFixed(0)}
              {unit}
            </text>
          </g>
        );
      })}

      {today != null ? (
        <g>
          <line
            x1={plotX + ((today - min) / span) * plotW}
            x2={plotX + ((today - min) / span) * plotW}
            y1={padTop}
            y2={padTop + plotH}
            stroke={toneColor("info")}
            strokeWidth={2}
          />
          <text
            x={plotX + ((today - min) / span) * plotW + 4}
            y={padTop + 12}
            fill={toneColor("info")}
            fontSize={10}
            fontWeight={600}
          >
            Today
          </text>
        </g>
      ) : null}

      {milestones.map((milestone) => {
        const x = plotX + ((milestone.at - min) / span) * plotW;
        const color = toneColor(milestone.tone ?? "warning");
        return (
          <g key={milestone.label}>
            <line
              x1={x}
              x2={x}
              y1={padTop}
              y2={padTop + plotH}
              stroke={color}
              strokeWidth={1.5}
              strokeDasharray="4 3"
            />
            <text x={x + 4} y={padTop + 12} fill={color} fontSize={10}>
              {milestone.label}
            </text>
          </g>
        );
      })}

      {tasks.map((task, index) => {
        const geom = barGeometry(task, index, rowHeight, range, plotX, plotW);
        const y = padTop + geom.y;
        const color = toneColor(task.tone ?? "default");
        const active = hoverTask === task.name;
        const dimmed = hoverTask != null && !active;
        return (
          <g
            key={task.name}
            onMouseEnter={() => setHoverTask(task.name)}
            onMouseLeave={() => setHoverTask(null)}
            opacity={dimmed ? palette.taskDimOpacity : 1}
            style={{ cursor: "default" }}
          >
            <text
              x={8}
              y={y + geom.height / 2 + 4}
              fill={palette.label}
              fontSize={11}
              fontWeight={active ? 600 : 400}
            >
              {task.name}
            </text>
            <rect
              x={geom.x}
              y={y}
              width={geom.width}
              height={geom.height}
              rx={4}
              fill={palette.track}
            />
            <rect
              x={geom.x}
              y={y}
              width={geom.progressW}
              height={geom.height}
              rx={4}
              fill={color}
            />
            {active ? (
              <rect
                x={geom.x - 1}
                y={y - 1}
                width={geom.width + 2}
                height={geom.height + 2}
                rx={5}
                fill="none"
                stroke={palette.hoverStroke}
                strokeWidth={1.5}
              />
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}

export type { GanttMilestone, GanttTask, GanttTone } from "./ganttLayout";
