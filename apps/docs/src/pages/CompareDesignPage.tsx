import type { ReactElement } from "react";
import { RechartsParityCompare } from "../../../storybook/demo/RechartsParityCompare";
import { DashboardAdjacentCompare } from "../../../storybook/demo/DashboardAdjacentCompare";
import { LaneCAdjacentCompare } from "../../../storybook/demo/LaneCAdjacentCompare";
import { CompareNav } from "../components/CompareNav";
import { docBodyStyle, docCardStyle, docColors } from "../styles/docTokens";

export function CompareDesignPage(): ReactElement {
  return (
    <div>
      <CompareNav />

      <div style={{ ...docCardStyle(), padding: 24, marginBottom: 24 }}>
        <h1 style={{ marginTop: 0 }}>AxiCharts vs Recharts — design parity</h1>
        <p style={docBodyStyle()}>
          Side-by-side comparison at axiboard tile size (<strong>360×280</strong>) using the same
          datasets and <code>cleanTheme</code>. Recharts is the visual north star — we are not
          copying its engine, but dashboard embeds should feel at home next to a well-built
          Recharts chart.
        </p>
        <p style={{ ...docBodyStyle(), marginBottom: 0 }}>
          Review each row and note gaps in chat. Design rules:{" "}
          <a
            href="https://github.com/Axidify/axicharts/blob/main/docs/chart-design-language.md"
            style={{ color: docColors.accent }}
          >
            chart-design-language.md
          </a>
          . Audit tracker:{" "}
          <a
            href="https://github.com/Axidify/axicharts/blob/main/docs/chart-design-audit.md"
            style={{ color: docColors.accent }}
          >
            chart-design-audit.md
          </a>
          .
        </p>
      </div>

      <div style={{ ...docCardStyle(), padding: 20, marginBottom: 24 }}>
        <RechartsParityCompare />
      </div>

      <div style={{ ...docCardStyle(), padding: 20, marginBottom: 24 }}>
        <DashboardAdjacentCompare />
      </div>

      <div style={{ ...docCardStyle(), padding: 20 }}>
        <LaneCAdjacentCompare />
      </div>
    </div>
  );
}
