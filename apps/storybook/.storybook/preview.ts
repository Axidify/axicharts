import type { Preview } from "@storybook/react";
import "../../../packages/charts-theme/tokens.css";
import "uplot/dist/uPlot.min.css";
import "./preview.css";

const preview: Preview = {
  parameters: {
    layout: "padded",
    backgrounds: {
      default: "industrial",
      values: [
        { name: "industrial", value: "#0b1220" },
        { name: "light", value: "#f8fafc" },
      ],
    },
  },
};

export default preview;
