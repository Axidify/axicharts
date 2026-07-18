import { useMemo, type ReactElement } from "react";
import { buildSingleValueA11yDescriptor } from "../a11y/singleValueDescriptor";
import { SingleValueChartA11yRoot } from "../a11y/SingleValueChartA11yRoot";
import { useOptionalChartLayout } from "../container/useOptionalChartLayout";

export type LampStatus = "running" | "stopped" | "fault" | "idle" | "warning";

const LAMP_COLORS: Record<LampStatus, { fill: string; glow: string }> = {
  running: { fill: "#22c55e", glow: "rgba(34, 197, 94, 0.45)" },
  stopped: { fill: "#64748b", glow: "rgba(100, 116, 139, 0.25)" },
  fault: { fill: "#ef4444", glow: "rgba(239, 68, 68, 0.5)" },
  idle: { fill: "#3b82f6", glow: "rgba(59, 130, 246, 0.35)" },
  warning: { fill: "#f59e0b", glow: "rgba(245, 158, 11, 0.45)" },
};

const STATUS_LABEL: Record<LampStatus, string> = {
  running: "Running",
  stopped: "Stopped",
  fault: "Fault",
  idle: "Idle",
  warning: "Warning",
};

export type StatusLampProps = {
  status: LampStatus;
  label?: string;
};

export function StatusLamp({ status, label }: StatusLampProps): ReactElement {
  const layout = useOptionalChartLayout();
  const width = layout?.ready ? layout.size.width : 120;
  const height = layout?.ready ? layout.size.height : 72;
  const colors = LAMP_COLORS[status];
  const cx = width / 2;
  const cy = height * 0.42;
  const r = Math.min(width, height) * 0.16;
  const text = label ?? STATUS_LABEL[status];
  const descriptor = useMemo(
    () =>
      buildSingleValueA11yDescriptor({
        title: text,
        value: STATUS_LABEL[status],
        description: `Status: ${status}`,
      }),
    [status, text],
  );

  return (
    <SingleValueChartA11yRoot descriptor={descriptor}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        aria-hidden="true"
      >
        <circle cx={cx} cy={cy} r={r * 1.8} fill={colors.glow} />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill={colors.fill}
          stroke="#0f172a"
          strokeWidth={2}
        />
        <circle
          cx={cx - r * 0.28}
          cy={cy - r * 0.28}
          r={r * 0.22}
          fill="rgba(255,255,255,0.35)"
        />
        <text
          x={cx}
          y={cy + r + 18}
          textAnchor="middle"
          fill="#94a3b8"
          fontSize={11}
        >
          {text}
        </text>
      </svg>
    </SingleValueChartA11yRoot>
  );
}
