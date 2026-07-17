import type { ReactElement } from "react";

export type AndonStatus = "ok" | "warning" | "fault" | "offline" | "idle";

export type AndonStation = {
  id: string;
  label: string;
  status: AndonStatus;
  detail?: string;
};

const STATUS_STYLE: Record<
  AndonStatus,
  { fill: string; lamp: string; text: string }
> = {
  ok: { fill: "#14532d", lamp: "#22c55e", text: "#bbf7d0" },
  warning: { fill: "#713f12", lamp: "#f59e0b", text: "#fde68a" },
  fault: { fill: "#7f1d1d", lamp: "#ef4444", text: "#fecaca" },
  offline: { fill: "#1e293b", lamp: "#64748b", text: "#94a3b8" },
  idle: { fill: "#1e3a5f", lamp: "#3b82f6", text: "#bfdbfe" },
};

const STATUS_LABEL: Record<AndonStatus, string> = {
  ok: "Running",
  warning: "Warning",
  fault: "Fault",
  offline: "Offline",
  idle: "Idle",
};

export const SAMPLE_ANDON_STATIONS: AndonStation[] = [
  { id: "st-01", label: "Feeder", status: "ok" },
  { id: "st-02", label: "Labeler", status: "ok" },
  { id: "st-03", label: "Filler", status: "warning", detail: "Low hopper" },
  { id: "st-04", label: "Capper", status: "ok" },
  { id: "st-05", label: "Inspector", status: "fault", detail: "Reject high" },
  { id: "st-06", label: "Palletizer", status: "idle" },
  { id: "st-07", label: "Wrapper", status: "ok" },
  { id: "st-08", label: "Conveyor", status: "offline", detail: "Maint." },
];

export type AndonBoardProps = {
  stations: AndonStation[];
  columns?: number;
  width?: number;
  height?: number;
  gap?: number;
};

function resolveColumns(count: number, columns?: number): number {
  if (columns && columns > 0) return columns;
  if (count <= 4) return count;
  if (count <= 8) return 4;
  return 5;
}

export function AndonBoard({
  stations,
  columns,
  width = 360,
  height = 200,
  gap = 6,
}: AndonBoardProps): ReactElement {
  const cols = resolveColumns(stations.length, columns);
  const rows = Math.ceil(stations.length / cols) || 1;
  const pad = 8;
  const innerW = width - pad * 2;
  const innerH = height - pad * 2;
  const cellW = (innerW - gap * (cols - 1)) / cols;
  const cellH = (innerH - gap * (rows - 1)) / rows;
  const lampR = Math.min(cellW, cellH) * 0.09;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Production andon board"
    >
      <rect x={0} y={0} width={width} height={height} fill="#0f172a" rx={8} />
      {stations.map((station, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);
        const x = pad + col * (cellW + gap);
        const y = pad + row * (cellH + gap);
        const style = STATUS_STYLE[station.status];
        const lampCx = x + cellW / 2;
        const lampCy = y + cellH * 0.28;

        return (
          <g key={station.id}>
            <rect
              x={x}
              y={y}
              width={cellW}
              height={cellH}
              rx={6}
              fill={style.fill}
              stroke="#334155"
              strokeWidth={1}
            />
            <circle
              cx={lampCx}
              cy={lampCy}
              r={lampR * 1.6}
              fill={style.lamp}
              opacity={0.35}
            />
            <circle
              cx={lampCx}
              cy={lampCy}
              r={lampR}
              fill={style.lamp}
              stroke="#0f172a"
              strokeWidth={1.5}
            />
            <text
              x={x + cellW / 2}
              y={y + cellH * 0.56}
              textAnchor="middle"
              fill="#f8fafc"
              fontSize={11}
              fontWeight={600}
            >
              {station.label}
            </text>
            <text
              x={x + cellW / 2}
              y={y + cellH * 0.72}
              textAnchor="middle"
              fill={style.text}
              fontSize={9}
            >
              {station.detail ?? STATUS_LABEL[station.status]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
