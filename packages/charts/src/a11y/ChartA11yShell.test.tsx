/** @vitest-environment jsdom */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { buildCartesianA11yDescriptor } from "./cartesianDescriptor";
import { ChartA11yShell } from "./ChartA11yShell";

describe("ChartA11yShell", () => {
  const descriptor = buildCartesianA11yDescriptor({
    chartType: "bar",
    categories: ["Mon", "Tue"],
    series: [{ name: "Signups", data: [42, 58] }],
  });

  it("keeps role=img when a11y options are omitted", () => {
    const { container } = render(
      <ChartA11yShell descriptor={descriptor} ariaLabel="Signups">
        <div>plot</div>
      </ChartA11yShell>,
    );
    expect(container.querySelector('[role="img"]')).toBeTruthy();
    expect(screen.queryByRole("button", { name: /data table/i })).toBeNull();
  });

  it("renders data table toggle and keyboard region when enabled", () => {
    const { container } = render(
      <ChartA11yShell
        descriptor={descriptor}
        ariaLabel="Signups"
        a11y={{
          keyboardNavigation: true,
          dataTable: true,
        }}
      >
        <div>plot</div>
      </ChartA11yShell>,
    );
    expect(container.querySelector('[role="group"]')).toBeTruthy();
    expect(screen.getByRole("button", { name: /view data table/i })).toBeTruthy();
    expect(screen.getByRole("application")).toBeTruthy();
  });
});
