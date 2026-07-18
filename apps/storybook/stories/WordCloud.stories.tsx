import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ChartContainer, WordCloudChart } from "@axicharts/charts";
import { cleanTheme } from "@axicharts/charts-theme";

const INCIDENT_TAGS = [
  { text: "timeout", value: 48, tone: "critical" as const },
  { text: "latency", value: 36, tone: "warning" as const },
  { text: "retry", value: 28, tone: "info" as const },
  { text: "auth", value: 22, tone: "default" as const },
  { text: "deploy", value: 18, tone: "success" as const },
  { text: "cache", value: 15 },
  { text: "queue", value: 12 },
  { text: "memory", value: 10 },
  { text: "disk", value: 8 },
  { text: "network", value: 7 },
];

const FEEDBACK_THEMES = [
  { text: "onboarding", value: 42 },
  { text: "pricing", value: 35 },
  { text: "performance", value: 31 },
  { text: "integrations", value: 24 },
  { text: "support", value: 19 },
  { text: "mobile", value: 16 },
  { text: "reporting", value: 14 },
  { text: "security", value: 11 },
];

const ALERT_KEYWORDS = [
  { text: "CPU", value: 52, tone: "critical" as const },
  { text: "OOM", value: 38, tone: "critical" as const },
  { text: "5xx", value: 29, tone: "warning" as const },
  { text: "p99", value: 24, tone: "warning" as const },
  { text: "disk", value: 18, tone: "info" as const },
  { text: "TLS", value: 12 },
  { text: "DNS", value: 9 },
];

function WordCloudWall(): ReactElement {
  return (
    <div style={{ display: "grid", gap: 24, maxWidth: 960 }}>
      <div>
        <ChartContainer theme={cleanTheme} height={320} width="100%">
          <WordCloudChart words={INCIDENT_TAGS} />
        </ChartContainer>
        <p style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
          C108 WordCloudChart — incident tag frequency via ECharts word cloud
        </p>
      </div>
      <div>
        <ChartContainer theme={cleanTheme} height={280} width="100%">
          <WordCloudChart words={FEEDBACK_THEMES} shape="cardioid" />
        </ChartContainer>
        <p style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
          Feedback themes — product survey keyword weights
        </p>
      </div>
      <div>
        <ChartContainer theme={cleanTheme} height={260} width="100%">
          <WordCloudChart words={ALERT_KEYWORDS} rotationRange={[-90, 90]} />
        </ChartContainer>
        <p style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
          Ops alert keywords — severity-toned terms from paging rules
        </p>
      </div>
    </div>
  );
}

const meta = {
  title: "Charts/WordCloud",
  component: WordCloudWall,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "C108 WordCloudChart — ECharts `wordCloud` via lazy `echarts-wordcloud` extension; spec `type: word-cloud` / `type: wordcloud` compile/eject.",
      },
    },
  },
} satisfies Meta<typeof WordCloudWall>;

export default meta;
type Story = StoryObj<typeof meta>;

export const IncidentAndFeedback: Story = {
  render: () => <WordCloudWall />,
};
