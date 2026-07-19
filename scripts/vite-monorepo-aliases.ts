import path from "node:path";
import type { Alias, AliasOptions } from "vite";

/**
 * Monorepo Vite aliases for workspace packages.
 *
 * Subpath exports (e.g. charts-spec/planning) MUST be listed before their parent
 * package alias. Otherwise Vite resolves against the wrong file under packages.
 */
export function axichartsMonorepoAliases(repoRoot: string): AliasOptions {
  const pkgSrc = (pkgDir: string) => path.resolve(repoRoot, "packages", pkgDir, "src");
  const pkgEntry = (pkgDir: string, name: string) =>
    path.resolve(repoRoot, "packages", pkgDir, "src", "entry", `${name}.ts`);

  const aliases: Alias[] = [
    // @axicharts/charts subpath exports (storybook + docs)
    { find: "@axicharts/charts/quick", replacement: pkgEntry("charts", "quick") },
    { find: "@axicharts/charts/cartesian", replacement: pkgEntry("charts", "cartesian") },
    { find: "@axicharts/charts/studio", replacement: pkgEntry("charts", "studio") },
    { find: "@axicharts/charts/calendar", replacement: pkgEntry("charts", "calendar") },
    { find: "@axicharts/charts/pictorial-bar", replacement: pkgEntry("charts", "pictorial-bar") },
    { find: "@axicharts/charts/liquid-fill", replacement: pkgEntry("charts", "liquid-fill") },
    { find: "@axicharts/charts/bump", replacement: pkgEntry("charts", "bump") },
    { find: "@axicharts/charts/violin", replacement: pkgEntry("charts", "violin") },
    { find: "@axicharts/charts/swarm", replacement: pkgEntry("charts", "swarm") },
    { find: "@axicharts/charts/ridgeline", replacement: pkgEntry("charts", "ridgeline") },
    { find: "@axicharts/charts/network", replacement: pkgEntry("charts", "network") },

    // @axicharts/charts-spec subpath exports (package.json exports field)
    { find: "@axicharts/charts-spec/planning", replacement: pkgEntry("charts-spec", "planning") },
    { find: "@axicharts/charts-spec/cartesian", replacement: pkgEntry("charts-spec", "cartesian") },
    { find: "@axicharts/charts-spec/distribution", replacement: pkgEntry("charts-spec", "distribution") },
    { find: "@axicharts/charts-spec/financial", replacement: pkgEntry("charts-spec", "financial") },
    { find: "@axicharts/charts-spec/matrix", replacement: pkgEntry("charts-spec", "matrix") },
    { find: "@axicharts/charts-spec/industrial", replacement: pkgEntry("charts-spec", "industrial") },
    { find: "@axicharts/charts-spec/kpi", replacement: pkgEntry("charts-spec", "kpi") },
    { find: "@axicharts/charts-spec/full", replacement: pkgEntry("charts-spec", "full") },

    // @axicharts/charts-planner subpath exports
    { find: "@axicharts/charts-planner/tabular", replacement: pkgEntry("charts-planner", "tabular") },

    // @axicharts/charts-runtime subpath exports
    {
      find: "@axicharts/charts-runtime/validation",
      replacement: path.resolve(repoRoot, "packages/charts-runtime/src/validation"),
    },

    // Parent package aliases — keep after all subpath exports above.
    { find: "@axicharts/charts", replacement: pkgSrc("charts") },
    { find: "@axicharts/charts-canvas", replacement: pkgSrc("charts-canvas") },
    { find: "@axicharts/charts-theme", replacement: pkgSrc("charts-theme") },
    { find: "@axicharts/charts-core", replacement: pkgSrc("charts-core") },
    { find: "@axicharts/charts-echarts", replacement: pkgSrc("charts-echarts") },
    { find: "@axicharts/charts-spec", replacement: pkgSrc("charts-spec") },
    { find: "@axicharts/charts-runtime", replacement: pkgSrc("charts-runtime") },
    { find: "@axicharts/charts-planner", replacement: pkgSrc("charts-planner") },
    { find: "@axicharts/charts-tank", replacement: pkgSrc("charts-tank") },
    { find: "@axicharts/charts-geo", replacement: pkgSrc("charts-geo") },
    { find: "@axicharts/charts-map", replacement: pkgSrc("charts-map") },
    { find: "@axicharts/charts-andon", replacement: pkgSrc("charts-andon") },
    { find: "@axicharts/charts-sankey", replacement: pkgSrc("charts-sankey") },
    { find: "@axicharts/charts-gantt", replacement: pkgSrc("charts-gantt") },

    // echarts-wordcloud registers on echarts/lib/echarts; align with charts-echarts runtime.
    {
      find: "echarts/lib/echarts",
      replacement: path.resolve(repoRoot, "packages/charts-echarts/src/echartsRuntime.ts"),
    },
  ];

  return aliases;
}
