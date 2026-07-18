import { useEffect, useMemo, useState, type ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  ChartContainer,
  CalendarHeatmapChart,
  type CalendarHeatmapData,
  type CalendarHeatmapPoint,
} from "@axicharts/charts";
import { compilePanel } from "@axicharts/charts-spec";
import { cleanTheme } from "@axicharts/charts-theme";
import activityFixture from "../../../packages/charts-spec/examples/calendar-activity.panel.json";

const YEAR = 2026;

function seededValue(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return Math.floor((x - Math.floor(x)) * 12);
}

function buildYearActivity(year: number): CalendarHeatmapPoint[] {
  const points: CalendarHeatmapPoint[] = [];
  const cursor = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);

  while (cursor <= end) {
    const month = cursor.getMonth() + 1;
    const day = cursor.getDate();
    const date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    points.push({ date, value: seededValue(year * 1000 + month * 31 + day) });
    cursor.setDate(cursor.getDate() + 1);
  }

  return points;
}

function buildFixtureRows(): Record<string, unknown>[] {
  const end = new Date(YEAR, 6, 18);
  const rows: Record<string, unknown>[] = [];

  for (let index = 89; index >= 0; index -= 1) {
    const date = new Date(end);
    date.setDate(end.getDate() - index);
    const iso = date.toISOString().slice(0, 10);
    rows.push({
      date: iso,
      count: seededValue(index * 17 + 3),
    });
  }

  return rows;
}

const STATIC_DATA: CalendarHeatmapData = {
  year: YEAR,
  points: buildYearActivity(YEAR),
};

function CalendarHeatmapStaticDemo(): ReactElement {
  return (
    <div style={{ maxWidth: 820 }}>
      <ChartContainer theme={cleanTheme} height={220} width="100%">
        <CalendarHeatmapChart data={STATIC_DATA} />
      </ChartContainer>
      <p style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
        C123 calendar heatmap — synthetic commit-style activity for {YEAR}
      </p>
    </div>
  );
}

function CalendarHeatmapLiveDemo(): ReactElement {
  const [data, setData] = useState<CalendarHeatmapData>(STATIC_DATA);
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setData((current) => ({
        ...current,
        points: current.points.map((point) =>
          point.date === today
            ? { ...point, value: point.value + 1 }
            : point,
        ),
      }));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [today]);

  return (
    <div style={{ maxWidth: 820 }}>
      <ChartContainer theme={cleanTheme} height={220} width="100%" mode="live">
        <CalendarHeatmapChart data={data} />
      </ChartContainer>
      <p style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
        Live mode — today&apos;s cell increments @ 1 Hz via `mergeOption`
      </p>
    </div>
  );
}

function CalendarHeatmapSpecDemo(): ReactElement {
  const panel = useMemo(
    () => compilePanel(activityFixture, buildFixtureRows()),
    [],
  );

  return (
    <div style={{ maxWidth: 820 }}>
      {panel}
      <p style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
        Spec-compiled from `calendar-activity.panel.json` (90-day synthetic rows)
      </p>
    </div>
  );
}

const meta = {
  title: "Charts/Calendar heatmap",
  component: CalendarHeatmapStaticDemo,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "C123 Calendar heatmap — ECharts calendar coordinate + heatmap series; GitHub-style daily metrics; spec `type: calendar`.",
      },
    },
  },
} satisfies Meta<typeof CalendarHeatmapStaticDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const StaticYear: Story = {
  render: () => <CalendarHeatmapStaticDemo />,
};

export const LiveToday: Story = {
  render: () => <CalendarHeatmapLiveDemo />,
};

export const SpecFixture: Story = {
  render: () => <CalendarHeatmapSpecDemo />,
};
