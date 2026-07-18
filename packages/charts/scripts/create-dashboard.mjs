#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const CATEGORIES = [
  "cartesian",
  "distribution",
  "financial",
  "matrix",
  "industrial",
  "kpi",
];

const PRESETS = ["full", "studio"];

const TOKENS_CSS = `:root {
  --chart-1: 221 83% 53%;
  --chart-2: 188 94% 35%;
  --chart-3: 142 71% 36%;
  --chart-4: 32 95% 44%;
  --chart-5: 262 83% 58%;
  --chart-grid: hsl(214 32% 91% / 0.95);
  --chart-axis: hsl(215 16% 47%);
  --chart-area-fill: hsl(var(--chart-1) / 0.18);
  --chart-alarm-warning: 32 95% 44%;
  --chart-alarm-critical: 0 72% 51%;
  --chart-stale: 215 16% 47%;
}

@media (prefers-color-scheme: dark) {
  :root {
    --chart-grid: hsl(215 20% 22% / 0.8);
    --chart-axis: hsl(215 20% 65%);
    --chart-area-fill: hsl(var(--chart-1) / 0.2);
  }
}
`;

const GLOBAL_CSS = `*,
*::before,
*::after {
  box-sizing: border-box;
}

html,
body,
#root {
  margin: 0;
  min-height: 100%;
}

body {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  line-height: 1.5;
  color: #e2e8f0;
  background: radial-gradient(circle at top, #1e293b 0%, #0f172a 55%, #020617 100%);
}

main {
  width: min(960px, 100%);
  margin: 0 auto;
  padding: clamp(16px, 4vw, 32px);
}

h1 {
  margin: 0 0 8px;
  font-size: clamp(1.5rem, 2.5vw, 2rem);
  font-weight: 700;
  letter-spacing: -0.02em;
}

.lead {
  margin: 0 0 24px;
  color: #94a3b8;
  font-size: 0.95rem;
}

.card {
  width: 100%;
  padding: clamp(16px, 3vw, 24px);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.72);
  box-shadow: 0 24px 48px rgba(2, 6, 23, 0.35);
  backdrop-filter: blur(8px);
}
`;

function categorySample(category) {
  switch (category) {
    case "distribution":
      return {
        imports: `import { ChartContainer, PieChart } from "@axicharts/charts/distribution";`,
        chart: `      <ChartContainer mode="static" height={280} width="100%">
        <PieChart
          slices={[
            { name: "Alpha", value: 42 },
            { name: "Beta", value: 28 },
            { name: "Gamma", value: 18 },
            { name: "Delta", value: 12 },
          ]}
          showLabels
        />
      </ChartContainer>`,
        peerNote: "distribution",
      };
    case "financial":
      return {
        imports: `import { ChartContainer, WaterfallChart } from "@axicharts/charts/financial";`,
        chart: `      <ChartContainer mode="static" height={280} width="100%">
        <WaterfallChart
          items={[
            { name: "Revenue", value: 120 },
            { name: "COGS", value: -45 },
            { name: "Opex", value: -30 },
            { name: "Net", value: 45, isTotal: true },
          ]}
          valueFormat="currency"
        />
      </ChartContainer>`,
        peerNote: "financial",
      };
    case "matrix":
      return {
        imports: `import { ChartContainer, HeatmapChart } from "@axicharts/charts/matrix";`,
        chart: `      <ChartContainer mode="static" height={280} width="100%">
        <HeatmapChart
          matrix={{
            xCategories: ["Mon", "Tue", "Wed", "Thu", "Fri"],
            yCategories: ["A", "B", "C"],
            values: [
              [12, 18, 9, 14, 11],
              [8, 15, 20, 10, 16],
              [14, 11, 13, 19, 7],
            ],
          }}
        />
      </ChartContainer>`,
        peerNote: "matrix",
      };
    case "industrial":
      return {
        imports: `import { ChartContainer, Gauge } from "@axicharts/charts/industrial";`,
        chart: `      <ChartContainer mode="static" height={220} width="100%">
        <Gauge value={72} min={0} max={100} label="Tank level" unit="%" />
      </ChartContainer>`,
        peerNote: "industrial",
      };
    case "kpi":
      return {
        imports: `import { ChartContainer, Stat } from "@axicharts/charts/kpi";`,
        chart: `      <ChartContainer mode="static" height={160} width="100%">
        <Stat value="99.95%" label="Availability (30d)" tone="success" surface="dark" />
      </ChartContainer>`,
        peerNote: "kpi",
      };
    case "cartesian":
    default:
      return {
        imports: `import { QuickLineChart } from "@axicharts/charts/quick";`,
        chart: `      <QuickLineChart
        title="p95 latency"
        labels={["Mon", "Tue", "Wed", "Thu", "Fri"]}
        data={[42, 38, 55, 49, 62]}
      />`,
        peerNote: "cartesian",
      };
  }
}

