"use client";

import type { ReactElement } from "react";
import { useChartLayout } from "@axicharts/charts";
import {
  barGeometry,
  resolveRange,
  toneColor,
  type GanttMilestone,
  type GanttTask,
} from "./ganttLayout";

export type GanttChartProps = {
  tasks: GanttTask[];
  milestones?: GanttMilestone[];
  unit?: string;
  rangeStart?: number;
  rangeEnd?: number;
};

export function GanttChart({
  tasks,
  milestones = [],
  unit = "d",
  rangeStart,
  rangeEnd,
}: GanttChartProps): ReactElement | null {
  const { size, ready } = useChartLayout();

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
              stroke="#e2e8f0"
              strokeWidth={1}
            />
            <text
              x={x}
              y={padTop - 6}
              textAnchor="middle"
              fill="#64748b"
              fontSize={10}
            >
              {value.toFixed(0)}
              {unit}
            </text>
          </g>
        );
      })}

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
            <text
              x={x + 4}
              y={padTop + 12}
              fill={color}
              fontSize={10}
            >
              {milestone.label}
            </text>
          </g>
        );
      })}

      {tasks.map((task, index) => {
        const geom = barGeometry(task, index, rowHeight, range, plotX, plotW);
        const y = padTop + geom.y;
        const color = toneColor(task.tone ?? "default");
        return (
          <g key={task.name}>
            <text
              x={8}
              y={y + geom.height / 2 + 4}
              fill="#334155"
              fontSize={11}
            >
              {task.name}
            </text>
            <rect
              x={geom.x}
              y={y}
              width={geom.width}
              height={geom.height}
              rx={4}
              fill="#e2e8f0"
            />
            <rect
              x={geom.x}
              y={y}
              width={geom.progressW}
              height={geom.height}
              rx={4}
              fill={color}
            />
          </g>
        );
      })}
    </svg>
  );
}

export type { GanttMilestone, GanttTask, GanttTone } from "./ganttLayout";
