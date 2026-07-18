"use client";

import {
  CalendarHeatmapChart,
  ChartContainer,
  type CalendarHeatmapData,
} from "@axicharts/charts/calendar";
import { cleanTheme } from "@axicharts/charts-theme";

const SAMPLE_DATA: CalendarHeatmapData = {
  year: 2026,
  points: [
    { date: "2026-01-01", value: 2 },
    { date: "2026-01-02", value: 5 },
    { date: "2026-01-03", value: 1 },
    { date: "2026-01-04", value: 8 },
  ],
};

export function ChartAxiCalendar() {
  return (
    <ChartContainer theme={cleanTheme} height={220} width="100%">
      <CalendarHeatmapChart data={SAMPLE_DATA} />
    </ChartContainer>
  );
}
