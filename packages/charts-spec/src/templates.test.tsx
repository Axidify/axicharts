import { describe, expect, it } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { registerBuiltinChartTypes } from "@axicharts/charts/registry";
import { registerTankChart } from "@axicharts/charts-tank";
import { compileTemplate, listTemplates } from "./templates";

describe("listTemplates", () => {
  it("includes program-dashboard and C91 vertical templates", () => {
    expect(listTemplates()).toContain("program-dashboard");
    expect(listTemplates()).toContain("sre-incident");
    expect(listTemplates()).toContain("saas-growth");
  });
});

describe("programDashboardTemplate", () => {
  it("compiles burndown and gantt panels", () => {
    registerBuiltinChartTypes();

    const view = compileTemplate("program-dashboard", {});
    const { container } = render(view);
    expect(container.textContent).toContain("Points left");
    expect(container.textContent).toContain("Velocity");
    expect(container.textContent).toContain("On-time");
  });
});

describe("sreIncidentTemplate", () => {
  it("renders incident KPIs and alert table", () => {
    registerBuiltinChartTypes();
    const view = compileTemplate("sre-incident", {});
    const { container } = render(view);
    expect(container.textContent).toContain("MTTR");
    expect(container.textContent).toContain("Open incidents");
    expect(container.textContent).toContain("payments-api");
  });
});

describe("saasGrowthTemplate", () => {
  it("renders growth KPIs and funnel", () => {
    registerBuiltinChartTypes();
    const view = compileTemplate("saas-growth", {
      weekly: { categories: ["W1", "W2", "W3", "W4"], values: [62000, 68000, 71000, 74000] },
    });
    const { container } = render(view);
    expect(container.textContent).toContain("MRR");
    expect(container.textContent).toContain("Active users");
    expect(container.textContent).toContain("Churn");
  });
});

describe("pluginsWallTemplate", () => {
  it("compiles registered plugin panels from template data", () => {
    registerBuiltinChartTypes();
    registerTankChart();

    const view = compileTemplate("plugins-wall", {
      panels: [
        {
          type: "tank",
          title: "Storage",
          theme: "industrial",
          height: 200,
          width: 140,
          props: { level: 55, label: "Tank 9" },
        },
      ],
    });

    const { container } = render(view);
    expect(container.textContent).toContain("Storage");
    expect(container.textContent).toContain("Tank 9");
    expect(container.textContent).toContain("55%");
  });

  it("compiles geo and sankey panels without manual register imports", async () => {
    const view = compileTemplate("plugins-wall", {
      panels: [
        {
          type: "geo",
          title: "Regional load",
          height: 180,
          width: 260,
          props: {
            regions: [{ id: "west", label: "West", value: 72, x: 8, y: 28, width: 72, height: 54 }],
          },
        },
        {
          type: "sankey",
          title: "Energy flow",
          height: 200,
          width: 300,
          props: {
            nodes: [{ name: "Solar" }, { name: "Grid" }],
            links: [{ source: "Solar", target: "Grid", value: 12 }],
          },
        },
      ],
    });

    const { container } = render(view);
    await waitFor(() => {
      expect(container.textContent).toContain("West");
      expect(container.querySelector('[aria-label="Sankey flow diagram"]')).toBeTruthy();
    });
  });
});