function packageJson(targetDir, category, preset = null) {
  const needsEcharts =
    preset === "full" || ["distribution", "financial", "matrix"].includes(category);
  const dependencies =
    preset === "full"
      ? {
          "@axicharts/charts-full": "latest",
          react: "^19.0.0",
          "react-dom": "^19.0.0",
          uplot: "^1.6.31",
          echarts: "^5.6.0",
        }
      : {
          "@axicharts/charts": "latest",
          "@axicharts/charts-theme": "latest",
          react: "^19.0.0",
          "react-dom": "^19.0.0",
          uplot: "^1.6.31",
        };
  if (needsEcharts && preset !== "full") {
    dependencies.echarts = "^5.6.0";
  }

  return JSON.stringify(
    {
      name: path.basename(targetDir),
      private: true,
      type: "module",
      scripts: {
        dev: "vite",
        build: "vite build",
        preview: "vite preview",
      },
      dependencies,
      devDependencies: {
        "@types/react": "^19.0.10",
        "@types/react-dom": "^19.0.4",
        "@vitejs/plugin-react": "^4.3.4",
        typescript: "^5.8.2",
        vite: "^6.2.0",
      },
    },
    null,
    2,
  );
}

function studioSample() {
  return {
    imports: `import { StudioLineChart } from "@axicharts/charts/studio";
import "@axicharts/charts-theme/studio-tokens.css";`,
    chart: `      <div data-theme="studio">
        <StudioLineChart
          title="p95 latency"
          labels={["Mon", "Tue", "Wed", "Thu", "Fri"]}
          data={[42, 38, 55, 49, 62]}
        />
      </div>`,
    peerNote: "studio",
  };
}

function fullSample() {
  return {
    imports: `import { ChartContainer, LineChart } from "@axicharts/charts-full";
import { cleanTheme } from "@axicharts/charts-full/theme";`,
    chart: `      <ChartContainer theme={cleanTheme} mode="static" height={280} width="100%">
        <LineChart
          categories={["Mon", "Tue", "Wed", "Thu", "Fri"]}
          series={[{ name: "p95", data: [42, 38, 55, 49, 62] }]}
          fill
        />
      </ChartContainer>`,
    peerNote: "full",
  };
}

function appTsx(category, preset = null) {
  const sample =
    preset === "full"
      ? fullSample()
      : preset === "studio"
        ? studioSample()
        : categorySample(category);
  return `${sample.imports}
import "./tokens.css";

export function App() {
  return (
    <main>
      <h1>My dashboard</h1>
      <p className="lead">
        Scaffolded with AxiCharts — ${preset ? "preset" : "category"} <code>${preset ?? category}</code>.
      </p>
      <section className="card" style={{ width: "100%" }}>
${sample.chart}
      </section>
    </main>
  );
}
`;
}

export function parseCreateDashboardArgs(argv = process.argv.slice(2)) {
  let category = "cartesian";
  let preset = null;
  const positional = [];

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--preset" || arg === "-p") {
      const value = argv[index + 1];
      if (!value || !PRESETS.includes(value)) {
        throw new Error(
          `Invalid --preset. Expected one of: ${PRESETS.join(", ")}`,
        );
      }
      preset = value;
      index += 1;
      continue;
    }
    if (arg.startsWith("--preset=")) {
      const value = arg.slice("--preset=".length);
      if (!PRESETS.includes(value)) {
        throw new Error(
          `Invalid --preset. Expected one of: ${PRESETS.join(", ")}`,
        );
      }
      preset = value;
      continue;
    }
    if (arg === "--category" || arg === "-c") {
      const value = argv[index + 1];
      if (!value || !CATEGORIES.includes(value)) {
        throw new Error(
          `Invalid --category. Expected one of: ${CATEGORIES.join(", ")}`,
        );
      }
      category = value;
      index += 1;
      continue;
    }
    if (arg.startsWith("--category=")) {
      const value = arg.slice("--category=".length);
      if (!CATEGORIES.includes(value)) {
        throw new Error(
          `Invalid --category. Expected one of: ${CATEGORIES.join(", ")}`,
        );
      }
      category = value;
      continue;
    }
    positional.push(arg);
  }

  return {
    targetDir: positional[0] ?? "axicharts-dashboard",
    category: preset === "full" ? "full" : preset === "studio" ? "studio" : category,
    preset,
  };
}

