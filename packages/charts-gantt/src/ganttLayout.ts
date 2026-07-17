export type GanttTone = "default" | "info" | "success" | "warning" | "critical";

export type GanttTask = {
  name: string;
  start: number;
  end: number;
  progress?: number;
  tone?: GanttTone;
};

export type GanttMilestone = {
  label: string;
  at: number;
  tone?: GanttTone;
};

const BAR: Record<GanttTone, string> = {
  default: "#3b82f6",
  info: "#06b6d4",
  success: "#22c55e",
  warning: "#f59e0b",
  critical: "#ef4444",
};

export function resolveRange(
  tasks: GanttTask[],
  milestones: GanttMilestone[],
  rangeStart?: number,
  rangeEnd?: number,
): [number, number] {
  const values = [
    ...tasks.flatMap((task) => [task.start, task.end]),
    ...milestones.map((item) => item.at),
  ];
  const min = rangeStart ?? Math.min(0, ...values);
  const max = rangeEnd ?? Math.max(1, ...values);
  return max > min ? [min, max] : [min, min + 1];
}

export function barGeometry(
  task: GanttTask,
  rowIndex: number,
  rowHeight: number,
  range: [number, number],
  plotX: number,
  plotW: number,
): { x: number; y: number; width: number; height: number; progressW: number } {
  const [min, max] = range;
  const span = max - min || 1;
  const y = rowIndex * rowHeight + 6;
  const height = rowHeight - 12;
  const x = plotX + ((task.start - min) / span) * plotW;
  const xEnd = plotX + ((task.end - min) / span) * plotW;
  const width = Math.max(xEnd - x, 4);
  const progress = Math.min(1, Math.max(0, task.progress ?? 1));
  return { x, y, width, height, progressW: width * progress };
}

export function toneColor(tone: GanttTone = "default"): string {
  return BAR[tone];
}
