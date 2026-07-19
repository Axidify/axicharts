import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const registryRoot = join(root, "registry");
const componentsDir = join(registryRoot, "components/charts");
const outputDir = join(root, "apps/docs/public/registry");

const chartsPkg = JSON.parse(
  readFileSync(join(root, "packages/charts/package.json"), "utf8"),
);
const version = chartsPkg.version;

const PEER_DOCS =
  "Peer deps (install in your app): react react-dom echarts uplot. Copy tokens.css from @axicharts/charts-theme for --chart-* CSS vars. Gallery: https://axidify.github.io/axicharts/shadcn";

const ITEMS = [
  {
    name: "chart-axi-bar",
    title: "AxiCharts Bar",
    description:
      "Composable bar chart via ChartContainer + chartConfig — shadcn Charts migration path.",
    file: "chart-axi-bar.tsx",
    target: "components/charts/chart-axi-bar.tsx",
  },
  {
    name: "chart-axi-line",
    title: "AxiCharts Line",
    description:
      "Line chart with optional area fill — ChartContainer + chartConfig pattern.",
    file: "chart-axi-line.tsx",
    target: "components/charts/chart-axi-line.tsx",
  },
  {
    name: "chart-axi-donut",
    title: "AxiCharts Donut",
    description: "Donut chart via PieChart innerRadius — browser-share style slice.",
    file: "chart-axi-donut.tsx",
    target: "components/charts/chart-axi-donut.tsx",
  },
  {
    name: "chart-axi-area",
    title: "AxiCharts Area",
    description: "Filled area chart — SLO / trend dashboards with chartConfig labels.",
    file: "chart-axi-area.tsx",
    target: "components/charts/chart-axi-area.tsx",
  },
  {
    name: "chart-axi-stacked-bar",
    title: "AxiCharts Stacked Bar",
    description: "Stacked bar chart — sprint velocity / multi-series totals via stacked prop.",
    file: "chart-axi-stacked-bar.tsx",
    target: "components/charts/chart-axi-stacked-bar.tsx",
  },
  {
    name: "chart-axi-combo",
    title: "AxiCharts Combo",
    description: "Mixed bar + line on shared categories — shadcn mixed chart pattern with chartConfig.",
    file: "chart-axi-combo.tsx",
    target: "components/charts/chart-axi-combo.tsx",
  },
  {
    name: "chart-axi-multi-line",
    title: "AxiCharts Multi-Line",
    description: "Multi-series line chart with chartConfig — burndown / trend comparison dashboards.",
    file: "chart-axi-multi-line.tsx",
    target: "components/charts/chart-axi-multi-line.tsx",
  },
  {
    name: "chart-axi-swarm",
    title: "AxiCharts Swarm",
    description: "Beeswarm / jittered strip plot per category — distribution density without KDE.",
    file: "chart-axi-swarm.tsx",
    target: "components/charts/chart-axi-swarm.tsx",
  },
  {
    name: "chart-axi-ridgeline",
    title: "AxiCharts Ridgeline",
    description: "Stacked horizontal KDE density curves per category — joyplot / ridgeline distribution.",
    file: "chart-axi-ridgeline.tsx",
    target: "components/charts/chart-axi-ridgeline.tsx",
  },
  {
    name: "chart-axi-chart-config",
    title: "AxiCharts chartConfig helper",
    description: "Shared ChartConfig labels/colors — import into registry chart blocks or your own panels.",
    type: "registry:lib",
    file: "axicharts-chart-config.ts",
    target: "lib/axicharts-chart-config.ts",
    libDir: join(registryRoot, "lib"),
  },
];

function buildItem(item) {
  const sourceDir = item.libDir ?? componentsDir;
  const content = readFileSync(join(sourceDir, item.file), "utf8");
  const type = item.type ?? "registry:block";
  return {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: item.name,
    type,
    title: item.title,
    description: item.description,
    categories: ["charts", "dashboard"],
    dependencies: [
      `@axicharts/charts@${version}`,
      `@axicharts/charts-theme@${version}`,
    ],
    registryDependencies: [],
    files: [
      {
        path: item.target,
        type: type === "registry:lib" ? "registry:lib" : "registry:component",
        content,
      },
    ],
    docs: PEER_DOCS,
  };
}

mkdirSync(outputDir, { recursive: true });

const builtItems = ITEMS.map((item) => {
  const registryItem = buildItem(item);
  writeFileSync(
    join(outputDir, `${item.name}.json`),
    `${JSON.stringify(registryItem, null, 2)}\n`,
  );
  return {
    name: item.name,
    type: registryItem.type,
    title: item.title,
    description: item.description,
    categories: registryItem.categories,
    dependencies: registryItem.dependencies,
    registryDependencies: registryItem.registryDependencies,
    files: registryItem.files.map(({ path, type }) => ({ path, type })),
  };
});

const registry = {
  $schema: "https://ui.shadcn.com/schema/registry.json",
  name: "axicharts",
  homepage: "https://axidify.github.io/axicharts/shadcn/registry",
  items: builtItems,
};

writeFileSync(join(outputDir, "registry.json"), `${JSON.stringify(registry, null, 2)}\n`);
writeFileSync(join(registryRoot, "registry.json"), `${JSON.stringify(registry, null, 2)}\n`);

const docsPublic = join(root, "apps/docs/public");
mkdirSync(docsPublic, { recursive: true });
copyFileSync(join(root, "apps/docs/badge.svg"), join(docsPublic, "badge.svg"));

console.log(`Built ${builtItems.length} registry items → apps/docs/public/registry/`);
