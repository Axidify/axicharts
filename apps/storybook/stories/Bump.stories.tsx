import { useEffect, useMemo, useState, type ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  BumpChart,
  ChartContainer,
  type BumpChartData,
} from "@axicharts/charts/bump";
import { compilePanel } from "@axicharts/charts-spec";
import { cleanTheme } from "@axicharts/charts-theme";
import bumpFixture from "../../../packages/charts-spec/examples/bump-country-rankings.panel.json";

const countryRankings: BumpChartData = {
  categories: ["2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025"],
  series: [
    { name: "USA", ranks: [1, 1, 1, 1, 1, 1, 1, 1] },
    { name: "China", ranks: [2, 2, 2, 2, 2, 2, 2, 2] },
    { name: "Germany", ranks: [4, 4, 3, 3, 3, 3, 3, 3] },
    { name: "Japan", ranks: [3, 3, 4, 4, 4, 4, 4, 4] },
    { name: "UK", ranks: [5, 5, 5, 5, 5, 5, 5, 5] },
  ],
};

const longFormRows = [
  { year: "2018", country: "USA", rank: 1 },
  { year: "2018", country: "China", rank: 2 },
  { year: "2018", country: "Japan", rank: 3 },
  { year: "2018", country: "Germany", rank: 4 },
  { year: "2018", country: "UK", rank: 5 },
  { year: "2019", country: "USA", rank: 1 },
  { year: "2019", country: "China", rank: 2 },
  { year: "2019", country: "Germany", rank: 3 },
  { year: "2019", country: "Japan", rank: 4 },
  { year: "2019", country: "UK", rank: 5 },
  { year: "2020", country: "USA", rank: 1 },
  { year: "2020", country: "China", rank: 2 },
  { year: "2020", country: "Germany", rank: 3 },
  { year: "2020", country: "Japan", rank: 4 },
  { year: "2020", country: "UK", rank: 5 },
  { year: "2021", country: "USA", rank: 1 },
  { year: "2021", country: "China", rank: 2 },
  { year: "2021", country: "Germany", rank: 3 },
  { year: "2021", country: "Japan", rank: 4 },
  { year: "2021", country: "UK", rank: 5 },
  { year: "2022", country: "USA", rank: 1 },
  { year: "2022", country: "China", rank: 2 },
  { year: "2022", country: "Germany", rank: 3 },
  { year: "2022", country: "Japan", rank: 4 },
  { year: "2022", country: "UK", rank: 5 },
  { year: "2023", country: "USA", rank: 1 },
  { year: "2023", country: "China", rank: 2 },
  { year: "2023", country: "Germany", rank: 3 },
  { year: "2023", country: "Japan", rank: 4 },
  { year: "2023", country: "UK", rank: 5 },
  { year: "2024", country: "USA", rank: 1 },
  { year: "2024", country: "China", rank: 2 },
  { year: "2024", country: "Germany", rank: 3 },
  { year: "2024", country: "Japan", rank: 4 },
  { year: "2024", country: "UK", rank: 5 },
  { year: "2025", country: "USA", rank: 1 },
  { year: "2025", country: "China", rank: 2 },
  { year: "2025", country: "Germany", rank: 3 },
  { year: "2025", country: "Japan", rank: 4 },
  { year: "2025", country: "UK", rank: 5 },
];

function shuffleRanks(ranks: number[]): number[] {
  const next = [...ranks];
  const last = next.length - 1;
  const a = Math.floor(Math.random() * next.length);
  let b = Math.floor(Math.random() * next.length);
  while (b === a) {
    b = Math.floor(Math.random() * next.length);
  }
  [next[a], next[b]] = [next[b], next[a]];
  return next;
}

function BumpStaticDemo(): ReactElement {
  return (
    <div style={{ maxWidth: 720 }}>
      <ChartContainer theme={cleanTheme} height={360} width={640}>
        <BumpChart data={countryRankings} />
      </ChartContainer>
      <p style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
        C127 bump chart — country GDP ranking over time (rank 1 at top)
      </p>
    </div>
  );
}

function BumpLiveDemo(): ReactElement {
  const [data, setData] = useState(countryRankings);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setData((current) => {
        const last = current.categories.length - 1;
        const shuffled = shuffleRanks(
          current.series.map((item) => item.ranks[last] ?? item.ranks.at(-1) ?? 1),
        );
        return {
          ...current,
          series: current.series.map((item, index) => ({
            ...item,
            ranks: [
              ...item.ranks.slice(0, last),
              shuffled[index] ?? item.ranks[last] ?? 1,
            ],
          })),
        };
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div style={{ maxWidth: 720 }}>
      <ChartContainer theme={cleanTheme} height={360} width={640} mode="live">
        <BumpChart data={data} />
      </ChartContainer>
      <p style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
        Live mode — shuffles the latest period&apos;s ranks @ 1 Hz
      </p>
    </div>
  );
}

function BumpSpecDemo(): ReactElement {
  const rows = useMemo(() => longFormRows, []);
  const panel = useMemo(() => compilePanel(bumpFixture, rows), [rows]);

  return (
    <div style={{ maxWidth: 720 }}>
      {panel}
      <p style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
        Spec-compiled from `bump-country-rankings.panel.json`
      </p>
    </div>
  );
}

const meta = {
  title: "Charts/Bump chart",
  component: BumpStaticDemo,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "C127 Bump chart — ranking-over-time lines with inverted y-axis; spec `type: bump`.",
      },
    },
  },
} satisfies Meta<typeof BumpStaticDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CountryRankings: Story = {
  render: () => <BumpStaticDemo />,
};

export const LiveRankShuffle: Story = {
  render: () => <BumpLiveDemo />,
};

export const SpecFixture: Story = {
  render: () => <BumpSpecDemo />,
};
