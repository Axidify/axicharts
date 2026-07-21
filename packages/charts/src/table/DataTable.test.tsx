import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { DataTable } from "./DataTable";

describe("DataTable", () => {
  it("renders column headers and row values", () => {
    const { container } = render(
      <DataTable
        columns={[
          { key: "symbol", label: "Symbol" },
          { key: "qty", label: "Qty", align: "right", monospace: true },
        ]}
        rows={[
          { symbol: "AAPL", qty: 100 },
          { symbol: "MSFT", qty: 50 },
        ]}
        surface="dark"
      />,
    );

    expect(container.textContent).toContain("Symbol");
    expect(container.textContent).toContain("AAPL");
    expect(container.textContent).toContain("MSFT");
    expect(container.textContent).toContain("100");
  });

  it("applies tone colors from toneKey", () => {
    const { container } = render(
      <DataTable
        columns={[
          { key: "pnl", label: "P&L", toneKey: "pnlTone" },
        ]}
        rows={[{ pnl: "+$240", pnlTone: "success" }]}
        surface="light"
      />,
    );

    const cell = container.querySelector("td");
    expect(cell?.style.color).toBe("rgb(22, 163, 74)");
  });

  it("renders zebra rows and sticky header chrome", () => {
    const { container } = render(
      <DataTable
        columns={[
          { key: "device", label: "Device" },
          { key: "temp", label: "Temp", align: "right", monospace: true },
        ]}
        rows={[
          { device: "DEV001", temp: "24.1" },
          { device: "DEV002", temp: "27.3" },
        ]}
        surface="light"
        zebra
        stickyHeader
        maxHeight={200}
        compact
      />,
    );

    const header = container.querySelector("th");
    expect(header?.style.position).toBe("sticky");
    expect(header?.style.background).toBe("rgb(248, 250, 252)");
    const rows = container.querySelectorAll("tbody tr");
    expect(rows[1]?.style.background).toBe("rgb(248, 250, 252)");
  });
});
