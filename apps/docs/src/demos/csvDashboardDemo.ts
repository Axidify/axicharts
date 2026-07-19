export const SAMPLE_CSV = `week,cpu,memory,p95,errors
W1,42,68,120,2
W2,38,71,115,1
W3,55,64,98,0
W4,49,70,105,3`;

export const PARSE_CSV_CODE = `function parseCsv(text: string): Record<string, string | number>[] {
  const lines = text.trim().split(/\\r?\\n/).filter(Boolean);
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cells = line.split(",").map((c) => c.trim());
    const row: Record<string, string | number> = {};
    headers.forEach((header, i) => {
      const raw = cells[i] ?? "";
      const num = Number(raw);
      row[header] = raw !== "" && Number.isFinite(num) ? num : raw;
    });
    return row;
  });
}`;

export const PROFILE_FROM_ROWS_CODE = `import type { DataProfile } from "@axicharts/charts-spec";

const TIME_FIELD = /^(time|date|week|month|day|timestamp|ts)$/i;

export function profileFromRows(rows: Record<string, unknown>[]): DataProfile {
  const fields = rows.length > 0 ? Object.keys(rows[0]) : [];
  const metrics = fields
    .filter((name) => !TIME_FIELD.test(name))
    .filter((name) => rows.some((row) => typeof row[name] === "number"))
    .map((name) => ({ name }));

  return { metrics, fields };
}`;

export const PLAN_CODE = `import { planFromIntent } from "@axicharts/charts-planner";

const plan = planFromIntent(profile, "Static CSV snapshot batch report");
// plan.feed === "static"
// plan.panels[].encoding.x.field === "week" (from profile.fields, planner 0.2.1 + spec 0.4.3+)`;

export const RENDER_PANELS_CODE = `import { Chart } from "@axicharts/charts-spec/cartesian";

export function CsvDashboard({ plan, rows }: { plan: DashboardPlan; rows: Row[] }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: 16,
      }}
    >
      {plan.panels.map((panel) => (
        <Chart key={panel.title} panel={panel} data={{ rows }} height={240} />
      ))}
    </div>
  );
}`;

export const INSTALL_MINIMAL_CODE = `pnpm add \\
  @axicharts/charts \\
  @axicharts/charts-spec \\
  @axicharts/charts-planner@0.2.1 \\
  @axicharts/charts-theme \\
  uplot`;

export const INSTALL_FULL_CODE = `# All chart types + runtime embed (~1.6MB prod — only if you need pie/geo/sankey)
pnpm add @axicharts/charts-full`;
