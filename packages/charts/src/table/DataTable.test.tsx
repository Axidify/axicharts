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
});