export function buildDashboardFiles(targetDir, category = "cartesian", preset = null) {
  return {
    "package.json": packageJson(targetDir, category, preset),
    "index.html": `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AxiCharts Dashboard</title>
    <link rel="stylesheet" href="/src/global.css" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`,
    "vite.config.ts": `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
});
`,
    "tsconfig.json": JSON.stringify(
      {
        compilerOptions: {
          target: "ES2022",
          lib: ["ES2022", "DOM", "DOM.Iterable"],
          module: "ESNext",
          moduleResolution: "Bundler",
          jsx: "react-jsx",
          strict: true,
          skipLibCheck: true,
        },
        include: ["src"],
      },
      null,
      2,
    ),
    "src/main.tsx": `import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
`,
    "src/App.tsx": appTsx(category, preset),
    "src/tokens.css": TOKENS_CSS,
    "src/global.css": GLOBAL_CSS,
    "README.md": `# ${path.basename(targetDir)}

Scaffolded with \`npx @axicharts/charts create-dashboard\` (${preset === "full" ? "preset: **full**" : `category: **${category}**`}).

\`\`\`bash
pnpm install
pnpm dev
\`\`\`

## Next steps

${preset === "full"
  ? `- Import charts from \`@axicharts/charts-full\` and themes from \`@axicharts/charts-full/theme\`
- Add spec/runtime via \`@axicharts/charts-full/spec\` and \`@axicharts/charts-full/runtime\`
- For smaller bundles, switch to category subpaths (\`@axicharts/charts/cartesian\`, etc.)`
  : preset === "studio"
    ? `- Import from \`@axicharts/charts/studio\` for editorial SVG defaults
- Apply \`@axicharts/charts-theme/studio-tokens.css\` and \`data-theme="studio"\` on containers
- Switch to \`@axicharts/charts/cartesian\` when you need composable control`
    : `- Import from \`@axicharts/charts/${category}\` for tree-shaken category APIs
- Use \`@axicharts/charts/quick\` for a one-component line chart hello-world
- Wire \`src/tokens.css\` \`--chart-*\` vars to match your design system
- Add more panels with \`ChartContainer\` + chart components from the same category subpath`}
`,
  };
}

export async function scaffoldDashboard(targetDir, category = "cartesian", preset = null) {
  const files = buildDashboardFiles(targetDir, category, preset);
  const resolvedDir = path.resolve(targetDir);

  await mkdir(resolvedDir, { recursive: true });
  await mkdir(path.join(resolvedDir, "src"), { recursive: true });

  for (const [file, content] of Object.entries(files)) {
    const filePath = path.join(resolvedDir, file);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, content);
  }

  return { targetDir, category, preset };
}

export function formatNextSteps(targetDir, category, preset = null) {
  if (preset === "full") {
    return [
      `Created ${targetDir} (preset: full)`,
      "Next:",
      `  cd ${targetDir}`,
      "  pnpm install",
      "  pnpm dev",
      "",
      "Imports:",
      "  @axicharts/charts-full         — all chart components",
      "  @axicharts/charts-full/theme   — cleanTheme, tokens",
      "  @axicharts/charts-full/spec    — compilePanel, ejectPanel",
      "  @axicharts/charts-full/runtime — mosaic presets, embed SDK",
    ].join("\n");
  }

  if (preset === "studio") {
    return [
      `Created ${targetDir} (preset: studio)`,
      "Next:",
      `  cd ${targetDir}`,
      "  pnpm install",
      "  pnpm dev",
      "",
      "Imports:",
      "  @axicharts/charts/studio              — StudioLineChart, StudioBarChart",
      "  @axicharts/charts-theme/studio-tokens.css — refined palette",
    ].join("\n");
  }

  return [
    `Created ${targetDir} (${category})`,
    "Next:",
    `  cd ${targetDir}`,
    "  pnpm install",
    "  pnpm dev",
    "",
    "Imports:",
    `  @axicharts/charts/${category}  — category bundle`,
    "  @axicharts/charts/quick       — one-line line chart (cartesian)",
    "",
    "Batteries-included install:",
    "  npx @axicharts/charts create-dashboard my-app --preset full",
    "",
    "Rescaffold another category:",
    `  npx @axicharts/charts create-dashboard ops-board --category distribution`,
  ].join("\n");
}

const isMain =
  process.argv[1] &&
  (process.argv[1].endsWith("create-dashboard.mjs") ||
    process.argv[1].endsWith("bin/create-dashboard.mjs"));

if (isMain) {
  try {
    const { targetDir, category, preset } = parseCreateDashboardArgs();
    await scaffoldDashboard(targetDir, category, preset);
    console.log(formatNextSteps(targetDir, category, preset));
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
