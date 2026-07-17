import type { ReactElement } from "react";
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import type { PanelProps } from "./AxiPanel";

type RechartsRow = { x: string; y: number };

export function RechartsPanel({ categories, values }: PanelProps): ReactElement {
  const data: RechartsRow[] = categories.map((x, index) => ({
    x,
    y: values[index] ?? 0,
  }));

  return (
    <LineChart width={320} height={120} data={data}>
      <XAxis dataKey="x" hide />
      <YAxis hide domain={["auto", "auto"]} />
      <Line
        type="monotone"
        dataKey="y"
        dot={false}
        isAnimationActive={false}
        stroke="#3b82f6"
        strokeWidth={2}
      />
    </LineChart>
  );
}
