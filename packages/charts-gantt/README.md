# @axicharts/charts-gantt

Community plugin — horizontal Gantt timelines for program and project dashboards.

Register via `import "@axicharts/charts-gantt/register"` and use `type: "gantt"` in spec panels, or render directly inside `ChartContainer`.

```tsx
import "@axicharts/charts-gantt/register";
import { ChartContainer } from "@axicharts/charts";
import { GanttChart } from "@axicharts/charts-gantt";

<ChartContainer height={240} width="100%">
  <GanttChart
    tasks={[
      { name: "Design", start: 0, end: 5, progress: 1 },
      { name: "Build", start: 4, end: 14, progress: 0.6, tone: "info" },
    ]}
    milestones={[{ label: "Beta", at: 10, tone: "warning" }]}
    unit="d"
  />
</ChartContainer>
```

Tasks use numeric start/end offsets (e.g. days from sprint start). Milestones render as vertical markers.
