import { describe, expect, it } from "vitest";
import { aggregateRows } from "./aggregateRows";
import { createTablePanel } from "./createTablePanel";
import { inferFieldRoles } from "./inferFieldRoles";
import { parseTabular } from "./parseTabular";

const LEDGER_ROWS = [
  {
    Date: "2026-07-01",
    Category: "Sales",
    "Debit (RM)": 0,
    "Credit (RM)": 8500,
    "Payment Method": "Bank Transfer",
  },
  {
    Date: "2026-07-02",
    Category: "Office Expense",
    "Debit (RM)": 3500,
    "Credit (RM)": 0,
    "Payment Method": "Bank Transfer",
  },
  {
    Date: "2026-07-05",
    Category: "Software",
    "Debit (RM)": 320,
    "Credit (RM)": 0,
    "Payment Method": "Credit Card",
  },
];

describe("inferFieldRoles", () => {
  it("assigns ledger column roles", () => {
    const roles = inferFieldRoles(LEDGER_ROWS);
    expect(roles.find((r) => r.name === "Date")?.role).toBe("time");
    expect(roles.find((r) => r.name === "Category")?.role).toBe("dimension");
    expect(roles.find((r) => r.name === "Debit (RM)")?.role).toBe("measure");
    expect(roles.find((r) => r.name === "Payment Method")?.role).toBe("dimension");
  });

  it("assigns attendance column roles (C153)", () => {
    const rows = parseTabular(`| Employee ID | Department | Date | Hours | Status |
| --- | --- | --- | ---: | --- |
| EMP001 | IT | 2026-07-18 | 9.3 | Present |`);
    const roles = inferFieldRoles(rows);
    expect(roles.find((r) => r.name === "Employee ID")?.role).toBe("identifier");
    expect(roles.find((r) => r.name === "Hours")?.role).toBe("measure");
  });
});

describe("aggregateRows", () => {
  it("groups payment method volume", () => {
    const rows = aggregateRows(LEDGER_ROWS, {
      groupBy: "Payment Method",
      aggregates: {
        volume: { op: "sum", fields: ["Debit (RM)", "Credit (RM)"] },
        debit: { op: "sum", field: "Debit (RM)" },
      },
    });

    const bank = rows.find((r) => r["Payment Method"] === "Bank Transfer");
    expect(bank?.volume).toBe(12000);
    expect(bank?.debit).toBe(3500);
  });

  it("filters rows with where before grouping", () => {
    const rows = aggregateRows(LEDGER_ROWS, {
      groupBy: "Category",
      where: [{ field: "Debit (RM)", op: "gt", value: 0 }],
      aggregates: {
        debit: { op: "sum", field: "Debit (RM)" },
      },
    });

    expect(rows).toHaveLength(2);
    expect(rows.find((row) => row.Category === "Sales")).toBeUndefined();
  });
});

describe("parseTabular", () => {
  it("parses pipe-delimited ledger text", () => {
    const rows = parseTabular(`Date | Category | Debit (RM) | Credit (RM)
2026-07-01 | Sales | 0 | 8,500.00
2026-07-02 | Office | 3,500.00 | 0`);
    expect(rows).toHaveLength(2);
    expect(rows[0]?.["Credit (RM)"]).toBe(8500);
    expect(rows[1]?.["Debit (RM)"]).toBe(3500);
  });
});

describe("createTablePanel", () => {
  it("returns a table panel with default ledger columns", () => {
    const panel = createTablePanel({ title: "GL" });
    expect(panel.type).toBe("table");
    expect(panel.title).toBe("GL");
    expect(panel.props?.columns).toBeTruthy();
  });
});
