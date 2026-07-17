import { useState, type ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import type { TemplateId } from "@axicharts/charts-spec";
import { MosaicWall, TemplatePicker } from "@axicharts/charts-runtime";

const OPS_DATA = {
  categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  cells: [
    { title: "CPU", data: [22, 28, 31, 34, 30, 34, 32], suffix: "%" },
    { title: "Memory", data: [55, 58, 60, 59, 61, 62, 61], suffix: "%" },
    { title: "Errors", data: [1, 2, 5, 3, 2, 4, 3], suffix: "/min", tone: "warning" },
    { title: "p95", data: [42, 38, 55, 49, 62, 58, 71], suffix: "ms" },
  ],
};

const FINANCE_DATA = {
  kpis: [
    { value: "$1.33M", label: "Net revenue" },
    { value: "62.4%", label: "Gross margin", tone: "success" },
    { value: "+18%", label: "QoQ growth" },
  ],
  waterfall: [
    { name: "Q1", value: 1100000, isTotal: true },
    { name: "New ARR", value: 240000 },
    { name: "Churn", value: -80000, tone: "critical" },
    { name: "Q2", value: 1330000, isTotal: true },
  ],
  categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  revenue: [820, 932, 901, 1034, 1290, 1330],
};

const LINE_DATA = {
  kpis: [
    { value: "98.2%", label: "Uptime" },
    { value: "1.2k", label: "Units/hr" },
  ],
  categories: ["08:00", "09:00", "10:00", "11:00", "12:00"],
  series: [{ name: "Throughput", data: [980, 1020, 1100, 1180, 1210] }],
};

const meta = {
  title: "Runtime/Mosaic",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "C4 mosaic wall — multi-template control-room layout with shared data binding and template picker.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const ControlRoomWall: Story = {
  render: (): ReactElement => (
    <MosaicWall
      wall={{
        title: "Plant overview",
        subtitle: "Mosaic · shared static bind",
        theme: "industrial",
        columns: 2,
        data: {
          ops: OPS_DATA,
          finance: FINANCE_DATA,
          line: LINE_DATA,
        },
        cells: [
          {
            id: "ops",
            template: "ops-2x2",
            title: "Line 3",
            dataPath: "ops",
          },
          {
            id: "finance",
            template: "finance-pnl",
            title: "P&L",
            dataPath: "finance",
          },
          {
            id: "line",
            template: "line-overview",
            title: "Throughput",
            dataPath: "line",
            colSpan: 2,
          },
        ],
      }}
    />
  ),
};

function TemplatePickerDemo(): ReactElement {
  const [template, setTemplate] = useState<TemplateId>("ops-2x2");

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <TemplatePicker value={template} onChange={setTemplate} />
      <MosaicWall
        wall={{
          columns: 1,
          theme: template === "ops-2x2" ? "industrial" : "clean",
          mode: "interactive",
          cells: [
            {
              id: "primary",
              template,
              title: "Selected template",
              data:
                template === "finance-pnl"
                  ? FINANCE_DATA
                  : template === "line-overview"
                    ? LINE_DATA
                    : OPS_DATA,
            },
          ],
        }}
      />
    </div>
  );
}

export const TemplatePickerWall: Story = {
  render: (): ReactElement => <TemplatePickerDemo />,
};
