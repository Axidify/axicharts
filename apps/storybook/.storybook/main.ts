import type { StorybookConfig } from "@storybook/react-vite";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mergeConfig } from "vite";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dirname, "../../..");

const config: StorybookConfig = {
  stories: ["../stories/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-essentials"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  async viteFinal(config) {
    return mergeConfig(config, {
      resolve: {
        alias: {
          "@axicharts/charts": path.resolve(root, "packages/charts/src"),
          "@axicharts/charts-canvas": path.resolve(
            root,
            "packages/charts-canvas/src",
          ),
          "@axicharts/charts-theme": path.resolve(
            root,
            "packages/charts-theme/src",
          ),
          "@axicharts/charts-core": path.resolve(
            root,
            "packages/charts-core/src",
          ),
          "@axicharts/charts-echarts": path.resolve(
            root,
            "packages/charts-echarts/src",
          ),
          "@axicharts/charts-spec": path.resolve(root, "packages/charts-spec/src"),
          "@axicharts/charts-runtime": path.resolve(
            root,
            "packages/charts-runtime/src",
          ),
          "@axicharts/charts-tank": path.resolve(root, "packages/charts-tank/src"),
          "@axicharts/charts-geo": path.resolve(root, "packages/charts-geo/src"),
          "@axicharts/charts-map": path.resolve(root, "packages/charts-map/src"),
          "@axicharts/charts-andon": path.resolve(root, "packages/charts-andon/src"),
          "@axicharts/charts-sankey": path.resolve(root, "packages/charts-sankey/src"),
          "@axicharts/charts-gantt": path.resolve(root, "packages/charts-gantt/src"),
          "@axicharts/charts-planner": path.resolve(root, "packages/charts-planner/src"),
          "@axicharts/charts-runtime/validation": path.resolve(
            root,
            "packages/charts-runtime/src/validation",
          ),
        },
      },
    });
  },
};

export default config;
