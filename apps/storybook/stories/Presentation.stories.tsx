import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  BarChart,
  ChartContainer,
  LineChart,
  PieChart,
  Stat,
} from "@axicharts/charts";
import { presentationTheme } from "@axicharts/charts-theme";

const QUARTERS = ["Q1", "Q2", "Q3", "Q4"];
const REVENUE = [820, 932, 901, 1034];
const ARR_GROWTH = ((REVENUE[3]! - REVENUE[2]!) / REVENUE[2]!) * 100;

function KpiTile({ children }: { children: ReactElement }): ReactElement {
  return (
    <div
      style={{
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        borderRadius: 10,
        padding: "12px 14px",
      }}
    >
      {children}
    </div>
  );
}

function PresentationMockup(): ReactElement {
  return (
    <div
      style={{
        maxWidth: 720,
        border: "1px solid #e2e8f0",
        borderRadius: 12,
        background: "#ffffff",
        boxShadow: "0 12px 32px rgba(15, 23, 42, 0.08)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 18px",
          borderBottom: "1px solid #e2e8f0",
          background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
        }}
      >
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
            Q4 business review
          </div>
          <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
            Board deck · FY revenue & margin
          </div>
        </div>
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: "#1d4ed8",
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            borderRadius: 999,
            padding: "4px 10px",
          }}
        >
          Presentation
        </span>
      </div>

      <div style={{ padding: 18 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "200px 1fr",
            gap: 16,
            alignItems: "stretch",
            marginBottom: 16,
          }}
        >
          <KpiTile>
            <ChartContainer
              theme={presentationTheme}
              mode="presentation"
              width="100%"
              height={120}
            >
              <Stat value="62.4%" label="Gross margin" tone="success" surface="light" />
            </ChartContainer>
            <div
              style={{
                marginTop: 8,
                fontSize: 10,
                padding: "3px 8px",
                borderRadius: 999,
                display: "inline-block",
                background: "#ecfdf5",
                color: "#15803d",
              }}
            >
              +1.3 pts vs Q3
            </div>
          </KpiTile>
          <ChartContainer
            theme={presentationTheme}
            mode="presentation"
            width="100%"
            height={200}
          >
            <LineChart
              categories={QUARTERS}
              series={[{ name: "Revenue", data: REVENUE, tone: "info" }]}
              fill
              valueSuffix=" M"
            />
          </ChartContainer>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: "#0f172a" }}>
            ARR mix & quarterly bars
          </div>
          <span
            style={{
              fontSize: 10,
              padding: "3px 9px",
              borderRadius: 999,
              background: ARR_GROWTH >= 0 ? "#ecfdf5" : "#fff7ed",
              color: ARR_GROWTH >= 0 ? "#15803d" : "#c2410c",
            }}
          >
            Q4 {ARR_GROWTH >= 0 ? "+" : ""}
            {ARR_GROWTH.toFixed(1)}% QoQ
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 1fr",
            gap: 14,
            marginBottom: 10,
          }}
        >
          <ChartContainer
            theme={presentationTheme}
            mode="presentation"
            width="100%"
            height={200}
          >
            <BarChart
              categories={QUARTERS}
              series={[{ name: "ARR", data: REVENUE }]}
              showValues
              valueSuffix=" M"
            />
          </ChartContainer>
          <ChartContainer
            theme={presentationTheme}
            mode="presentation"
            width="100%"
            height={200}
          >
            <PieChart
              slices={[
                { name: "Enterprise", value: 58 },
                { name: "Mid-market", value: 27 },
                { name: "SMB", value: 15 },
              ]}
            />
          </ChartContainer>
        </div>

        <div
          style={{
            fontSize: 12,
            color: "#475569",
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            padding: "10px 12px",
            lineHeight: 1.5,
          }}
        >
          <strong style={{ color: "#0f172a" }}>Callout:</strong> Enterprise mix held at 58% while
          gross margin expanded — presentation mode uses bolder strokes, rounded bars, hero stat
          count-up, and enter fade on charts.
        </div>

        <p style={{ marginTop: 8, marginBottom: 0, fontSize: 11, color: "#64748b" }}>
          Source: finance · Q1–Q4 · revenue ($M), margin (%) · Y: value, X: quarter ·{" "}
          <code>presentationTheme</code> + <code>mode="presentation"</code>
        </p>
      </div>
    </div>
  );
}

const meta = {
  title: "Mockups/E · Presentation",
  component: PresentationMockup,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Round 4 design polish (5/5) — presentationTheme hero KPI with count-up, QoQ delta chips, bold line + bar + pie, deck callout, enter fade.",
      },
    },
  },
} satisfies Meta<typeof PresentationMockup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BoardDeck: Story = {
  render: () => <PresentationMockup />,
};
